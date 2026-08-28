const { TikTokLiveConnector } = require('tiktok-live-connector'); const WebSocket = require('ws');
const TIKTOK_USERNAME = 'diibii26'; const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT }, () => { console.log(Server attivo sulla porta ${PORT}); });
const tiktok = new TikTokLiveConnector({ uniqueId: TIKTOK_USERNAME });
tiktok.connect().then(() => { console.log(Connesso alla live di ${TIKTOK_USERNAME}); }).catch(err => { console.error('Errore connessione TikTok:', err); });
tiktok.on('chat', data => { const payload = JSON.stringify({ user: data.nickname, comment: data.comment });
wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) { client.send(payload); } }); });
