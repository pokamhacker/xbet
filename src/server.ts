import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { initSocketManager } from './sockets/socketManager';
import { getSqliteDb, closeSqliteDatabase } from './database/sqlite';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import betRoutes from './routes/betRoutes';
import footballRoutes from './routes/footballRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. Configuration des Middlewares globaux
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Initialisation de Socket.io avec support CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// 3. Initialisation du Gestionnaire de chambres Socket.io
initSocketManager(io);

// 4. Montage des Routes API REST
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/football', footballRoutes);

// 4.1 Route de santé (Health Check pour Render / UptimeRobot / Client)
app.get('/health', (_req, res) => {
  let dbStatus = 'disconnected';
  try {
    const db = getSqliteDb();
    const check = db.prepare('SELECT 1 as alive').get() as { alive: number };
    dbStatus = check && check.alive === 1 ? 'connected (SQLite WAL)' : 'disconnected';
  } catch (err: any) {
    dbStatus = `error: ${err.message}`;
  }

  res.status(200).json({
    status: 'OK',
    database: dbStatus,
    engine: 'SQLite (better-sqlite3)',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Bookmaker Studio API & WebSocket Server',
    version: '1.0.0',
    database: 'SQLite',
    status: 'running',
    health: '/health',
  });
});

// 5. Lancement IMMÉDIAT du Serveur HTTP & WebSockets (Port détecté dès la 1ère milliseconde par Railway)
const PORT = Number(process.env.PORT) || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Serveur démarré avec succès sur le port ${PORT}`);
  console.log(`[Server] Health Check : http://0.0.0.0:${PORT}/health`);
  console.log(`[Server] API Auth     : http://0.0.0.0:${PORT}/api/auth`);
  console.log(`[Server] API Admin    : http://0.0.0.0:${PORT}/api/admin`);

  // 6. Initialisation de la Base de Données SQLite
  try {
    getSqliteDb();
    console.log('[Database] Connexion et synchronisation SQLite établies avec succès.');
  } catch (err: any) {
    console.error('[Database] Erreur critique lors de l’initialisation de SQLite :', err.message);
  }
});

// Gestion des arrêts gracieux (SIGTERM / SIGINT)
const handleShutdown = () => {
  console.log('[Server] Signal d\'arrêt reçu. Fermeture gracieuse en cours...');
  const forceKillTimer = setTimeout(() => {
    console.warn('[Server] Délai de grâce dépassé. Arrêt forcé.');
    closeSqliteDatabase();
    process.exit(0);
  }, 4000);
  forceKillTimer.unref();

  server.close(() => {
    console.log('[Server] Serveur HTTP fermé.');
    closeSqliteDatabase();
    process.exit(0);
  });
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

// Protection anti-crash globale (évite que le serveur ne tombe sur une erreur asynchrone)
process.on('uncaughtException', (err) => {
  console.error('[Server] Exception non capturée (protégée) :', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Promesse rejetée non gérée (protégée) :', reason);
});

export { app, server, io };
