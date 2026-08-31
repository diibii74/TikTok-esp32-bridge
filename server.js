const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Server TikTok WebSocket Attivo!');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

setInterval(() => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.ping();
    }
  });
}, 20000);

const TIKTOK_USERNAME = 'margh.90';

function connectToTikTok() {
  const connection = new WebcastPushConnection(TIKTOK_USERNAME, {
    processInitialData: true,
    enableWebsocketUpgrade: true,
    requestOptions: {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    },
    clientParams: {
      app_language: 'it-IT',
      webcast_sdk_version: '1.3.0'
    }
  });

  connection.connect()
    .then(state => {
      console.log('CONNESSO A TIKTOK LIVE! RoomId: ' + state.roomId);
    })
    .catch(err => {
      console.log('Errore connessione TikTok:', err.message || err);
      console.log('Riprovo tra 10 secondi...');
      setTimeout(connectToTikTok, 10000);
    });

  connection.on('chat', data => {
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

  connection.on('disconnected', () => {
    console.log('TikTok Live disconnessa. Riconnessione tra 10s...');
    setTimeout(connectToTikTok, 10000);
  });
}

connectToTikTok();

server.listen(PORT, () => {
  console.log('Server in ascolto sulla porta ' + PORT);
});
