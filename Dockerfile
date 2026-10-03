FROM node:20-alpine

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances (y compris tsx)
RUN npm install

# Copie du code source complet
COPY . .

# Exposition des ports (5000 pour local/VPS, 10000 pour Render)
EXPOSE 5000 10000

ENV NODE_ENV=production

# Commande d'exécution du serveur
CMD ["npm", "run", "start:server"]
