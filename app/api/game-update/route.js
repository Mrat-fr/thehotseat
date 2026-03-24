import { NextResponse } from 'next/server';
import Pusher from 'pusher';

let gameState = null;

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
});

export async function POST(request) {
  const { state } = await request.json();

  if (!state) {
    return NextResponse.json({ error: 'Missing state' }, { status: 400 });
  }

  gameState = state;

  await pusher.trigger('hotseat-game', 'state-update', { state });

  return NextResponse.json({ ok: true });
}
