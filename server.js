import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const PORT = 3001;

const PRESETS = [
  "Pineapple belongs on pizza",
  "Social media has done more harm than good",
  "Cancel culture has gone too far",
  "The monarchy should be abolished",
  "WFH is better for productivity",
  "Reality TV is genuinely good entertainment",
];
const CATS = ["Politics & Society", "Relationships & Dating", "Food & Lifestyle", "Pop Culture"];

function blank() {
  return {
    phase: 'lobby',
    step: 0,
    players: {},
    poll: null,
    pollHistory: [],
    hotSeat: { candidates: [], selected: null, category: null },
    photos: [],
    currentPhoto: null,
    presets: PRESETS.slice(),
    categories: CATS.slice(),
    adminPin: '1234',
  };
}

let gameState = blank();

const server = createServer();
const wss = new WebSocketServer({ server });

function broadcast(data, exclude) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client !== exclude && client.readyState === 1) {
      client.send(msg);
    }
  });
}

wss.on('connection', (ws) => {
  // Send current state to new client
  ws.send(JSON.stringify({ type: 'state', state: gameState }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);

      if (msg.type === 'update') {
        gameState = msg.state;
        // Broadcast to ALL clients including sender so everyone is in sync
        broadcast({ type: 'state', state: gameState });
        // Also send back to sender to confirm
        ws.send(JSON.stringify({ type: 'state', state: gameState }));
      }

      if (msg.type === 'reset') {
        gameState = blank();
        broadcast({ type: 'state', state: gameState });
        ws.send(JSON.stringify({ type: 'state', state: gameState }));
      }
    } catch (e) {
      console.error('Bad message:', e);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Hot Seat WebSocket server running on ws://0.0.0.0:${PORT}`);
});
