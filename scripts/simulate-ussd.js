const API_URL = process.env.USSD_API_URL || 'http://localhost:3001/api/v1/ussd/callback';
const DEFAULT_PHONE = process.env.USSD_PHONE || '+22601010101';
const DEFAULT_SESSION = process.env.USSD_SESSION_ID || 'sim_session_123';

/**
 * Simule le fonctionnement d'une requête USSD depuis le gateway d'un opérateur (ex: Orange/Moov) vers notre backend NestJS.
 */
async function simulateUssd(phoneNumber, text) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: DEFAULT_SESSION,
        serviceCode: '*222#',
        phoneNumber: phoneNumber,
        text: text, // Format: "" pour l'accueil, "1" pour l'option 1, "1*1" pour sous-option, etc.
      }),
    });

    const data = await response.text();
    console.log(`[TÉLÉPHONE: ${phoneNumber} | SAISIE: "${text}"]`);
    console.log(data);
    console.log('--------------------------------------------------\n');
  } catch (error) {
    console.error(`Erreur: Le backend est-il lancé ? (npm run dev:all) -`, error.message);
  }
}

async function runSimulation() {
  console.log('📱 DÉMARRAGE DE LA SIMULATION USSD FASOCARE (*222#)\n');
  
  // 1. Un utilisateur non inscrit tape *222#
  await simulateUssd('+22600000000', '');

  // 2. L'administrateur (Demo) tape *222#
  await simulateUssd(DEFAULT_PHONE, '');

  // 3. Il explore le dossier santé
  await simulateUssd(DEFAULT_PHONE, '1');
  await simulateUssd(DEFAULT_PHONE, '1*1');

  // 4. Il confirme un rendez-vous
  await simulateUssd(DEFAULT_PHONE, '2');
  await simulateUssd(DEFAULT_PHONE, '2*1*2*3');

  // 5. Il signale un cas suspect
  await simulateUssd(DEFAULT_PHONE, '4');
  await simulateUssd(DEFAULT_PHONE, '4*2');
}

runSimulation();
