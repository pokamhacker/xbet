/**
 * Plateau de jeu : grille 5×5 qui défile, échelle des multiplicateurs, réticule, avion, explosions.
 * Le composant expose des commandes d'animation (PlayFieldHandle) que le contrôleur de partie
 * appelle dans l'ordre ; chaque commande renvoie une promesse résolue à la fin de l'animation.
 */
import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';

import { COLS, MAX_LEVEL, STRIP_ROWS, VISIBLE_ROWS } from '../game/config';
import { cellCenter, clamp, multiplier } from '../game/engine';
import { multText } from '../game/format';
import { dur, isReducedMotion } from '../game/motion';
import { COLORS, GRADIENTS } from '../theme';
import { Badge, DashedLine, PlaneArt, ReticleArt } from './art';
import { Explosion } from './Explosion';

export interface CellRef {
  col: number;
  level: number;
}

export interface PlayFieldHandle {
  getWinStart(): number;
  /** Remet le plateau à zéro (niveau 1 en bas, ni avion ni réticule). */
  reset(): void;
  /** Affiche le réticule sur une case, sans déplacement. */
  placeReticle(col: number, level: number): void;
  moveReticle(col: number, level: number, ms: number): Promise<void>;
  hideReticle(): void;
  /** Fait défiler la grille pour que `level` devienne la ligne du bas. */
  scrollTo(level: number): Promise<void>;
  flyPlane(col: number, level: number, ms: number): Promise<void>;
  hidePlane(): void;
  /** L'avion repart vers le haut de l'écran (encaissement). */
  planeExit(ms: number): Promise<void>;
  explode(col: number, level: number, big: boolean): Promise<void>;
  shake(): void;
}

interface Props {
  cell: number;
  activeLevel: number;
  shown: Readonly<Record<number, readonly number[]>>;
  picked: CellRef | null;
  interactive: boolean;
  onPick: (col: number) => void;
}

interface Boom extends CellRef {
  id: number;
  big: boolean;
}

const BORDER = 3;
const GAP = 8;
const EASE_MOVE = Easing.bezier(0.3, 0.8, 0.3, 1);
const EASE_FLY = Easing.bezier(0.35, 0.1, 0.25, 1);
const EASE_SCROLL = Easing.bezier(0.5, 0.05, 0.25, 1);

const run = (a: Animated.CompositeAnimation) => new Promise<void>(resolve => a.start(() => resolve()));
const to = (v: Animated.Value, toValue: number, ms: number, easing = EASE_MOVE) =>
  Animated.timing(v, { toValue, duration: dur(ms), easing, useNativeDriver: true });

export const PlayField = forwardRef<PlayFieldHandle, Props>(function PlayField(
  { cell, activeLevel, shown, picked, interactive, onPick },
  ref,
) {
  const [winStart, setWinStart] = useState(1);
  const [booms, setBooms] = useState<Boom[]>([]);

  const winRef = useRef(1);
  const cellRef = useRef(cell);
  cellRef.current = cell;

  const stripY = useRef(new Animated.Value(0)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const retX = useRef(new Animated.Value(0)).current;
  const retY = useRef(new Animated.Value(0)).current;
  const retO = useRef(new Animated.Value(0)).current;
  const planeX = useRef(new Animated.Value(0)).current;
  const planeY = useRef(new Animated.Value(0)).current;
  const planeR = useRef(new Animated.Value(0)).current;
  const planeS = useRef(new Animated.Value(1)).current;
  const planeO = useRef(new Animated.Value(0)).current;

  const retPos = useRef<CellRef | null>(null);
  const planePos = useRef<CellRef | null>(null);
  const pendingScroll = useRef<(() => void) | null>(null);
  const boomWaiters = useRef(new Map<number, () => void>());
  const boomSeq = useRef(0);

  const at = (p: CellRef) => cellCenter(p.col, p.level, winRef.current, cellRef.current);

  const reposition = () => {
    if (retPos.current) {
      const p = at(retPos.current);
      retX.setValue(p.x);
      retY.setValue(p.y);
    }
    if (planePos.current) {
      const p = at(planePos.current);
      planeX.setValue(p.x);
      planeY.setValue(p.y);
    }
  };

  // Après un défilement : la bande revient à 0 et les éléments sont recalés sur les nouvelles lignes.
  useLayoutEffect(() => {
    winRef.current = winStart;
    stripY.setValue(0);
    reposition();
    const done = pendingScroll.current;
    if (done) {
      pendingScroll.current = null;
      done();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winStart]);

  // Rotation de l'écran / redimensionnement : on recalcule les positions.
  useEffect(() => {
    reposition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cell]);

  const finishBoom = useCallback((id: number) => {
    setBooms(list => list.filter(b => b.id !== id));
    const waiter = boomWaiters.current.get(id);
    if (waiter) {
      boomWaiters.current.delete(id);
      waiter();
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      getWinStart: () => winRef.current,

      reset() {
        [stripY, retX, retY, retO, planeX, planeY, planeR, planeS, planeO, shakeX].forEach(v => v.stopAnimation());
        retPos.current = null;
        planePos.current = null;
        retO.setValue(0);
        planeO.setValue(0);
        planeR.setValue(0);
        planeS.setValue(1);
        shakeX.setValue(0);
        stripY.setValue(0);
        boomWaiters.current.forEach(w => w());
        boomWaiters.current.clear();
        setBooms([]);
        winRef.current = 1;
        setWinStart(1);
      },

      placeReticle(col, level) {
        retPos.current = { col, level };
        const p = at(retPos.current);
        retX.setValue(p.x);
        retY.setValue(p.y);
        to(retO, 1, 300).start();
      },

      moveReticle(col, level, ms) {
        retPos.current = { col, level };
        const p = at(retPos.current);
        retO.setValue(1);
        return run(Animated.parallel([to(retX, p.x, ms), to(retY, p.y, ms)]));
      },

      hideReticle() {
        to(retO, 0, 300).start();
      },

      scrollTo(level) {
        const rows = level - winRef.current;
        if (rows <= 0) return Promise.resolve();
        return new Promise<void>(resolve => {
          to(stripY, rows * cellRef.current, 420, EASE_SCROLL).start(() => {
            pendingScroll.current = resolve;
            setWinStart(level);
          });
        });
      },

      flyPlane(col, level, ms) {
        if (!planePos.current) {
          // premier vol : l'avion arrive par le bas du plateau
          planePos.current = { col, level: winRef.current - 1 };
          const start = at(planePos.current);
          planeX.setValue(start.x);
          planeY.setValue(start.y);
          planeS.setValue(0.75);
          planeR.setValue(0);
          planeO.setValue(1);
        }
        const from = at(planePos.current);
        const target = at({ col, level });
        const angle = clamp(Math.atan2(target.x - from.x, -(target.y - from.y)) * 57.3 * 0.55, -30, 30);
        planePos.current = { col, level };
        return run(
          Animated.parallel([
            to(planeX, target.x, ms, EASE_FLY),
            to(planeY, target.y, ms, EASE_FLY),
            to(planeS, 1, ms, EASE_FLY),
            Animated.sequence([to(planeR, angle, ms / 2, EASE_FLY), to(planeR, 0, ms / 2, EASE_FLY)]),
          ]),
        );
      },

      hidePlane() {
        planePos.current = null;
        to(planeO, 0, 250).start();
      },

      planeExit(ms) {
        if (!planePos.current) return Promise.resolve();
        planePos.current = null;
        const ease = Easing.bezier(0.5, 0, 0.9, 0.6);
        const top = (STRIP_ROWS - VISIBLE_ROWS - 1) * cellRef.current;
        return run(Animated.parallel([to(planeY, top, ms, ease), to(planeS, 1.25, ms, ease), to(planeO, 0, ms, ease)]));
      },

      explode(col, level, big) {
        const id = ++boomSeq.current;
        return new Promise<void>(resolve => {
          boomWaiters.current.set(id, resolve);
          setBooms(list => [...list, { id, col, level, big }]);
        });
      },

      shake() {
        if (isReducedMotion()) return;
        const step = (x: number) => Animated.timing(shakeX, { toValue: x, duration: 60, useNativeDriver: true });
        Animated.sequence([step(-5), step(5), step(-3), step(2), step(0)]).start();
      },
    }),
    // les valeurs animées et les refs sont stables
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const boardSize = cell * COLS;
  const stripTop = -(STRIP_ROWS - VISIBLE_ROWS) * cell;
  const stripHeight = STRIP_ROWS * cell;
  const levels = Array.from({ length: STRIP_ROWS }, (_, i) => winStart + (STRIP_ROWS - 1 - i));
  const retSize = cell * 0.52;
  // Dimensions soignées de l'avion : parfaitement contenu au centre de la case sans jamais toucher ses bordures
  const planeW = cell * 0.76;
  const planeH = cell * 0.44;
  const rotate = planeR.interpolate({ inputRange: [-180, 180], outputRange: ['-180deg', '180deg'] });

  return (
    <View style={[styles.row, { gap: GAP }]}>
      <Animated.View
        style={[
          styles.board,
          { width: boardSize, height: boardSize, transform: [{ translateX: shakeX }] },
        ]}
      >
        <Image
          source={require('../../../../assets/ui/kamikaze_board_bg.png')}
          style={[StyleSheet.absoluteFill, { width: boardSize, height: boardSize }]}
          resizeMode="cover"
        />
        <View style={[styles.clip, { width: boardSize, height: boardSize }]}>
          <Animated.View
            style={{ position: 'absolute', left: 0, top: stripTop, width: boardSize, height: stripHeight, transform: [{ translateY: stripY }] }}
          >
            {levels.map((level, i) => (
              <GridRow
                key={level}
                level={level}
                cell={cell}
                isBottom={i === STRIP_ROWS - 1}
                active={level === activeLevel}
                enabled={interactive && level === activeLevel}
                mines={shown[level]}
                pickedCol={picked && picked.level === level ? picked.col : -1}
                onPick={onPick}
              />
            ))}

            {/* lignes de visée + réticule */}
            <Animated.View style={[styles.none, { left: 0, top: -1, opacity: retO, transform: [{ translateY: retY }] }]}>
              <DashedLine length={boardSize} />
            </Animated.View>
            <Animated.View style={[styles.none, { left: -1, top: 0, opacity: retO, transform: [{ translateX: retX }] }]}>
              <DashedLine length={stripHeight} vertical />
            </Animated.View>
            <Animated.View
              style={[
                styles.none,
                { left: -retSize / 2, top: -retSize / 2, opacity: retO, transform: [{ translateX: retX }, { translateY: retY }] },
              ]}
            >
              <ReticleArt size={retSize} />
            </Animated.View>

            {booms.map(b => {
              const p = cellCenter(b.col, b.level, winStart, cell);
              return <Explosion key={b.id} id={b.id} x={p.x} y={p.y} cell={cell} big={b.big} onDone={finishBoom} />;
            })}

            <Animated.View
              testID="plane"
              style={[
                styles.none,
                {
                  left: -planeW / 2,
                  top: -planeH / 2,
                  opacity: planeO,
                  transform: [{ translateX: planeX }, { translateY: planeY }, { rotate }, { scale: planeS }],
                },
              ]}
            >
              <PlaneArt width={planeW} height={planeH} />
            </Animated.View>
          </Animated.View>
        </View>
      </Animated.View>

      <View style={{ width: cell * 0.92, height: boardSize, overflow: 'hidden' }} accessibilityLabel="Multiplicateurs">
        <Animated.View style={{ position: 'absolute', left: 0, top: stripTop, width: '100%', height: stripHeight, transform: [{ translateY: stripY }] }}>
          {levels.map(level => (
            <View key={level} style={{ height: cell, alignItems: 'center', justifyContent: 'center' }}>
              {level <= MAX_LEVEL && (
                <Badge label={multText(multiplier(level))} active={level === activeLevel} width={cell * 0.92} height={cell * 0.84} />
              )}
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
});

/* ------------------------------------------------------------- Une ligne */

interface RowProps {
  level: number;
  cell: number;
  isBottom: boolean;
  active: boolean;
  enabled: boolean;
  mines: readonly number[] | undefined;
  pickedCol: number;
  onPick: (col: number) => void;
}

const GridRow = memo(function GridRow({ level, cell, isBottom, active, enabled, mines, pickedCol, onPick }: RowProps) {
  return (
    <View style={[styles.gridRow, { height: cell }]}>
      {Array.from({ length: COLS }, (_, col) => (
        <Pressable
          key={col}
          testID={`cell-${level}-${col}`}
          accessibilityRole="button"
          accessibilityLabel={`Niveau ${level}, colonne ${col + 1}`}
          accessibilityState={{ disabled: !enabled }}
          disabled={!enabled}
          onPress={() => onPick(col)}
          style={({ pressed }) => [
            styles.cell,
            {
              width: cell,
              height: cell,
              borderRightWidth: col === COLS - 1 ? 0 : 1.5,
              borderBottomWidth: isBottom ? 0 : 1.5,
            },
            active && styles.active,
            mines?.includes(col) && styles.mine,
            pickedCol === col && styles.picked,
            pressed && enabled && styles.pressed,
          ]}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  board: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#0b78ad',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  clip: { position: 'absolute', left: 0, top: 0, overflow: 'hidden' },
  gridRow: { flexDirection: 'row' },
  cell: { borderColor: 'rgba(70, 184, 217, 0.45)' },
  active: { backgroundColor: 'rgba(0, 48, 98, 0.28)' },
  pressed: { backgroundColor: 'rgba(130, 205, 245, 0.32)' },
  mine: { backgroundColor: 'rgba(0, 36, 82, 0.65)' },
  picked: { backgroundColor: 'rgba(198, 212, 152, 0.4)', borderColor: 'rgba(224, 228, 150, 0.65)' },
  none: { position: 'absolute', pointerEvents: 'none' },
});
