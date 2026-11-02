/**
 * Interface Web d'Administration Centrale Unifiée (bet & xbet)
 * Accessible directement via GET /admin sur le serveur Render.com ou en local
 */
export function getAdminWebHtml(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bookmaker Studio Pro — Admin Central (bet & xbet)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #090D16; color: #F8FAFC; font-family: system-ui, -apple-system, sans-serif; }
    .glass { background: #111827; border: 1px solid #1F2937; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
  </style>
</head>
<body class="min-h-screen pb-16">
  <!-- Toast Notification -->
  <div id="toast" class="fixed top-4 right-4 z-50 hidden px-5 py-3 rounded-xl font-bold text-sm shadow-2xl transition-all"></div>

  <!-- Login Screen -->
  <div id="login-screen" class="min-h-screen flex items-center justify-center p-4">
    <div class="glass rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-800">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
        <span class="text-xs font-extrabold tracking-widest text-sky-400 uppercase">Base de Données Unifiée (bet & xbet)</span>
      </div>
      <h1 class="text-2xl font-black text-white mb-1">Admin Central Studio</h1>
      <p class="text-xs text-slate-400 mb-6">Contrôlez tous les comptes, mots de passe, soldes et accès en temps réel.</p>
      
      <div id="login-error" class="hidden bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold p-3 rounded-lg mb-4"></div>

      <form id="login-form" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase mb-1">Identifiant Administrateur</label>
          <input id="login-user" type="text" value="BookmekerStudio" required
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-400" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase mb-1">Mot de passe</label>
          <input id="login-pass" type="password" placeholder="••••••••••••" required
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-400" />
        </div>
        <button type="submit"
          class="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-3 rounded-xl text-sm transition cursor-pointer">
          Connexion au Panneau Central
        </button>
      </form>
    </div>
  </div>

  <!-- Dashboard Screen -->
  <div id="dashboard-screen" class="hidden">
    <!-- Top Header -->
    <header class="glass border-b border-slate-800 sticky top-0 z-30 px-6 py-4">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="text-[11px] font-extrabold tracking-wider text-sky-400 uppercase">SERVEUR CENTRAL RENDER • BASE SQLITE UNIFIÉE (BET & XBET)</span>
          </div>
          <h1 class="text-xl font-black text-white mt-0.5">Bookmaker Studio Pro — Panneau Administrateur</h1>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="fetchUsers()" class="px-3.5 py-2 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-extrabold hover:bg-sky-500/25 cursor-pointer">
            🔄 Actualiser
          </button>
          <button onclick="openCreateModal()" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-lg cursor-pointer">
            + Nouveau Compte
          </button>
          <button onclick="logout()" class="px-3.5 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-extrabold hover:bg-red-500/25 cursor-pointer">
            Déconnexion
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 mt-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="glass p-4 rounded-2xl">
          <div class="text-xs font-bold text-slate-400">Total Utilisateurs</div>
          <div id="kpi-total" class="text-2xl font-black text-white mt-1">0</div>
        </div>
        <div class="glass p-4 rounded-2xl">
          <div class="text-xs font-bold text-slate-400">Sessions En Ligne</div>
          <div id="kpi-online" class="text-2xl font-black text-emerald-400 mt-1">0</div>
        </div>
        <div class="glass p-4 rounded-2xl">
          <div class="text-xs font-bold text-slate-400">Comptes Bloqués</div>
          <div id="kpi-blocked" class="text-2xl font-black text-red-400 mt-1">0</div>
        </div>
        <div class="glass p-4 rounded-2xl">
          <div class="text-xs font-bold text-slate-400">Trésorerie Cumulée</div>
          <div id="kpi-balance" class="text-2xl font-black text-amber-300 mt-1">0 ₣</div>
        </div>
      </div>

      <!-- Search & Global Password Toggle -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <input id="search-input" oninput="renderUsers()" type="text" placeholder="Rechercher par nom d'utilisateur ou ID..."
          class="flex-1 min-w-[260px] glass rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400" />
        <button id="toggle-all-pass-btn" onclick="toggleAllPasswords()"
          class="px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-extrabold cursor-pointer">
          👁️ Voir tous les mots de passe
        </button>
      </div>

      <!-- Users List -->
      <div id="users-grid" class="grid grid-cols-1 lg:grid-cols-2 gap-4"></div>
    </main>
  </div>

  <!-- Modal: Create User -->
  <div id="create-modal" class="fixed inset-0 bg-black/75 z-40 hidden items-center justify-center p-4">
    <div class="glass rounded-2xl p-6 w-full max-w-md border border-blue-500/40">
      <h2 class="text-lg font-black text-white mb-4">Créer un nouveau compte joueur</h2>
      <div class="space-y-3">
        <div>
          <label class="text-xs font-bold text-slate-400">Nom d'utilisateur</label>
          <input id="new-username" type="text" placeholder="ex: joueur225" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1" />
        </div>
        <div>
          <div class="flex justify-between items-center">
            <label class="text-xs font-bold text-slate-400">Mot de passe</label>
            <button type="button" onclick="genPass('new-password')" class="text-[11px] text-sky-400 font-bold cursor-pointer">🎲 Générer</button>
          </div>
          <input id="new-password" type="text" placeholder="Mot de passe en clair" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1" />
        </div>
        <div>
          <label class="text-xs font-bold text-slate-400">Solde initial (FCFA)</label>
          <input id="new-balance" type="number" value="50000" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1" />
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <button onclick="closeCreateModal()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer">Annuler</button>
        <button onclick="submitCreateUser()" class="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-black cursor-pointer">Créer le compte</button>
      </div>
    </div>
  </div>

  <!-- Modal: Edit Password -->
  <div id="pass-modal" class="fixed inset-0 bg-black/75 z-40 hidden items-center justify-center p-4">
    <div class="glass rounded-2xl p-6 w-full max-w-md border border-amber-500/40">
      <h2 class="text-lg font-black text-white mb-1">Modifier le mot de passe</h2>
      <p id="pass-modal-sub" class="text-xs text-sky-400 font-bold mb-4"></p>
      <div class="bg-slate-950 border border-amber-500/30 rounded-xl p-3 mb-4">
        <div class="text-[10px] font-extrabold text-amber-400 uppercase">Mot de passe actuel</div>
        <div id="pass-modal-current" class="mono text-sm font-black text-amber-200 mt-1"></div>
      </div>
      <div>
        <div class="flex justify-between items-center mb-1">
          <label class="text-xs font-bold text-slate-300">Nouveau mot de passe</label>
          <button type="button" onclick="genPass('edit-pass-input')" class="text-xs text-sky-400 font-bold cursor-pointer">🎲 Générer aléatoire</button>
        </div>
        <input id="edit-pass-input" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white mono" />
        <div class="flex gap-2 mt-2">
          <button onclick="document.getElementById('edit-pass-input').value='123456'" class="px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[11px] font-bold cursor-pointer">+ 123456</button>
          <button onclick="document.getElementById('edit-pass-input').value='user2026'" class="px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[11px] font-bold cursor-pointer">+ user2026</button>
          <button onclick="document.getElementById('edit-pass-input').value='win2026'" class="px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[11px] font-bold cursor-pointer">+ win2026</button>
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <button onclick="closePassModal()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer">Annuler</button>
        <button onclick="submitEditPassword()" class="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black cursor-pointer">💾 Enregistrer</button>
      </div>
    </div>
  </div>

  <script>
    let token = localStorage.getItem('xbet_admin_jwt') || '';
    let users = [];
    let showAllPasswords = false;
    let visiblePassMap = {};
    let activePassUserId = null;

    const FEATURES = [
      { key: 'studio_match', label: '⚽ Match/FIFA' },
      { key: 'studio_tv', label: '🃏 TV Poker' },
      { key: 'studio_mk', label: '🐉 Mortal Kombat' },
      { key: 'game_crash', label: '✈️ Crash' },
      { key: 'game_apple', label: '🍎 Apple' },
      { key: 'game_royal_feast', label: '🍗 Royal Feast' },
      { key: 'game_kamikaze', label: '💣 Kamikaze' },
    ];

    function showToast(msg, isError = false) {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.className = 'fixed top-4 right-4 z-50 px-5 py-3 rounded-xl font-bold text-sm shadow-2xl ' +
        (isError ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white');
      setTimeout(() => { el.className = 'hidden'; }, 3000);
    }

    function genPass(inputId) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
      let res = '';
      for (let i = 0; i < 7; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
      document.getElementById(inputId).value = res;
    }

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-user').value.trim();
      const password = document.getElementById('login-pass').value.trim();
      const errEl = document.getElementById('login-error');
      errEl.classList.add('hidden');
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, deviceId: 'web-admin-console' })
        });
        const data = await res.json();
        if (!res.ok || !data.success || data.user?.role !== 'ADMIN') {
          errEl.textContent = data.error || 'Accès réservé à l\\'administrateur principal.';
          errEl.classList.remove('hidden');
          return;
        }
        token = data.token;
        localStorage.setItem('xbet_admin_jwt', token);
        initDashboard();
      } catch (err) {
        errEl.textContent = 'Erreur réseau : ' + err.message;
        errEl.classList.remove('hidden');
      }
    });

    function logout() {
      token = '';
      localStorage.removeItem('xbet_admin_jwt');
      document.getElementById('dashboard-screen').classList.add('hidden');
      document.getElementById('login-screen').classList.remove('hidden');
    }

    async function initDashboard() {
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('dashboard-screen').classList.remove('hidden');
      await fetchUsers();
    }

    async function fetchUsers() {
      try {
        const res = await fetch('/api/admin/users', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.status === 401 || res.status === 403) return logout();
        const data = await res.json();
        if (data.success) {
          users = (data.users || []).filter(u => u.role === 'USER');
          updateKpis();
          renderUsers();
        }
      } catch (err) {
        showToast('Erreur de synchronisation', true);
      }
    }

    function updateKpis() {
      document.getElementById('kpi-total').textContent = users.length;
      document.getElementById('kpi-online').textContent = users.filter(u => u.hasActiveSession).length;
      document.getElementById('kpi-blocked').textContent = users.filter(u => u.isBlocked).length;
      const totalBal = users.reduce((acc, u) => acc + (Number(u.balance) || 0), 0);
      document.getElementById('kpi-balance').textContent = totalBal.toLocaleString('fr-FR') + ' ₣';
    }

    function toggleAllPasswords() {
      showAllPasswords = !showAllPasswords;
      visiblePassMap = {};
      const btn = document.getElementById('toggle-all-pass-btn');
      btn.textContent = showAllPasswords ? '🙈 Masquer tous les mots de passe' : '👁️ Voir tous les mots de passe';
      renderUsers();
    }

    function toggleOnePass(id) {
      const current = (id in visiblePassMap) ? visiblePassMap[id] : showAllPasswords;
      visiblePassMap[id] = !current;
      renderUsers();
    }

    function copyText(txt, label) {
      navigator.clipboard.writeText(txt);
      showToast(label + ' copié : ' + txt);
    }

    function renderUsers() {
      const q = (document.getElementById('search-input').value || '').toLowerCase();
      const filtered = users.filter(u => u.username.toLowerCase().includes(q) || String(u.id).toLowerCase().includes(q));
      const container = document.getElementById('users-grid');

      if (filtered.length === 0) {
        container.innerHTML = '<div class="col-span-2 glass rounded-2xl p-10 text-center text-slate-400">Aucun compte utilisateur trouvé.</div>';
        return;
      }

      container.innerHTML = filtered.map(u => {
        const isPassVis = (u.id in visiblePassMap) ? visiblePassMap[u.id] : showAllPasswords;
        const rawPass = u.rawPassword || (u.password && !String(u.password).startsWith('$2') ? u.password : '🔒 Chiffré (Cliquez sur Modifier)');
        const perms = Array.isArray(u.allowedFeatures) ? u.allowedFeatures : FEATURES.map(f => f.key);

        return \`
          <div class="glass rounded-2xl p-5 flex flex-col justify-between border border-slate-800/90">
            <div>
              <!-- Header -->
              <div class="flex items-center justify-between gap-2 mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center font-black text-sky-400 text-lg">
                    \${u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div class="font-black text-white text-base">\${u.username}</div>
                    <div class="text-[11px] text-slate-400 mono">ID: \${u.id}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-md text-[10px] font-extrabold \${u.hasActiveSession ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'}">
                    \${u.hasActiveSession ? '🟢 En ligne' : '⚪ Hors ligne'}
                  </span>
                  <span class="px-2.5 py-1 rounded-md text-[10px] font-extrabold \${!u.isBlocked ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}">
                    \${!u.isBlocked ? 'Actif' : 'Bloqué'}
                  </span>
                </div>
              </div>

              <!-- Password Box -->
              <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-3 flex items-center justify-between gap-2">
                <div>
                  <div class="text-[10px] font-extrabold text-amber-400 uppercase">🔑 Mot de passe</div>
                  <div class="mono text-sm font-black \${isPassVis ? 'text-amber-300' : 'text-slate-500'} mt-0.5">
                    \${isPassVis ? rawPass : '••••••••••••'}
                  </div>
                </div>
                <div class="flex items-center gap-1.5">
                  <button onclick="toggleOnePass('\${u.id}')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold cursor-pointer">
                    \${isPassVis ? '🙈' : '👁️'}
                  </button>
                  <button onclick="copyText('\${rawPass}', 'Mot de passe')" class="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold cursor-pointer">
                    Copier
                  </button>
                  <button onclick="openPassModal('\${u.id}')" class="px-2.5 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-bold cursor-pointer">
                    ✏️ Modifier
                  </button>
                </div>
              </div>

              <!-- Balance Box -->
              <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-3 flex items-center justify-between gap-2">
                <div>
                  <div class="text-[10px] font-extrabold text-slate-400 uppercase">💰 Solde Actuel</div>
                  <div class="text-base font-black text-emerald-400 mt-0.5">\${Number(u.balance || 0).toLocaleString('fr-FR')} FCFA</div>
                </div>
                <div class="flex items-center gap-1.5">
                  <button onclick="quickAddBalance('\${u.id}', \${Number(u.balance || 0) + 10000})" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold cursor-pointer">+10k ₣</button>
                  <button onclick="quickAddBalance('\${u.id}', \${Number(u.balance || 0) + 50000})" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold cursor-pointer">+50k ₣</button>
                  <button onclick="promptBalance('\${u.id}', \${Number(u.balance || 0)})" class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold cursor-pointer">Définir</button>
                </div>
              </div>

              <!-- Permissions Chips -->
              <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-3">
                <div class="text-[10px] font-extrabold text-purple-400 uppercase mb-2">🎮 Accès Studios & Jeux (Cliquez pour activer/désactiver)</div>
                <div class="flex flex-wrap gap-1.5">
                  \${FEATURES.map(f => {
                    const enabled = perms.includes(f.key);
                    return \`<button onclick="toggleFeature('\${u.id}', '\${f.key}')" class="px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition \${enabled ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300' : 'bg-slate-900 border border-slate-800 text-slate-600 line-through'}">\${f.label}</button>\`;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
              <button onclick="resetDevice('\${u.id}')" class="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold cursor-pointer">
                📱 Changer d'appareil (\${u.boundDeviceId ? 'Lié' : 'Libre'})
              </button>
              <div class="flex items-center gap-2">
                <button onclick="toggleBlock('\${u.id}', \${!u.isBlocked})" class="px-3 py-1.5 rounded-lg \${u.isBlocked ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'} text-xs font-bold cursor-pointer">
                  \${u.isBlocked ? '🔓 Débloquer' : '🔒 Bloquer'}
                </button>
                <button onclick="deleteAccount('\${u.id}', '\${u.username}')" class="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold cursor-pointer">
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function openCreateModal() {
      document.getElementById('new-username').value = '';
      genPass('new-password');
      document.getElementById('create-modal').classList.remove('hidden');
      document.getElementById('create-modal').classList.add('flex');
    }
    function closeCreateModal() {
      document.getElementById('create-modal').classList.add('hidden');
      document.getElementById('create-modal').classList.remove('flex');
    }

    async function submitCreateUser() {
      const username = document.getElementById('new-username').value.trim();
      const password = document.getElementById('new-password').value.trim();
      const initialBalance = Number(document.getElementById('new-balance').value) || 0;
      if (!username || !password) return showToast('Veuillez remplir tous les champs', true);
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ username, password, initialBalance })
      });
      const data = await res.json();
      if (!res.ok || !data.success) return showToast(data.error || 'Erreur création', true);
      closeCreateModal();
      showToast('Compte ' + username + ' créé !');
      fetchUsers();
    }

    function openPassModal(userId) {
      const u = users.find(x => String(x.id) === String(userId));
      if (!u) return;
      activePassUserId = u.id;
      const cur = u.rawPassword || (u.password && !String(u.password).startsWith('$2') ? u.password : 'Chiffré');
      document.getElementById('pass-modal-sub').textContent = 'Compte : ' + u.username + ' (#' + u.id + ')';
      document.getElementById('pass-modal-current').textContent = cur;
      document.getElementById('edit-pass-input').value = cur !== 'Chiffré' ? cur : '';
      document.getElementById('pass-modal').classList.remove('hidden');
      document.getElementById('pass-modal').classList.add('flex');
    }
    function closePassModal() {
      document.getElementById('pass-modal').classList.add('hidden');
      document.getElementById('pass-modal').classList.remove('flex');
    }

    async function submitEditPassword() {
      const newPassword = document.getElementById('edit-pass-input').value.trim();
      if (!newPassword || newPassword.length < 3) return showToast('Minimum 3 caractères requis', true);
      const res = await fetch('/api/admin/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ userId: activePassUserId, newPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) return showToast(data.error || 'Erreur modification', true);
      visiblePassMap[activePassUserId] = true;
      closePassModal();
      showToast('Mot de passe mis à jour : ' + newPassword);
      fetchUsers();
    }

    async function quickAddBalance(userId, newBalance) {
      await fetch('/api/admin/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ userId, newBalance })
      });
      showToast('Solde mis à jour : ' + newBalance.toLocaleString('fr-FR') + ' ₣');
      fetchUsers();
    }

    function promptBalance(userId, current) {
      const val = prompt('Nouveau solde (FCFA) :', current);
      if (val === null || isNaN(Number(val))) return;
      quickAddBalance(userId, Number(val));
    }

    async function toggleFeature(userId, key) {
      const u = users.find(x => String(x.id) === String(userId));
      if (!u) return;
      const cur = Array.isArray(u.allowedFeatures) ? u.allowedFeatures : FEATURES.map(f => f.key);
      const next = cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key];
      await fetch('/api/admin/update-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ userId, allowedFeatures: next })
      });
      showToast('Permissions mises à jour');
      fetchUsers();
    }

    async function resetDevice(userId) {
      await fetch('/api/admin/reset-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ userId })
      });
      showToast('Appareil dissocié avec succès');
      fetchUsers();
    }

    async function toggleBlock(userId, isBlocked) {
      let reason = null;
      if (isBlocked) {
        reason = prompt('Motif du blocage :', "Utilisateur situé en Côte d'Ivoire (Zone interdite)");
        if (reason === null) return;
      }
      await fetch('/api/admin/block-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ userId, isBlocked, reason })
      });
      showToast(isBlocked ? 'Compte suspendu' : 'Compte débloqué');
      fetchUsers();
    }

    async function deleteAccount(userId, username) {
      if (!confirm('Supprimer définitivement le compte ' + username + ' ?')) return;
      await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ userId })
      });
      showToast('Compte supprimé');
      fetchUsers();
    }

    if (token) initDashboard();
  </script>
</body>
</html>`;
}
