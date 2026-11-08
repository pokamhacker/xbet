/**
 * ============================================================================
 * BOT KAMIKAZE — LOGIQUE JAVASCRIPT & PRÉDICTIONS INTELLIGENTES
 * Audio Web API, Grille 5x5, Multiplicateurs Réactifs & Sauvegarde Locale
 * ============================================================================
 */

(function () {
  'use strict';

  // --- CONFIGURATION PAR DÉFAUT ---
  const DEFAULT_CONFIG = {
    userId: '610954713',
    promoCode: 'MC8899',
    telegramUrl: 'https://t.me/',
    youtubeUrl: 'https://youtube.com/',
    whatsappUrl: 'https://wa.me/',
    accuracy: '98.8%',
    soundEnabled: true,
    activeBrand: '1XBET',
  };

  // Chargement de la configuration sauvegardée
  let botConfig = { ...DEFAULT_CONFIG };
  try {
    const saved = localStorage.getItem('kamikaze_bot_config');
    if (saved) {
      botConfig = { ...botConfig, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Erreur chargement config locale:', e);
  }

  // --- ÉTAT DU JEU (14 NIVEAUX KAMIKAZE JUSQU'À COTE x10) ---
  // 14 rangées : index 13 (bas / départ, x1.2) jusqu'à index 0 (haut / sommet, x10)
  // Chaque rangée a 5 colonnes (0 à 4)
  const MULTIPLIERS = [
    { row: 0, mult: 'x10', label: 'Cote Maximale x10.0' },
    { row: 1, mult: 'x9.0', label: 'Cote x9.0' },
    { row: 2, mult: 'x8.0', label: 'Cote x8.0' },
    { row: 3, mult: 'x7.0', label: 'Cote x7.0' },
    { row: 4, mult: 'x6.0', label: 'Cote x6.0' },
    { row: 5, mult: 'x5.0', label: 'Cote x5.0' },
    { row: 6, mult: 'x4.0', label: 'Cote x4.0' },
    { row: 7, mult: 'x3.5', label: 'Cote x3.5' },
    { row: 8, mult: 'x3', label: 'Cote x3' },
    { row: 9, mult: 'x2.5', label: 'Cote x2.5' },
    { row: 10, mult: 'x2', label: 'Cote x2' },
    { row: 11, mult: 'x1.6', label: 'Cote x1.6' },
    { row: 12, mult: 'x1.4', label: 'Cote x1.4' },
    { row: 13, mult: 'x1.2', label: 'Cote Débutante x1.2' },
  ];

  let currentLevel = 0; // 0 = rien révélé, 1 = rangée 13 (x1.2), ..., 14 = rangée 0 (x10)
  let revealedCells = []; // Liste des cellules contenant un avion
  let isScanning = false;

  // --- ÉLÉMENTS DU DOM ---
  const gridCellsEl = document.getElementById('gridCells');
  const radarScanLineEl = document.getElementById('radarScanLine');
  const btnNewLineEl = document.getElementById('btnNewLine');
  const btnRestartEl = document.getElementById('btnRestart');
  const statusMessageEl = document.getElementById('statusMessage');
  const predictionStatusBannerEl = document.getElementById('predictionStatusBanner');

  const displayUserIdEl = document.getElementById('displayUserId');
  const displayPromoCodeEl = document.getElementById('displayPromoCode');
  const btnCopyPromoEl = document.getElementById('btnCopyPromo');
  const btnQuickEditPromoEl = document.getElementById('btnQuickEditPromo');
  const quickPromoModalEl = document.getElementById('quickPromoModal');
  const quickPromoInputEl = document.getElementById('quickPromoInput');
  const btnSaveQuickPromoEl = document.getElementById('btnSaveQuickPromo');
  const btnCancelQuickPromoEl = document.getElementById('btnCancelQuickPromo');
  const btnCloseQuickPromoEl = document.getElementById('btnCloseQuickPromo');

  const btnLogoutEl = document.getElementById('btnLogout');
  const liveClockEl = document.getElementById('liveClock');
  const onlineCounterEl = document.getElementById('onlineCounter');
  const brandTabs = document.querySelectorAll('.brand-tab');

  const linkTelegramEl = document.getElementById('linkTelegram');
  const linkYoutubeEl = document.getElementById('linkYoutube');
  const linkWhatsappEl = document.getElementById('linkWhatsapp');

  const btnToggleSoundEl = document.getElementById('btnToggleSound');
  const iconSoundOnEl = document.getElementById('iconSoundOn');
  const iconSoundOffEl = document.getElementById('iconSoundOff');

  const settingsModalEl = document.getElementById('settingsModal');
  const btnOpenSettingsEl = document.getElementById('btnOpenSettings');
  const btnEditProfileEl = document.getElementById('btnEditProfile');
  const btnCloseSettingsEl = document.getElementById('btnCloseSettings');
  const btnCancelSettingsEl = document.getElementById('btnCancelSettings');
  const btnSaveSettingsEl = document.getElementById('btnSaveSettings');

  const inputUserIdEl = document.getElementById('inputUserId');
  const inputPromoCodeEl = document.getElementById('inputPromoCode');
  const inputTelegramEl = document.getElementById('inputTelegram');
  const inputYoutubeEl = document.getElementById('inputYoutube');
  const inputWhatsappEl = document.getElementById('inputWhatsapp');
  const selectAccuracyEl = document.getElementById('selectAccuracy');

  const toastBoxEl = document.getElementById('toastBox');
  const toastMessageEl = document.getElementById('toastMessage');

  // --- MOTEUR AUDIO WEB API ULTRA-RÉACTIF (ZÉRO DÉPENDANCE EXTERNE) ---
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx && typeof window.AudioContext !== 'undefined') {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, duration = 0.1, type = 'sine', gainVal = 0.15) {
    if (!botConfig.soundEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio bloqué par le navigateur avant interaction
    }
  }

  function playRadarScanSound() {
    if (!botConfig.soundEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.32);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.32);
    } catch (e) {}
  }

  function playPlaneLockSound() {
    if (!botConfig.soundEnabled) return;
    playTone(784, 0.12, 'square', 0.14); // G5
    setTimeout(() => {
      playTone(1046.5, 0.22, 'sine', 0.2); // C6
    }, 90);
  }

  function playLevelUpSound() {
    if (!botConfig.soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 0.15, 'triangle', 0.16), idx * 70);
    });
  }

  function playVictorySound() {
    if (!botConfig.soundEnabled) return;
    const chords = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    chords.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 0.35, 'triangle', 0.18), idx * 90);
    });
  }

  function playResetSound() {
    if (!botConfig.soundEnabled) return;
    playTone(600, 0.08, 'sine', 0.1);
    setTimeout(() => playTone(400, 0.12, 'sine', 0.08), 70);
  }

  function triggerHaptic() {
    if (navigator.vibrate) {
      navigator.vibrate(45);
    }
  }

  // --- SVG DE L'AVION KAMIKAZE HAUTE DÉFINITION ---
  // Avion rouge avec ailes à bouts blancs et cockpit réaliste (100% transparent, zéro carré noir)
  function createPlaneSVG() {
    return `
      <svg class="plane-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Ombre portée portée sous l'avion sur l'eau -->
          <filter id="planeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="5" stdDeviation="3.5" flood-color="#020E1C" flood-opacity="0.85"/>
          </filter>
          <!-- Dégradé carlingue rouge vif -->
          <linearGradient id="fuselageRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF3B30" />
            <stop offset="60%" stop-color="#D32F2F" />
            <stop offset="100%" stop-color="#9A0007" />
          </linearGradient>
          <!-- Dégradé ailes -->
          <linearGradient id="wingsRed" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stop-color="#B71C1C" />
            <stop offset="50%" stop-color="#F44336" />
            <stop offset="100%" stop-color="#B71C1C" />
          </linearGradient>
          <!-- Reflet verrière cockpit -->
          <linearGradient id="cockpitGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E0F7FA" />
            <stop offset="40%" stop-color="#80DEEA" />
            <stop offset="100%" stop-color="#006064" />
          </linearGradient>
          <!-- Hélice jaune / blanche animée -->
          <linearGradient id="propellerGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF59D" />
            <stop offset="100%" stop-color="#F57F17" />
          </linearGradient>
        </defs>

        <g filter="url(#planeShadow)">
          <!-- Ailes principales -->
          <path d="M 6 42 Q 50 49 94 42 L 91 54 Q 50 60 9 54 Z" fill="url(#wingsRed)" stroke="#7F0000" stroke-width="1"/>
          
          <!-- Bandes blanches d'identification sur aile gauche -->
          <polygon points="12,43 18,44 16,53 10,52" fill="#FFFFFF" opacity="0.95"/>
          <polygon points="20,44 24,45 22,54 18,53" fill="#FFFFFF" opacity="0.95"/>

          <!-- Bandes blanches sur aile droite -->
          <polygon points="82,43 88,42 90,52 84,53" fill="#FFFFFF" opacity="0.95"/>
          <polygon points="76,44 80,43 82,53 78,54" fill="#FFFFFF" opacity="0.95"/>

          <!-- Empennage arrière / Ailerons de queue -->
          <path d="M 32 85 Q 50 88 68 85 L 66 93 Q 50 95 34 93 Z" fill="url(#wingsRed)"/>
          <polygon points="35,86 40,86 39,92 34,92" fill="#FFFFFF"/>
          <polygon points="60,86 65,86 66,92 61,92" fill="#FFFFFF"/>

          <!-- Fuselage principal profilé -->
          <path d="M 50 6 C 56 16 57 74 53 96 L 47 96 C 43 74 44 16 50 6 Z" fill="url(#fuselageRed)" stroke="#7F0000" stroke-width="0.8"/>
          
          <!-- Dérive arrière rouge centrale -->
          <path d="M 49 76 L 51 76 L 52 92 L 48 92 Z" fill="#D32F2F"/>

          <!-- Cockpit / Verrière avec reflet brillant -->
          <ellipse cx="50" cy="38" rx="4.5" ry="11" fill="url(#cockpitGlass)"/>
          <ellipse cx="48.5" cy="35" rx="1.8" ry="6" fill="#FFFFFF" opacity="0.75"/>

          <!-- Nez / Cône d'hélice -->
          <ellipse cx="50" cy="8" rx="3.5" ry="3.5" fill="#B71C1C"/>

          <!-- Pales de l'hélice (forme dynamique) -->
          <ellipse cx="50" cy="7" rx="14" ry="2.2" fill="url(#propellerGold)" opacity="0.85" transform="rotate(-15 50 7)"/>
        </g>
      </svg>
    `;
  }

  // --- INITIALISATION DE LA GRILLE 5x10 (10 RANGÉES x 5 COLONNES) ---
  function buildGrid() {
    gridCellsEl.innerHTML = '';
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.id = `cell-${r}-${c}`;
        gridCellsEl.appendChild(cell);
      }
    }
  }

  // --- MISE À JOUR DES 10 BADGES MULTIPLICATEURS (x1.2 JUSQU'À x10) ---
  function updateMultiplierBadges() {
    MULTIPLIERS.forEach((m) => {
      const badge = document.getElementById(`multBadge-${m.row}`);
      if (!badge) return;

      // Les 10 multiplicateurs sont ordonnés de bas (row 9 = x1.2) à haut (row 0 = x10)
      // row 9 est atteint quand currentLevel >= 1
      // row 8 quand currentLevel >= 2
      // ...
      // row 0 quand currentLevel >= 10
      const requiredLevel = 10 - m.row;
      if (currentLevel >= requiredLevel) {
        badge.classList.add('active');
      } else {
        badge.classList.remove('active');
      }
    });
  }

  // --- ACTION : "+ NOUVELLE LIGNE" ---
  function handleNewLine() {
    if (isScanning) return;

    if (currentLevel >= 10) {
      showToast('Toutes les 10 lignes sont décodées ! Cliquez sur RECOMMENCER.');
      playTone(350, 0.15, 'sawtooth', 0.12);
      return;
    }

    isScanning = true;
    btnNewLineEl.style.opacity = '0.7';
    triggerHaptic();
    playRadarScanSound();

    // 1. Déclencher le balayage radar visuel
    radarScanLineEl.classList.remove('scanning');
    void radarScanLineEl.offsetWidth; // Force reflow
    radarScanLineEl.classList.add('scanning');

    // 2. Déterminer la ligne cible (on commence par le bas : row 9, puis row 8, ..., jusqu'à row 0)
    const targetRow = 9 - currentLevel;
    const targetMultiplier = MULTIPLIERS.find((m) => m.row === targetRow);

    statusMessageEl.textContent = `Scan algorithmique de la ligne ${currentLevel + 1}/10...`;

    setTimeout(() => {
      // 3. Choisir une colonne prédictive pour cette ligne (entre 0 et 4)
      const chosenCol = Math.floor(Math.random() * 5);
      const targetCell = document.getElementById(`cell-${targetRow}-${chosenCol}`);

      if (targetCell) {
        // Insertion de l'avion dans la case
        const planeWrapper = document.createElement('div');
        planeWrapper.className = 'plane-sprite';
        planeWrapper.innerHTML = createPlaneSVG();
        targetCell.appendChild(planeWrapper);
        revealedCells.push(targetCell);

        // Légère rotation aléatoire pour effet naturel (-8deg à +8deg)
        const randomRot = (Math.random() * 16 - 8).toFixed(1);
        planeWrapper.style.transform = `rotate(${randomRot}deg)`;
      }

      // 4. Augmenter le niveau
      currentLevel++;
      updateMultiplierBadges();
      triggerHaptic();
      playPlaneLockSound();

      // 5. Message de statut
      if (currentLevel < 10) {
        statusMessageEl.textContent = `Ligne ${currentLevel}/10 validée • Cote ${targetMultiplier ? targetMultiplier.mult : ''} sécurisée (${botConfig.accuracy})`;
        playLevelUpSound();
      } else {
        statusMessageEl.textContent = `🏆 SIGNAL COMPLET ! Cote x10 validée avec succès !`;
        playVictorySound();
        showToast('Félicitations ! Parcours complet Kamikaze x10 validé !');
      }

      isScanning = false;
      btnNewLineEl.style.opacity = '1';
    }, 400);
  }

  // --- ACTION : "↻ RECOMMENCER" ---
  function handleRestart() {
    triggerHaptic();
    playResetSound();

    // Vider les avions existants avec animation
    const existingPlanes = gridCellsEl.querySelectorAll('.plane-sprite');
    existingPlanes.forEach((p) => {
      p.style.transition = 'all 0.25s ease';
      p.style.transform = 'scale(0) rotate(20deg)';
      p.style.opacity = '0';
    });

    setTimeout(() => {
      revealedCells = [];
      currentLevel = 0;
      buildGrid();
      updateMultiplierBadges();
      statusMessageEl.textContent = 'Grille réinitialisée. Prêt pour le prochain signal.';
      showToast('Grille réinitialisée avec succès.');
    }, 200);
  }

  // --- HORLOGE EN TEMPS RÉEL (FORMAT HH:MM) ---
  function updateLiveClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    if (liveClockEl) {
      liveClockEl.textContent = `${h}:${m}`;
    }
  }

  // --- COMPTEUR DYNAMIQUE DES PERSONNES CONNECTÉES ---
  let baseOnline = 2224;
  function updateOnlineCounter() {
    // Fluctuation naturelle entre -6 et +8 personnes
    const delta = Math.floor(Math.random() * 15) - 6;
    baseOnline = Math.max(1850, Math.min(2750, baseOnline + delta));
    if (onlineCounterEl) {
      onlineCounterEl.textContent = baseOnline.toLocaleString('fr-FR');
    }
  }

  // --- COPIE DU CODE PROMO ---
  function handleCopyPromo() {
    triggerHaptic();
    playTone(880, 0.1, 'sine', 0.15);

    const code = botConfig.promoCode || '25TOTO';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        showToast(`Code Promo "${code}" copié ! (Cliquez sur ✏️ pour le personnaliser)`);
      }).catch(() => {
        showToast(`Code Promo : ${code}`);
      });
    } else {
      showToast(`Code Promo : ${code}`);
    }
  }

  // --- TOAST DE NOTIFICATION FLOTTANT ---
  let toastTimer = null;
  function showToast(message) {
    if (!toastBoxEl || !toastMessageEl) return;
    toastMessageEl.textContent = message;
    toastBoxEl.classList.remove('hidden');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastBoxEl.classList.add('hidden');
    }, 2800);
  }

  // --- GESTION DU SON (MUTE / UNMUTE) ---
  function updateSoundUI() {
    if (botConfig.soundEnabled) {
      iconSoundOnEl.classList.remove('hidden');
      iconSoundOffEl.classList.add('hidden');
    } else {
      iconSoundOnEl.classList.add('hidden');
      iconSoundOffEl.classList.remove('hidden');
    }
  }

  function toggleSound() {
    botConfig.soundEnabled = !botConfig.soundEnabled;
    saveConfig();
    updateSoundUI();
    showToast(botConfig.soundEnabled ? 'Sons activés' : 'Sons coupés');
    if (botConfig.soundEnabled) {
      playTone(800, 0.1, 'sine', 0.15);
    }
  }

  // --- SÉLECTION DES MARQUES (1XBET, MELBET, MEGAPARI) ---
  function handleBrandSelect(e) {
    const tab = e.currentTarget;
    const brand = tab.dataset.brand;
    brandTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    botConfig.activeBrand = brand;
    saveConfig();
    triggerHaptic();
    playTone(700, 0.08, 'triangle', 0.12);

    statusMessageEl.textContent = `Serveur connecté : ${brand} (Précision ${botConfig.accuracy})`;
    showToast(`Plateforme sélectionnée : ${brand}`);
  }

  // --- PERSONNALISATION RAPIDE DU CODE PROMO (À TOUT MOMENT DANS LE BOT) ---
  function openQuickPromoModal() {
    triggerHaptic();
    playTone(600, 0.08, 'sine', 0.1);
    if (quickPromoInputEl) {
      quickPromoInputEl.value = botConfig.promoCode || 'MC8899';
    }
    if (quickPromoModalEl) {
      quickPromoModalEl.classList.remove('hidden');
      if (quickPromoInputEl) {
        setTimeout(() => {
          quickPromoInputEl.focus();
          quickPromoInputEl.select();
        }, 120);
      }
    }
  }

  function closeQuickPromoModal() {
    if (quickPromoModalEl) {
      quickPromoModalEl.classList.add('hidden');
    }
  }

  function saveQuickPromo() {
    const rawVal = quickPromoInputEl ? quickPromoInputEl.value.trim() : '';
    const newCode = (rawVal || 'MC8899').toUpperCase();
    botConfig.promoCode = newCode;
    saveConfig();
    applyConfigUI();
    closeQuickPromoModal();
    showToast(`Code Promo mis à jour : ${newCode}`);
    playTone(880, 0.15, 'triangle', 0.18);
  }

  // --- MODALE DES PARAMÈTRES GÉNÉRAUX ---
  function openSettings() {
    triggerHaptic();
    playTone(600, 0.08, 'sine', 0.1);

    inputUserIdEl.value = botConfig.userId;
    inputPromoCodeEl.value = botConfig.promoCode;
    inputTelegramEl.value = botConfig.telegramUrl;
    inputYoutubeEl.value = botConfig.youtubeUrl;
    inputWhatsappEl.value = botConfig.whatsappUrl;
    selectAccuracyEl.value = botConfig.accuracy;

    settingsModalEl.classList.remove('hidden');
  }

  function closeSettings() {
    settingsModalEl.classList.add('hidden');
  }

  function saveSettings() {
    botConfig.userId = inputUserIdEl.value.trim() || DEFAULT_CONFIG.userId;
    botConfig.promoCode = inputPromoCodeEl.value.trim().toUpperCase() || DEFAULT_CONFIG.promoCode;
    botConfig.telegramUrl = inputTelegramEl.value.trim() || DEFAULT_CONFIG.telegramUrl;
    botConfig.youtubeUrl = inputYoutubeEl.value.trim() || DEFAULT_CONFIG.youtubeUrl;
    botConfig.whatsappUrl = inputWhatsappEl.value.trim() || DEFAULT_CONFIG.whatsappUrl;
    botConfig.accuracy = selectAccuracyEl.value || DEFAULT_CONFIG.accuracy;

    saveConfig();
    applyConfigUI();
    closeSettings();
    showToast('Paramètres sauvegardés avec succès !');
    playTone(880, 0.15, 'triangle', 0.15);
  }

  function saveConfig() {
    try {
      localStorage.setItem('kamikaze_bot_config', JSON.stringify(botConfig));
    } catch (e) {}
  }

  function applyConfigUI() {
    if (displayUserIdEl) displayUserIdEl.textContent = botConfig.userId;
    if (displayPromoCodeEl) displayPromoCodeEl.textContent = botConfig.promoCode;
    if (quickPromoInputEl) quickPromoInputEl.value = botConfig.promoCode;
    if (inputPromoCodeEl) inputPromoCodeEl.value = botConfig.promoCode;
    if (linkTelegramEl) linkTelegramEl.href = botConfig.telegramUrl;
    if (linkYoutubeEl) linkYoutubeEl.href = botConfig.youtubeUrl;
    if (linkWhatsappEl) linkWhatsappEl.href = botConfig.whatsappUrl;

    // Mise à jour de l'onglet actif
    brandTabs.forEach((tab) => {
      if (tab.dataset.brand === botConfig.activeBrand) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    updateSoundUI();
  }

  // --- ATTACHEMENT DES ÉVÉNEMENTS ---
  function initEvents() {
    if (btnNewLineEl) btnNewLineEl.addEventListener('click', handleNewLine);
    if (btnRestartEl) btnRestartEl.addEventListener('click', handleRestart);
    if (btnCopyPromoEl) btnCopyPromoEl.addEventListener('click', handleCopyPromo);
    if (btnLogoutEl) btnLogoutEl.addEventListener('click', handleRestart);

    // Personnalisation rapide du code promo
    if (btnQuickEditPromoEl) {
      btnQuickEditPromoEl.addEventListener('click', (e) => {
        e.stopPropagation();
        openQuickPromoModal();
      });
    }
    if (btnCloseQuickPromoEl) btnCloseQuickPromoEl.addEventListener('click', closeQuickPromoModal);
    if (btnCancelQuickPromoEl) btnCancelQuickPromoEl.addEventListener('click', closeQuickPromoModal);
    if (btnSaveQuickPromoEl) btnSaveQuickPromoEl.addEventListener('click', saveQuickPromo);
    if (quickPromoInputEl) {
      quickPromoInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          saveQuickPromo();
        } else if (e.key === 'Escape') {
          closeQuickPromoModal();
        }
      });
    }

    if (btnToggleSoundEl) btnToggleSoundEl.addEventListener('click', toggleSound);

    brandTabs.forEach((tab) => tab.addEventListener('click', handleBrandSelect));

    if (btnOpenSettingsEl) btnOpenSettingsEl.addEventListener('click', openSettings);
    if (btnEditProfileEl) btnEditProfileEl.addEventListener('click', openSettings);
    if (btnCloseSettingsEl) btnCloseSettingsEl.addEventListener('click', closeSettings);
    if (btnCancelSettingsEl) btnCancelSettingsEl.addEventListener('click', closeSettings);
    if (btnSaveSettingsEl) btnSaveSettingsEl.addEventListener('click', saveSettings);

    // Clic en dehors des cartes de modale pour fermer
    if (quickPromoModalEl) {
      quickPromoModalEl.addEventListener('click', (e) => {
        if (e.target === quickPromoModalEl) closeQuickPromoModal();
      });
    }
    if (settingsModalEl) {
      settingsModalEl.addEventListener('click', (e) => {
        if (e.target === settingsModalEl) closeSettings();
      });
    }

    // Navigation Android du bas
    const btnNavBackEl = document.getElementById('btnNavBack');
    const btnNavHomeEl = document.getElementById('btnNavHome');
    if (btnNavBackEl) btnNavBackEl.addEventListener('click', handleRestart);
    if (btnNavHomeEl) btnNavHomeEl.addEventListener('click', () => showToast('Accueil Bot Kamikaze'));

    // Clavier pour accessibilité
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleNewLine();
      } else if (e.code === 'KeyR') {
        handleRestart();
      } else if (e.key === 'Escape') {
        closeSettings();
        closeQuickPromoModal();
      }
    });
  }

  // --- DÉMARRAGE ---
  function init() {
    buildGrid();
    updateMultiplierBadges();
    applyConfigUI();
    initEvents();

    updateLiveClock();
    setInterval(updateLiveClock, 30000);

    updateOnlineCounter();
    setInterval(updateOnlineCounter, 4000);

    // Initialisation au premier toucher utilisateur pour débloquer le son
    document.addEventListener('pointerdown', function onFirstPointer() {
      initAudioContext();
      document.removeEventListener('pointerdown', onFirstPointer);
    }, { once: true });
  }

  // Lancement dès que le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
