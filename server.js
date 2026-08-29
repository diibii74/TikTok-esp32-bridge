const express = require('express'); const http = require('http'); const WebSocket = require('ws');
const app = express(); const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => { res.send('Server TikTok WebSocket Attivo!'); });
const server = http.createServer(app); const wss = new WebSocket.Server({ server });
setInterval(() => { wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) { client.ping(); } }); }, 20000);
const TIKTOK_USERNAME = 'manolita772';
async function initTikTok() { try { const mod = await import('tiktok-live-connector');
// Trova la classe valida in qualsiasi tipo di esportazione (CommonJS / ESM)
let WebcastClass = null;
if (typeof mod.WebcastPushConnection === 'function') WebcastClass = mod.WebcastPushConnection;
else if (typeof mod.WebcastPushClient === 'function') WebcastClass = mod.WebcastPushClient;
else if (mod.default && typeof mod.default.WebcastPushConnection === 'function') WebcastClass = mod.default.WebcastPushConnection;
else if (mod.default && typeof mod.default.WebcastPushClient === 'function') WebcastClass = mod.default.WebcastPushClient;
else if (typeof mod.default === 'function') WebcastClass = mod.default;
else if (typeof mod === 'function') WebcastClass = mod;

if (!WebcastClass) {
  throw new Error("Impossibile trovare la classe WebcastPushConnection nel modulo");
}

const tiktokLiveConnection = new WebcastClass(TIKTOK_USERNAME);

tiktokLiveConnection.connect()
  .then(state => {
    console.log('CONNESSO A TIKTOK LIVE! RoomId: ' + state.roomId);
  })
  .catch(err => {
    console.log('Errore connessione TikTok Live:', err);
  });

tiktokLiveConnection.on('chat', data => {
  console.log('[CHAT] ' + data.uniqueId + ': ' + data.comment);
  const payload = JSON.stringify({
    user: data.uniqueId,
    comment: data.comment
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
});

tiktokLiveConnection.on('disconnected', () => {
  console.log('TikTok Live disconnessa.');
});
} catch (e) { console.log('Errore avvio TikTok:', e.message || e); } }
initTikTok();
server.listen(PORT, () => { console.log('Server in ascolto sulla porta ' + PORT); });
