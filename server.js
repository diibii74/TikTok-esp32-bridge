const express = require('express'); const http = require('http'); const WebSocket = require('ws'); const tiktokConnector = require('tiktok-live-connector');
// Gestione dinamica dell'importazione per garantire la compatibilità del costruttore const WebcastPushConnection = tiktokConnector.WebcastPushConnection  tiktokConnector.default  tiktokConnector;
const app = express(); const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => { res.send('Server TikTok WebSocket Attivo!'); });
const server = http.createServer(app); const wss = new WebSocket.Server({ server });
const TIKTOK_USERNAME = 'diibii26';
let tiktokLiveConnection; try { tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);
tiktokLiveConnection.connect().catch(err => { console.log('TikTok non in Live o errore di connessione:', err.message || err); });
tiktokLiveConnection.on('chat', data => { const payload = JSON.stringify({ user: data.uniqueId, comment: data.comment });
wss.clients.forEach(client => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(payload);
  }
});
}); } catch (e) { console.log('Errore durante la creazione del client TikTok:', e.message); }
server.listen(PORT, () => { console.log('Server HTTP e WebSocket avviato sulla porta ' + PORT); });
