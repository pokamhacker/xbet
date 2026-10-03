# 🚀 Guide de Déploiement Gratuit sur Render.com (avec SQLite)

Ce guide vous explique pas à pas comment déployer votre serveur backend (API REST Express + WebSockets Socket.io + SQLite) sur **Render.com** de manière **100% gratuite**.

---

## 💡 Est-ce que Render est gratuit ?

**OUI, Render propose un plan gratuit (« Free Tier ») permanent pour les serveurs Web :**
- ✅ **0 € / mois** (aucune carte bancaire requise à l'inscription).
- ✅ **HTTPS / SSL automatique gratuit** (`https://votre-app.onrender.com`).
- ✅ **WebSockets Socket.io inclus** (contrôle en temps réel et alertes instantanées).
- ✅ **SQLite intégré** : la base est créée automatiquement dès le premier démarrage.

> **ℹ️ Bon à savoir sur le plan gratuit de Render :**  
> Pour économiser l'énergie, si personne n'utilise l'application pendant 15 minutes, Render met le serveur en veille. Dès qu'un utilisateur ouvre l'application, le serveur se réveille automatiquement en 30 à 45 secondes.  
> *(Astuce : Vous pouvez utiliser un service gratuit comme [uptimerobot.com](https://uptimerobot.com) pour envoyer un ping toutes les 10 minutes sur votre URL `/health` afin qu'il reste toujours éveillé).*

---

## 📋 Prérequis

1. Un compte **GitHub** (gratuit) : [github.com](https://github.com)
2. Un compte **Render.com** (gratuit, connectez-vous avec votre compte GitHub) : [render.com](https://render.com)

---

## 🐙 Étape 1 : Pousser votre projet sur GitHub

Si ce n'est pas déjà fait, enregistrez vos modifications et envoyez votre code sur GitHub :

```bash
git add .
git commit -m "feat: backend express avec sqlite et controle en temps reel"
git branch -M main
git remote add origin https://github.com/<votre-identifiant>/xbet.git
git push -u origin main
```

---

## 🌐 Étape 2 : Déployer sur Render.com (En 2 minutes)

1. Connectez-vous sur [dashboard.render.com](https://dashboard.render.com).
2. Cliquez sur le bouton bleu **« New + »** (en haut à droite) et choisissez **« Web Service »**.
3. Sélectionnez l'option **« Build and deploy from a Git repository »** puis cliquez sur **Next**.
4. Associez votre dépôt GitHub `xbet` (ou collez l'URL de votre dépôt).
5. Remplissez les paramètres suivants :
   - **Name** : `xbet-backend` (ou le nom de votre choix)
   - **Region** : `Frankfurt (EU Central)` (ou la plus proche de votre audience)
   - **Branch** : `main`
   - **Runtime** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm run start:server`
   - **Instance Type** : `Free` (0 $/mois)
6. Cliquez sur **« Deploy Web Service »** (en bas).

Render va alors installer les dépendances, compiler le projet, initialiser SQLite et démarrer le serveur. En 2 minutes, votre backend est en ligne !

---

## 🔗 Étape 3 : Récupérer votre URL et la connecter à l'application Mobile

Une fois le déploiement terminé, Render affiche votre URL publique en haut de page, par exemple :  
👉 `https://xbet-backend.onrender.com`

### 1. Tester que votre serveur fonctionne :
Ouvrez cette URL dans votre navigateur en ajoutant `/health` :  
`https://xbet-backend.onrender.com/health`

Vous devez voir :
```json
{
  "status": "OK",
  "database": "connected (SQLite WAL)",
  "engine": "SQLite (better-sqlite3)",
  "uptime": 12.34
}
```

### 2. Raccorder votre application mobile :
Dans votre fichier `.env` sur votre machine de développement :
```env
EXPO_PUBLIC_API_URL=https://xbet-backend.onrender.com
```

Dès cet instant :
- Votre application mobile est connectée à votre serveur en ligne.
- Vous pouvez créer, bloquer ou suspendre des utilisateurs en temps réel n'importe où dans le monde depuis votre Dashboard Administrateur !
