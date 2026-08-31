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

// Username TikTok
const TIKTOK_USERNAME = 'margh.90';

function connectToTikTok() {
  // Inizializzazione della connessione
  const connection = new WebcastPushConnection(TIKTOK_USERNAME, {
    clientParams: {
      app_language: 'it-IT',
      device_platform: 'web'
    },
    enableWebsocketUpgrade: true
  });

  // Connessione alla Live
  connection.connect()
    .then(state => {
      console.log('CONNESSO A TIKTOK LIVE! RoomId: ' + state.roomId);
    })
    .catch(err => {
      console.log('Errore di connessione:', err.message || err);
      console.log('Riprovo tra 10 secondi...');
      setTimeout(connectToTikTok, 10000);
    });

  // Ascolto messaggi chat
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
    console.log('TikTok Live disconnessa. Riconnessione in corso...');
    setTimeout(connectToTikTok, 10000);
  });
}

connectToTikTok();

server.listen(PORT, () => {
  console.log('Server in ascolto sulla porta ' + PORT);
});
