const Database = require('better-sqlite3');

const dbPaths = [
  'c:/Users/CLINIC/Desktop/xbet/src/data/xbet.db',
  'C:/Users/CLINIC/Desktop/Projet/bet/src/data/xbet.db'
];

dbPaths.forEach(p => {
  try {
    const db = new Database(p);
    const del = db.prepare(`
      DELETE FROM users WHERE id IN (
        'user_1792884432062_90728f3c',
        'user_1791038369859_d9deb048',
        'user_1793204267288_690bb111',
        'user_1792268443511_9d999819',
        'user_1791125553652_3f3846c2',
        'user_1792152632858_9b7c5e1d',
        'user-1789492287827',
        'test_user_1',
        'user-demo-1'
      ) OR username LIKE 'client_%' OR username = 'user';
    `).run();
    console.log(p + ' : ' + del.changes + ' anciens comptes Railway supprimes.');
    const remaining = db.prepare('SELECT id, username, role FROM users').all();
    console.log('Comptes restants :', remaining);
    db.close();
  } catch (e) {
    console.error(p, e.message);
  }
});
