const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

function copyDirectory(src, dest) {
  if (fs.existsSync(src)) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.cpSync(src, dest, {
      recursive: true,
      force: true,
      filter: (source) => {
        const ext = path.extname(source).toLowerCase();
        return !['.apk', '.zip', '.rar', '.tar', '.gz'].includes(ext);
      },
    });
    console.log(`Copied ${src} -> ${dest}`);
  }
}

// 1. Synchroniser le dossier complet assets/ dans dist/assets/
const assetsSrc = path.join(rootDir, 'assets');
const assetsDest = path.join(distDir, 'assets');
copyDirectory(assetsSrc, assetsDest);

// 2. Synchroniser bot-kamikaze/ dans dist/bot-kamikaze/
const botKamikazeSrc = path.join(rootDir, 'bot-kamikaze');
const botKamikazeDest = path.join(distDir, 'bot-kamikaze');
copyDirectory(botKamikazeSrc, botKamikazeDest);

// 3. Synchroniser bot-royal-feast/ dans dist/bot-royal-feast/
const botRoyalFeastSrc = path.join(rootDir, 'bot-royal-feast');
const botRoyalFeastDest = path.join(distDir, 'bot-royal-feast');
copyDirectory(botRoyalFeastSrc, botRoyalFeastDest);

// 4. Synchroniser les assets des jeux de src/ dans dist/src/
const srcGames = path.join(rootDir, 'src', 'games');
const destGames = path.join(distDir, 'src', 'games');
copyDirectory(srcGames, destGames);

// 5. Copier les médias racines (.png, .jpg, .jpeg, .mp4, .svg) dans dist/
const mediaExts = new Set(['.png', '.jpg', '.jpeg', '.mp4', '.gif', '.webp', '.svg', '.wav', '.mp3']);
const rootFiles = fs.readdirSync(rootDir);
for (const file of rootFiles) {
  const fullPath = path.join(rootDir, file);
  if (fs.statSync(fullPath).isFile()) {
    const ext = path.extname(file).toLowerCase();
    if (mediaExts.has(ext)) {
      fs.copyFileSync(fullPath, path.join(distDir, file));
    }
  }
}
console.log('Root media files copied to dist/');

// 6. Configurer vercel.json dans dist/
const vercelConfig = {
  version: 2,
  cleanUrls: true,
  rewrites: [
    {
      source: '/(.*)',
      destination: '/index.html',
    },
  ],
};
fs.writeFileSync(path.join(distDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2), 'utf8');
console.log('dist/vercel.json configured successfully.');

// 7. Copier l'icône de l'application pour Apple Web App (apple-touch-icon.png)
const iconSrc = path.join(rootDir, 'assets', 'icon.png');
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, path.join(distDir, 'apple-touch-icon.png'));
  fs.copyFileSync(iconSrc, path.join(distDir, 'apple-touch-icon-precomposed.png'));
  fs.copyFileSync(iconSrc, path.join(distDir, 'icon.png'));
  console.log('Apple touch icons created in dist/');
}

// 8. Générer manifest.json pour PWA / iOS Standalone
const manifestConfig = {
  short_name: "1xBet",
  name: "1xBet",
  description: "1xBet Bookmaker Studio",
  icons: [
    {
      src: "/apple-touch-icon.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any maskable"
    },
    {
      src: "/apple-touch-icon.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable"
    }
  ],
  start_url: "/",
  background_color: "#EEF2F6",
  theme_color: "#1A568C",
  display: "standalone",
  orientation: "portrait"
};
fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifestConfig, null, 2), 'utf8');
console.log('dist/manifest.json generated.');

// 9. Injecter les méta-tags iOS PWA Standalone et les polices dans dist/index.html
const indexHtmlPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  let html = fs.readFileSync(indexHtmlPath, 'utf8');

  // Ajuster le viewport pour le support plein écran iPhone (Safe Area, Dynamic Island / Notch)
  html = html.replace(
    /<meta\s+name="viewport"[^>]*>/i,
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no, viewport-fit=cover" />'
  );

  // Mettre à jour le titre
  html = html.replace(/<title>.*?<\/title>/i, '<title>1xBet</title>');

  // Balises PWA Apple et Web App Standalone
  const pwaMetaTags = `
    <!-- iOS PWA Standalone Meta Tags (Supprime la barre Safari et lance en vraie application native) -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="1xBet" />
    <meta name="application-name" content="1xBet" />
    <meta name="theme-color" content="#1A568C" />
    <meta name="format-detection" content="telephone=no" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="apple-touch-icon" sizes="192x192" href="/apple-touch-icon.png" />
    <style id="native-touch-feel">
      html, body {
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
        background-color: #EEF2F6;
      }
      input, textarea {
        -webkit-user-select: auto;
        user-select: auto;
      }
    </style>
  `;

  if (!html.includes('apple-mobile-web-app-capable')) {
    html = html.replace('</head>', `${pwaMetaTags}</head>`);
  }

  // Injecter @font-face pour toutes les polices d'icônes
  if (!html.includes('global-vector-icon-fonts')) {
    const fontFaces = `
    <style id="global-vector-icon-fonts">
      @font-face {
        font-family: 'ionicons';
        src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
        font-display: swap;
      }
      @font-face {
        font-family: 'Ionicons';
        src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
        font-display: swap;
      }
      @font-face {
        font-family: 'material-community';
        src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
        font-display: swap;
      }
      @font-face {
        font-family: 'Material Design Icons';
        src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
        font-display: swap;
      }
      @font-face {
        font-family: 'material';
        src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf') format('truetype');
        font-display: swap;
      }
      @font-face {
        font-family: 'Material Icons';
        src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf') format('truetype');
        font-display: swap;
      }
      @font-face {
        font-family: 'FontAwesome';
        src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf') format('truetype');
        font-display: swap;
      }
      @font-face {
        font-family: 'feather';
        src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/Feather.ttf') format('truetype');
        font-display: swap;
      }
    </style>
    `;
    html = html.replace('</head>', `${fontFaces}</head>`);
  }

  fs.writeFileSync(indexHtmlPath, html, 'utf8');
  console.log('Injected iOS PWA meta tags and vector icon fonts into dist/index.html');
}

try {
  require('./sync-users-snapshot.js');
} catch (_) {}
