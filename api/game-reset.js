import Pusher from 'pusher';

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
    questionIndex: 0,
    players: {},
    poll: null,
    pollHistory: [],
    hotSeat: { candidates: [], selected: null, category: null },
    photos: [],
    currentPhoto: null,
    presets: PRESETS.slice(),
    categories: CATS.slice(),
    phase: 'lobby',
  };
}

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

  const newState = blank();

  // Broadcast reset
  await pusher.trigger('hotseat-game', 'state-update', { state: newState });

  res.status(200).json({ ok: true });
}
