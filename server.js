const express = require('express'); const http = require('http'); const WebSocket = require('ws'); const { WebcastPushClient } = require('tiktok-live-connector');
const app = express(); const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => { res.send('Server TikTok WebSocket Attivo!'); });
const server = http.createServer(app); const wss = new WebSocket.Server({ server });
// Ping di mantenimento della connessione setInterval(() => { wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) { client.ping(); } }); }, 20000);
const TIKTOK_USERNAME = 'manolita772';
try { const tiktokLiveConnection = new WebcastPushClient(TIKTOK_USERNAME);
tiktokLiveConnection.connect() .then(state => { console.log(Connesso alla Live di ${TIKTOK_USERNAME}! RoomId: ${state.roomId}); }) .catch(err => { console.log('Errore connessione TikTok Live:', err); });
tiktokLiveConnection.on('chat', data => { console.log([CHAT] ${data.uniqueId}: ${data.comment}); const payload = JSON.stringify({ user: data.uniqueId, comment: data.comment });
wss.clients.forEach(client => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(payload);
  }
});
});
tiktokLiveConnection.on('disconnected', () => { console.log('TikTok Live disconnessa.'); });
} catch (e) { console.log('Errore creazione client TikTok:', e); }
server.listen(PORT, () => { console.log('Server in ascolto sulla porta ' + PORT); });
