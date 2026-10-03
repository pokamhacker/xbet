# 🚂 Guide Complet de Déploiement sur Railway.com (avec SQLite)

**Railway** est l'une des plateformes cloud les plus fiables et modernes. Elle ne souffre d'**aucun blocage géographique** en Afrique et prend en charge nativement les **WebSockets Socket.io** et **SQLite**.

---

## ⚡ Pourquoi Railway est idéal ?
- 🌍 **Accessible partout** : aucun blocage géographique, vous pouvez vous connecter facilement avec votre compte GitHub.
- 🚀 **Déploiement en 1 clic** depuis GitHub.
- 🔒 **HTTPS automatique** avec un sous-domaine gratuit fourni (`https://xxx.up.railway.app`).
- ⚡ **WebSockets (Socket.io) 100% compatibles** pour vos alertes et blocages en temps réel.
- 💾 **Support des Volumes persistants** pour conserver la base SQLite `xbet.db` à vie.

---

## 📋 Étape 1 : Pousser la configuration sur GitHub

Dans votre terminal :
```bash
git add .
git commit -m "feat: configuration deploiment railway avec sqlite"
git push origin main
```

---

## 🚀 Étape 2 : Déployer sur Railway en 3 minutes

1. Rendez-vous sur **[railway.com](https://railway.com)** (ou [railway.app](https://railway.app)).
2. Cliquez sur **« Login »** en haut à droite, puis choisissez **« Login with GitHub »**.
3. Une fois connecté sur votre tableau de bord Railway :
   - Cliquez sur le bouton violet **« + New Project »** (ou « Deploy from repo »).
   - Sélectionnez **« Deploy from GitHub repo »**.
   - Choisissez votre dépôt : **`pokamhacker/xbet`**.
   - Cliquez sur **« Deploy Now »**.

Railway va automatiquement détecter le projet Node.js, installer les dépendances et lancer `npm run start:server`.

---

## 🌐 Étape 3 : Générer votre adresse URL publique

Par défaut, Railway n'expose pas d'URL publique tant que vous ne lui demandez pas. Pour l'activer :
1. Cliquez sur la carte de votre service **xbet** sur Railway.
2. Allez dans l'onglet **« Settings »**.
3. Descendez jusqu'à la section **« Networking »** (ou « Public Networking »).
4. Cliquez sur le bouton **« Generate Domain »**.
5. Railway vous donne instantanément une URL publique sécurisée HTTPS, par exemple :  
   👉 `https://xbet-production-78bc.up.railway.app`

---

## 💾 Étape 4 (Recommandée) : Persistance de la base SQLite (Volume)

Pour que votre base de données `xbet.db` ne soit jamais écrasée lors des futurs commits Git :
1. Sur Railway, faites un clic droit ou cliquez sur **« + New »** dans votre projet.
2. Choisissez **« Volume »**.
3. Dans les paramètres du volume, définissez le point de montage :
   - **Mount Path** : `/app/src/data`
4. Reliez ce volume à votre service `xbet`.  
👉 Vos utilisateurs et vos paris sportifs seront désormais sauvegardés de façon permanente !

---

## 📱 Étape 5 : Raccorder l'application Mobile

Dans votre fichier `.env` sur votre machine de développement :
```env
EXPO_PUBLIC_API_URL=https://<votre-domaine-railway>.up.railway.app
```

### Vérifier que tout tourne :
Ouvrez dans votre navigateur :  
`https://<votre-domaine-railway>.up.railway.app/health`

Vous obtiendrez :
```json
{
  "status": "OK",
  "database": "connected (SQLite WAL)",
  "engine": "SQLite (better-sqlite3)",
  "uptime": 15.2
}
```

Votre serveur est prêt et opérationnel pour le monde entier !
