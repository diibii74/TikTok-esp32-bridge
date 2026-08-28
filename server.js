const express = require('express'); const http = require('http'); const WebSocket = require('ws'); const { WebcastPushConnection } = require('tiktok-live-connector');
const app = express(); const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => { res.send('Server TikTok WebSocket attivo!'); });
const server = http.createServer(app); const wss = new WebSocket.Server({ server });
const TIKTOK_USERNAME = 'diibii26'; const tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);
tiktokLiveConnection.connect().then(state => { console.log(Connesso alla Live di ${TIKTOK_USERNAME}); }).catch(err => { console.log('Attesa live o errore connessione TikTok:', err); });
tiktokLiveConnection.on('chat', data => { const payload = JSON.stringify({ user: data.uniqueId, comment: data.comment });
wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) { client.send(payload); } }); });
server.listen(PORT, () => { console.log(Server in ascolto sulla porta ${PORT}); });
