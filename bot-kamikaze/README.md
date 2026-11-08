# 🚀 Bot Kamikaze — Signaux & Prédictions 1XBET / MELBET / MEGAPARI

Application web moderne, fluide et responsive développée en **HTML5, Vanilla CSS et JavaScript pur (ES6)**.
Reproduit fidèlement l'interface du bot Kamikaze avec grille 5x5, textures d'eau réelles, avions rouges vectoriels, multiplicateurs réactifs (x1.2 à x2.5) et synthétiseur audio Web Audio API.

---

## 📱 Fonctionnalités Principales

- **Grille 5x5 Texture Eau & Radar** : Arrière-plan aquatique avec lignes de balayage laser.
- **Bouton `+ NOUVELLE LIGNE`** : Révèle instantanément un avion Kamikaze rouge sur la rangée active (progression de bas en haut : `x1.2` ➔ `x1.4` ➔ `x1.6` ➔ `x2.0` ➔ `x2.5`).
- **Multiplicateurs Pentagones Réactifs** : S'illuminent en or éclatant au fur et à mesure que les lignes sont débloquées.
- **Bouton `↻ RECOMMENCER`** : Réinitialise la grille et les multiplicateurs avec une animation fluide.
- **Bouton Code Promo (`MC8899`)** : Copie en 1 clic dans le presse-papier avec notification toast.
- **Sélecteur de Bookmakers** : Basculez entre `1XBET`, `MELBET` et `MEGAPARI`.
- **Compteur Réel de Connectés** : Affiche un indicateur vert pulsant avec fluctuation réaliste (~2 224 connectés).
- **Moteur Sonore Intégré (Web Audio API)** : Effets sonores de scan radar, verrouillage d'avion, niveau supérieur et fanfare finale sans dépendances de fichiers externes.
- **Bouton Son Mute / Unmute** : Activez ou coupez le son en un clic.
- **Panneau de Configuration (Icône Crayon)** : Personnalisez l'ID utilisateur, le Code Promo, le lien Telegram, le lien YouTube et le numéro WhatsApp.

---

## ⚡ Déploiement en 1 Clic sur Vercel

### Méthode 1 : Via l'interface web Vercel (Recommandé)
1. Poussez ce dossier sur votre compte **GitHub**.
2. Rendez-vous sur [vercel.com](https://vercel.com) et cliquez sur **"Add New Project"**.
3. Sélectionnez votre dépôt GitHub.
4. Dans **Root Directory**, sélectionnez `bot-kamikaze` (ou laissez par défaut si vous utilisez le dépôt avec le `vercel.json` à la racine).
5. Cliquez sur **Deploy** : Votre site est en ligne avec HTTPS gratuit en moins de 30 secondes !

### Méthode 2 : Via la ligne de commande Vercel CLI
Ouvrez votre terminal dans ce dossier et exécutez :
```bash
npx vercel --prod
```
Suivez les instructions en appuyant sur Entrée pour valider les paramètres par défaut.

---

## 💻 Test en Local

Pour tester le bot directement sur votre ordinateur :
- **Option 1** : Double-cliquez simplement sur `index.html` pour l'ouvrir dans votre navigateur.
- **Option 2** : Lancez un serveur local rapide avec :
  ```bash
  npx serve .
  ```
