const { WebcastPushConnection } = require('tiktok-live-connector');
const WebSocket = require('ws');

const TIKTOK_USERNAME = 'diibii26';
const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({ port: PORT });
const tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);

tiktokLiveConnection.connect();

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
