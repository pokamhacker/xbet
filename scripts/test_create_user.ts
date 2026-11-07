import http from 'http';
import express from 'express';
import cors from 'cors';
import { User } from '../src/models/User';
import adminRoutes from '../src/routes/adminRoutes';
import authRoutes from '../src/routes/authRoutes';
import { getSqliteDb } from '../src/database/sqlite';

async function runTest() {
  console.log('--- TEST DE CRÉATION D\'UTILISATEUR & AUTHENTIFICATION ADMIN ---');

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`Serveur de test démarré sur ${baseUrl}`);

  try {
    // 1. Test création sans aucun token ni clé admin -> doit retourner 401
    const test1Res = await fetch(`${baseUrl}/api/admin/create-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_no_token',
        password: 'password123',
        initialBalance: 10000,
      }),
    });
    const test1Data = await test1Res.json();
    console.log(`[TEST 1] Requête sans token ni clé: Status ${test1Res.status}`, test1Data);
    if (test1Res.status !== 401 || test1Data.code !== 'TOKEN_MISSING') {
      throw new Error(`Test 1 a échoué: attendu 401 TOKEN_MISSING, reçu ${test1Res.status}`);
    }
    console.log('✅ Test 1 validé: protection active contre requêtes non authentifiées.');

    // 2. Test création avec la clé admin d'urgence 'x-admin-key: Bolingo2024##?' (cas cold start / pas de token)
    const uniqueUser1 = `joueur_test_${Date.now()}`;
    const test2Res = await fetch(`${baseUrl}/api/admin/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'Bolingo2024##?',
      },
      body: JSON.stringify({
        username: uniqueUser1,
        password: 'PassSecret2026',
        initialBalance: 25000,
      }),
    });
    const test2Data = await test2Res.json();
    console.log(`[TEST 2] Création avec clé admin x-admin-key: Status ${test2Res.status}`, test2Data);
    if (test2Res.status !== 201 || !test2Data.success) {
      throw new Error(`Test 2 a échoué: attendu 201 success, reçu ${test2Res.status}`);
    }
    console.log(`✅ Test 2 validé: Compte "${uniqueUser1}" créé avec succès via clé admin.`);

    // 3. Test connexion en tant qu'admin pour obtenir un JWT
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'bookmekerstudio',
        password: 'Bolingo2024##?',
        deviceId: 'admin_test_device',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    console.log(`[TEST 3] Connexion Admin: Status ${adminLoginRes.status}`, {
      success: adminLoginData.success,
      hasToken: Boolean(adminLoginData.token),
    });
    if (!adminLoginRes.ok || !adminLoginData.token) {
      throw new Error('Test 3 a échoué: impossible de récupérer le token JWT Admin');
    }
    const adminJwt = adminLoginData.token;
    console.log('✅ Test 3 validé: Token JWT Admin obtenu avec succès.');

    // 4. Test création avec le token JWT Admin
    const uniqueUser2 = `joueur_jwt_${Date.now()}`;
    const test4Res = await fetch(`${baseUrl}/api/admin/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      body: JSON.stringify({
        username: uniqueUser2,
        password: 'PassSecret2026',
        initialBalance: 50000,
      }),
    });
    const test4Data = await test4Res.json();
    console.log(`[TEST 4] Création avec JWT Admin: Status ${test4Res.status}`, test4Data);
    if (test4Res.status !== 201 || !test4Data.success) {
      throw new Error(`Test 4 a échoué: attendu 201 success, reçu ${test4Res.status}`);
    }
    console.log(`✅ Test 4 validé: Compte "${uniqueUser2}" créé avec succès via JWT Bearer.`);

    // 5. Test connexion du joueur créé sur un 1er appareil
    const dev1LoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: uniqueUser2,
        password: 'PassSecret2026',
        deviceId: 'device_phone_alpha_01',
      }),
    });
    const dev1Data = await dev1LoginRes.json();
    console.log(`[TEST 5] Connexion joueur sur 1er appareil: Status ${dev1LoginRes.status}`, {
      success: dev1Data.success,
      boundDeviceId: dev1Data.user?.boundDeviceId,
    });
    if (!dev1LoginRes.ok || !dev1Data.success) {
      throw new Error('Test 5 a échoué: joueur incapable de se connecter sur 1er appareil');
    }
    console.log('✅ Test 5 validé: Compte lié au 1er appareil.');

    // 6. Test tentative de connexion du même compte sur un 2e appareil -> doit être bloqué (403)
    const dev2LoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: uniqueUser2,
        password: 'PassSecret2026',
        deviceId: 'device_phone_beta_02',
      }),
    });
    const dev2Data = await dev2LoginRes.json();
    console.log(`[TEST 6] Connexion même compte sur 2e appareil: Status ${dev2LoginRes.status}`, dev2Data);
    if (dev2LoginRes.status !== 403) {
      throw new Error(`Test 6 a échoué: attendu 403 mono-appareil, reçu ${dev2LoginRes.status}`);
    }
    console.log('✅ Test 6 validé: Le 2ème appareil est immédiatement bloqué (règle 1 compte = 1 appareil respectée).');

    console.log('\n=============================================');
    console.log('TOUS LES TESTS ONT RÉUSSI AVEC SUCCÈS ! (100%)');
    console.log('=============================================');
  } finally {
    server.close();
  }
}

runTest().catch((err) => {
  console.error('ERREUR TEST CRÉATION :', err);
  process.exit(1);
});
