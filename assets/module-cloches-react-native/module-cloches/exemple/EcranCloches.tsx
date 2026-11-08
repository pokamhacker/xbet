/**
 * EXEMPLE COMPLET — un écran qui reprend ton jeu, branché sur le module cloches.
 * Le « faux serveur » en bas est à remplacer par tes vrais appels API.
 */
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useCloches, GrilleCloches, type Plat } from '../cloches';

// Multiplicateurs par étape. Les 3 premiers viennent de ta vidéo, les autres sont à remplacer par les tiens.
const MULTIPLICATEURS = [1.21, 1.53, 1.93, 2.44, 3.08];

// Tes plats. Avec tes images ce serait : poulet: require('./img/poulet.png'), etc. (PNG fond transparent)
const PLATS: Record<string, Plat> = {
  poulet: <Text style={{ fontSize: 46 }}>🍗</Text>,
  pizza: <Text style={{ fontSize: 46 }}>🍕</Text>,
  viande: <Text style={{ fontSize: 46 }}>🥩</Text>,
  sushi: <Text style={{ fontSize: 46 }}>🍣</Text>,
  gateau: <Text style={{ fontSize: 46 }}>🍰</Text>,
};
const PLAT_PERDU: Plat = <Text style={{ fontSize: 46 }}>🦴</Text>;

export default function EcranCloches() {
  const [mise, setMise] = useState(250);

  const jeu = useCloches({
    lignes: 5,
    colonnes: 5,
    mode: 'ligne',
    onChoisir: async ({ ligne, colonne, etape }) => {
      // 👉 remplace par : const r = await api.post('/cloches/choisir', { ligne, colonne, etape });
      const r = await fauxServeur.choisir(ligne, colonne, etape);
      return r.gagne ? { gagne: true, plat: PLATS[r.plat] } : { gagne: false, plat: PLAT_PERDU };
    },
    onErreur: () => {
      // ex. afficher « Connexion… » puis laisser le joueur retoucher la cloche
    },
  });

  const gains = jeu.etape > 0 ? Math.round(mise * MULTIPLICATEURS[jeu.etape - 1] * 100) / 100 : 0;
  const prochain = MULTIPLICATEURS[jeu.etape];

  const jouer = async () => {
    await fauxServeur.placerPari(mise); // 👉 ton appel API pour débiter la mise
    jeu.demarrer();
  };

  return (
    <View style={styles.ecran}>
      <View style={styles.cadre}>
        <GrilleCloches jeu={jeu} imageCloche={require('./img/cloche.png')} />

        {/* UN SEUL message à la fois : corrige le « Placez un pari » qui restait affiché dessous */}
        <View style={styles.message}>
          {jeu.statut === 'pret' && <Text style={styles.msgTitre}>Placez un pari</Text>}
          {jeu.statut === 'enJeu' && (
            <>
              <Text style={styles.msgTitre}>Sélectionnez un plat !</Text>
              {prochain != null && <Text style={styles.msgTitre}>Prochaine étape : x{prochain}</Text>}
            </>
          )}
          {jeu.statut === 'attente' && <Text style={styles.msgTitre}>...</Text>}
          {jeu.statut === 'perdu' && <Text style={styles.msgTitre}>Perdu !</Text>}
          {(jeu.statut === 'encaisse' || jeu.statut === 'complet') && (
            <Text style={styles.msgTitre}>Vos gains : {gains} XAF</Text>
          )}
        </View>
      </View>

      <View style={styles.barre}>
        {jeu.statut === 'pret' && (
          <>
            <Pressable style={styles.mise} onPress={() => setMise((m) => (m >= 5000 ? 250 : m * 2))}>
              <Text style={styles.miseTexte}>{mise}{'\n'}XAF</Text>
            </Pressable>
            <Pressable style={styles.boutonVert} onPress={jouer}>
              <Text style={styles.boutonTexte}>▶</Text>
            </Pressable>
          </>
        )}

        {(jeu.statut === 'enJeu' || jeu.statut === 'attente') && jeu.etape > 0 && (
          <Pressable
            style={[styles.boutonVert, jeu.statut === 'attente' && styles.boutonGris]}
            disabled={jeu.statut === 'attente'}
            onPress={jeu.encaisser}
          >
            <Text style={styles.boutonTexte}>Récupérer les gains{'\n'}{gains} XAF</Text>
          </Pressable>
        )}

        {(jeu.statut === 'perdu' || jeu.statut === 'encaisse' || jeu.statut === 'complet') && (
          <Pressable style={styles.boutonVert} onPress={jeu.reinitialiser}>
            <Text style={styles.boutonTexte}>Rejouer</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/* ---------- Faux serveur pour tester sans backend ---------- */
const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fauxServeur = {
  async placerPari(_mise: number) {
    await attendre(200);
  },
  async choisir(_ligne: number, _colonne: number, _etape: number) {
    await attendre(350 + Math.random() * 300);
    const cles = Object.keys(PLATS);
    return Math.random() < 0.8
      ? { gagne: true as const, plat: cles[Math.floor(Math.random() * cles.length)] }
      : { gagne: false as const, plat: '' };
  },
};

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: '#3a0606', justifyContent: 'space-between', paddingTop: 24 },
  cadre: {
    marginHorizontal: 12,
    padding: 12,
    borderWidth: 3,
    borderColor: '#e9a83a',
    borderRadius: 14,
    backgroundColor: '#4a0b08',
  },
  message: {
    marginTop: 10,
    alignSelf: 'center',
    minWidth: 220,
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#e9a83a',
    borderRadius: 10,
    backgroundColor: '#2a0604',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgTitre: { color: '#fff', fontWeight: '700', fontSize: 15, textAlign: 'center' },
  barre: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    backgroundColor: '#8a0d0d',
    borderTopWidth: 3,
    borderTopColor: '#e9a83a',
  },
  mise: {
    backgroundColor: '#2a0604',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 16,
  },
  miseTexte: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  boutonVert: {
    backgroundColor: '#6cc24a',
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 10,
    minWidth: 64,
    alignItems: 'center',
  },
  boutonGris: { backgroundColor: '#9a9a9a' },
  boutonTexte: { color: '#fff', fontWeight: '800', fontSize: 15, textAlign: 'center' },
});
