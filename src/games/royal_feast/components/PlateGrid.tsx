import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Cloche } from '../cloches/Cloche';
import type { JeuCloches } from '../cloches/useCloches';
import {
  GRID_COLS_LEFT_PCT,
  GRID_ROWS_TOP_PCT,
} from '../constants/gameConfig';

interface PlateGridProps {
  jeu: JeuCloches;
  boardWidth: number;
  boardHeight: number;
  onPressCloche: (ligne: number, colonne: number) => void;
}

export const PlateGrid: React.FC<PlateGridProps> = ({
  jeu,
  boardWidth,
  boardHeight,
  onPressCloche,
}) => {
  const caseWidth = boardWidth * 0.12553;
  const caseHeight = boardHeight * 0.05212;

  const handlePress = useCallback(
    (l: number, c: number) => {
      onPressCloche(l, c);
    },
    [onPressCloche],
  );

  return (
    <View style={styles.gridOverlay} pointerEvents="box-none">
      {jeu.cases.map((ligne, l) => {
        const estLigneActive = jeu.ligneActive === null || jeu.ligneActive === l;

        return ligne.map((etat, c) => (
          <Cloche
            key={`${l}-${c}`}
            anim={jeu.anim.get(l, c)}
            etat={etat}
            largeur={caseWidth}
            hauteur={caseHeight}
            estLigneActive={estLigneActive}
            desactivee={
              etat.type !== 'cloche' ||
              jeu.statut === 'attente' ||
              jeu.statut === 'perdu' ||
              jeu.statut === 'complet' ||
              jeu.statut === 'encaisse' ||
              (jeu.ligneActive !== null && jeu.ligneActive !== l)
            }
            onPress={() => handlePress(l, c)}
            echellePlat={1.30}
            style={{
              position: 'absolute',
              left: GRID_COLS_LEFT_PCT[c],
              top: GRID_ROWS_TOP_PCT[l],
            }}
          />
        ));
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15,
  },
});




