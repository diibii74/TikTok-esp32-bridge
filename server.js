const express = require('express'); const http = require('http'); const WebSocket = require('ws'); const { WebcastPushConnection } = require('tiktok-live-connector');
const app = express(); const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => { res.send('Server TikTok WebSocket Attivo!'); });
const server = http.createServer(app); const wss = new WebSocket.Server({ server });
setInterval(() => { wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) { client.ping(); } }); }, 20000);
const TIKTOK_USERNAME = 'manolita772';
try { const tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);
tiktokLiveConnection.connect() .then(state => { console.log('CONNESSO A TIKTOK LIVE! RoomId: ' + state.roomId); }) .catch(err => { console.log('Errore connessione TikTok Live:', err.message || err); });
tiktokLiveConnection.on('chat', data => { console.log('[CHAT] ' + data.uniqueId + ': ' + data.comment); const payload = JSON.stringify({ user: data.uniqueId, comment: data.comment });
wss.clients.forEach(client => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(payload);
  }
});
});
tiktokLiveConnection.on('disconnected', () => { console.log('TikTok Live disconnessa.'); });
} catch (e) { console.log('Errore avvio TikTok:', e.message || e); }
server.listen(PORT, () => { console.log('Server in ascolto sulla porta ' + PORT); });
