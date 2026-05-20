const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const MOBILE_API_PATH = path.join(__dirname, '../mobile/src/services/api.js');
const ENV_PATH = path.join(__dirname, '../mobile/.env');

console.log("☁️  Démarrage d'Auto-Tunnel FasoCare...");

// Lancer ngrok sur le port 3001 (Backend API)
const ngrok = spawn('npx', ['ngrok', 'http', '3001', '--log=stdout'], {
  cwd: path.join(__dirname, '..'),
  detached: false
});

ngrok.stderr.on('data', (data) => {
  const msg = data.toString();
  if (msg.includes('started tunnel')) {
    console.log("✅ Ngrok démarré");
  }
});

ngrok.on('error', (err) => {
  console.log("⚠️ Erreur Ngrok:", err.message);
});

console.log("⏳ Attente du tunnel Ngrok...");

const fetchTunnelUrl = () => {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const tunnels = JSON.parse(data).tunnels;
          const apiTunnel = tunnels.find(t => t.config?.addr?.includes('3001') || t.name === 'api');
          if (apiTunnel && apiTunnel.public_url) {
            resolve(apiTunnel.public_url);
          } else {
            reject(new Error("Tunnel API introuvable"));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const pollUrl = async (retries = 30) => {
  for (let i = 0; i < retries; i++) {
    try {
      const url = await fetchTunnelUrl();
      return url;
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error("Impossible d'obtenir l'URL Ngrok après 30s");
};

const injectUrl = async () => {
  try {
    const url = await pollUrl();
    const httpsUrl = url.replace('http://', 'https://');
    console.log(`\n✅ Tunnel HTTPS : ${httpsUrl}`);

    // 1. Injection directe dans api.js (marqueur AUTO_INJECT_URL)
    let apiJsContent = fs.readFileSync(MOBILE_API_PATH, 'utf8');
    const regex = /let CURRENT_URL = '(.*?)'; \/\* AUTO_INJECT_URL \*\//;
    const match = apiJsContent.match(regex);
    if (match) {
      apiJsContent = apiJsContent.replace(
        regex,
        `let CURRENT_URL = '${httpsUrl}'; /* AUTO_INJECT_URL */`
      );
      fs.writeFileSync(MOBILE_API_PATH, apiJsContent);
      console.log("💉 URL injectée dans mobile/src/services/api.js");
    }

    // 2. Écriture du fichier .env pour Expo (lu automatiquement au refresh)
    const envContent = `EXPO_PUBLIC_API_URL=${httpsUrl}\nEXPO_PUBLIC_TUNNEL_URL=${httpsUrl}\n`;
    fs.writeFileSync(ENV_PATH, envContent);
    console.log("💉 Fichier mobile/.env créé (pris en compte au prochain refresh Expo)");

    console.log(`\n🚀 Application prête !`);
    console.log(`📱 URL du backend : ${httpsUrl}`);
    console.log(`📱 Sur le mobile : appui long sur le logo → entrez cette URL`);
    console.log(`\n💡 Si l'app est déjà ouverte, rafraîchissez-la (secouez ou redémarrez Expo)`);
    console.log(`\nAppuyez sur Ctrl+C pour arrêter le tunnel\n`);

  } catch (error) {
    console.error(`\n❌ Échec :`, error.message);
    process.exit(1);
  }
};

injectUrl();
