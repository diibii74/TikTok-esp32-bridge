const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('OK');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const TIKTOK_USERNAME = 'diibii26';
const tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);

tiktokLiveConnection.connect().catch(err => {
  console.log('TikTok non connesso:', err);
});

tiktokLiveConnection.on('chat', data => {
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

server.listen(PORT, () => {
  console.log('Server pronto sulla porta ' + PORT);
});
