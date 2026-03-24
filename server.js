import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const PORT = process.env.PORT || 3001;

const PRESETS = [
  "Is a thumb a finger?",
  "If you win the lottery today, does it make you a \"successful\" person?",
  "Is cereal a soup?",
  "Is a cheesecake a cake or a pie?",
  "If a tomato is a fruit, is ketchup a smoothie?",
  "Does the \"5-second rule\" actually exist?",
  "Is the \"Snooze\" button a gift or a curse?",
  "Is \"Camping\" a vacation or just \"paying to be homeless\" for a weekend?",
  "Is \"A.I. Art\" actually art?",
  "Is \"Working from Home\" more productive than the office?",
];
const CATS = ["Politics & Society", "Relationships & Dating", "Food & Lifestyle", "Pop Culture"];

function blank() {
  return {
    stage: 'lobby',
    phase: 'lobby',
    questionIndex: 0,
    players: {},
    poll: null,
    pollHistory: [],
    hotSeat: { candidates: [], selected: null, category: null },
    photos: [],
    currentPhoto: null,
    presets: PRESETS.slice(),
    categories: CATS.slice(),
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
