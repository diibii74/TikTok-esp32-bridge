const express = require('express'); const http = require('http'); const WebSocket = require('ws'); const { WebcastPushConnection } = require('tiktok-live-connector');
const app = express(); const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => { res.send('Server TikTok WebSocket Attivo!'); });
const server = http.createServer(app); const wss = new WebSocket.Server({ server });
// Ping anti-disconnessione per i client WebSocket setInterval(() => { wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) { client.ping(); } }); }, 20000);
const TIKTOK_USERNAME = 'manolita772';
function connectToTikTok() { // Configurazione con opzioni per superare i blocchi di firma TikTok const tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME, { processInitialData: true, enableExtendedGiftInfo: true, enableWebsocketUpgrade: true, requestOptions: { timeout: 10000 }, clientParams: { app_language: 'it-IT', webcast_sdk_version: '1.3.0' } });
tiktokLiveConnection.connect() .then(state => { console.log('CONNESSO A TIKTOK LIVE! RoomId: ' + state.roomId); }) .catch(err => { console.log('Errore firma/connessione TikTok:', err.message || err); console.log('Riprovo tra 10 secondi...'); setTimeout(connectToTikTok, 10000); });
tiktokLiveConnection.on('chat', data => { console.log('[CHAT] ' + data.uniqueId + ': ' + data.comment); const payload = JSON.stringify({ user: data.uniqueId, comment: data.comment });
wss.clients.forEach(client => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(payload);
  }
});
});
tiktokLiveConnection.on('disconnected', () => { console.log('TikTok Live disconnessa. Riconnessione tra 10s...'); setTimeout(connectToTikTok, 10000); }); }
connectToTikTok();
server.listen(PORT, () => { console.log('Server in ascolto sulla porta ' + PORT); });
