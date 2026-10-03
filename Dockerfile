FROM node:20-bookworm-slim

WORKDIR /app

# Installation des outils de compilation requis pour les modules natifs Node.js (better-sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copie des fichiers de configuration et dépendances
COPY package*.json .npmrc ./

# Installation propre avec gestion des peer-deps React Native / Expo
RUN npm install --legacy-peer-deps

# Copie du code source complet
COPY . .

# Dossier pour la base de données SQLite
RUN mkdir -p /app/src/data

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Commande de démarrage du serveur avec tsx
CMD ["npm", "run", "start:server"]
