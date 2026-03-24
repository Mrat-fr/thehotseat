import Pusher from 'pusher';

let gameState = null;

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { state } = req.body;

  if (!state) {
    return res.status(400).json({ error: 'Missing state' });
  }

  gameState = state;

  // Broadcast to all connected clients
  await pusher.trigger('hotseat-game', 'state-update', { state });

  res.status(200).json({ ok: true });
}
