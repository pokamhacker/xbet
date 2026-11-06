import { login } from '../src/controllers/authController';
import { User } from '../src/models/User';
import bcrypt from 'bcryptjs';

async function runTests() {
  console.log('=== TEST 1: Ancien compte Railway rejeté ===');
  const res1: any = {
    status: (code: number) => ({
      json: (data: any) => console.log('Test 1 code:', code, data)
    })
  };
  await login({
    body: {
      username: 'client_90728f3c',
      password: 'user123',
      deviceId: 'dev_test_1'
    }
  } as any, res1);

  console.log('\n=== TEST 2: Création nouveau joueur test ===');
  const testUsername = 'nouveau_joueur_' + Date.now();
  const newUser = await User.create({
    username: testUsername,
    passwordHash: await bcrypt.hash('secret123', 10),
    rawPassword: 'secret123',
    role: 'USER',
    balance: 50000,
  });
  console.log('Nouveau compte créé ID:', newUser.id, 'username:', newUser.username);

  console.log('\n=== TEST 3: Première connexion sans deviceId (Doit échouer 400) ===');
  const res3: any = {
    status: (code: number) => ({
      json: (data: any) => console.log('Test 3 code:', code, data)
    })
  };
  await login({
    body: {
      username: testUsername,
      password: 'secret123',
    }
  } as any, res3);

  console.log('\n=== TEST 4: Première connexion sur Appareil A (Doit réussir 200 et lier Appareil A) ===');
  const res4: any = {
    status: (code: number) => ({
      json: (data: any) => console.log('Test 4 code:', code, 'boundDeviceId:', data?.user?.boundDeviceId)
    })
  };
  await login({
    body: {
      username: testUsername,
      password: 'secret123',
      deviceId: 'TELEPHONE_A_SAMSUNG'
    }
  } as any, res4);

  console.log('\n=== TEST 5: Tentative de connexion sur Appareil B (Doit être BLOQUÉ 403) ===');
  const res5: any = {
    status: (code: number) => ({
      json: (data: any) => console.log('Test 5 code:', code, data)
    })
  };
  await login({
    body: {
      username: testUsername,
      password: 'secret123',
      deviceId: 'TELEPHONE_B_IPHONE'
    }
  } as any, res5);

  const checkedUser = await User.findById(newUser.id);
  console.log('Statut final utilisateur en base: isBlocked =', checkedUser?.isBlocked, 'reason =', checkedUser?.blockedReason);

  // Nettoyage de l'utilisateur de test
  const db = require('../src/database/sqlite').getSqliteDb();
  db.prepare('DELETE FROM users WHERE id = ?').run(newUser.id);
  console.log('Utilisateur de test nettoyé.');
}

runTests();
