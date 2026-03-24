'use client';

import { useGame } from '../context/GameContext';
import BigLabel from './BigLabel';

export default function PresArea() {
  const { game, voteCount } = useGame();
  const { phase, poll, players, hotSeat, currentPhoto } = game;
  const playerList = Object.values(players || {});
  const sel = hotSeat.selected ? players[hotSeat.selected] : null;
  const tv = poll ? Object.keys(poll.votes || {}).length : 0;

  if (phase === 'lobby') {
    return (
      <div style={{ textAlign: 'center', animation: 'fadeUp .5s ease' }}>
        <div className="fd" style={{
          fontSize: 'clamp(3rem,8vw,6rem)', color: '#ff2d55', lineHeight: '.85',
          animation: 'neonP 3s ease-in-out infinite', marginBottom: 16,
        }}>THE<br />HOT SEAT</div>
        <p style={{ color: '#5a5a8a', fontSize: '1rem', marginBottom: 20 }}>Join on your phone</p>
        <div style={{
          display: 'inline-block', background: '#0f0f1c', padding: 20,
          borderRadius: 12, border: '3px solid #ffd60a',
        }}>
          <p className="fd" style={{ color: '#ffd60a', letterSpacing: 4, fontSize: '1.1rem', marginBottom: 10 }}>JOIN AT</p>
          <p style={{
            color: '#eeeef8', fontSize: '1.4rem', fontFamily: 'monospace',
            background: '#161625', padding: '10px 24px', borderRadius: 8,
          }}>{typeof window !== 'undefined' ? window.location.origin : ''}/play</p>
        </div>
        {playerList.length > 0 && (
          <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {playerList.map(p => (
              <span key={p.id} className="fd" style={{
                color: '#00e8ff', fontSize: '1rem', background: 'rgba(0,232,255,.1)',
                border: '1px solid rgba(0,232,255,.3)', padding: '3px 14px', borderRadius: 18,
              }}>{p.name}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (phase === 'part1' && poll) {
    const yC = voteCount(poll.votes, 'yes');
    const nC = voteCount(poll.votes, 'no');
    const yP = tv ? Math.round(yC / tv * 100) : 0;
    const nP = tv ? Math.round(nC / tv * 100) : 0;
    const bars = [
      { label: 'YES', val: 'yes', color: '#00c96e', pct: yP, cnt: yC },
      { label: 'NO', val: 'no', color: '#ff2d55', pct: nP, cnt: nC },
    ];
    return (
      <div style={{ width: '100%', maxWidth: 700, animation: 'fadeUp .4s ease' }}>
        <p className="fd" style={{ color: '#ffd60a', letterSpacing: 3, fontSize: '.95rem', marginBottom: 8 }}>HOT TAKE</p>
        <p className="fd" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.8rem)', color: '#eeeef8', marginBottom: 28, lineHeight: 1.05 }}>{poll.question}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {bars.map(b => (
            <div key={b.val} style={{ background: '#0f0f1c', border: `2px solid ${b.color}55`, borderRadius: 12, padding: '20px 24px' }}>
              <p className="fd" style={{ fontSize: '1.2rem', color: b.color, marginBottom: 4 }}>{b.label}</p>
              <p className="fd" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', color: b.color, lineHeight: 1 }}>{b.pct}%</p>
              <p style={{ color: '#5a5a8a', fontSize: '.85rem' }}>{b.cnt} vote{b.cnt !== 1 ? 's' : ''}</p>
              <div style={{ background: '#252538', borderRadius: 4, height: 7, marginTop: 12 }}>
                <div style={{ background: b.color, width: `${b.pct}%`, height: 7, borderRadius: 4, transition: 'width .6s ease' }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ color: '#5a5a8a', textAlign: 'center', marginTop: 12 }}>
          {tv} of {Object.keys(players || {}).length} votes in
        </p>
      </div>
    );
  }

  if (phase === 'part1' && !poll) return <BigLabel color="#ffd60a" icon="📊" text="LIVE POLLS" sub="Launching next hot take..." />;

  if ((phase === 'part2' || phase === 'part2b') && !sel) return <BigLabel color="#ff2d55" icon="🔥" text="THE HOT SEAT" sub="Volunteer on your phone!" />;

  if ((phase === 'part2' || phase === 'part2b') && sel) {
    return (
      <div style={{ textAlign: 'center', animation: 'zoomIn .4s ease' }}>
        <p className="fd" style={{ color: '#ff2d55', letterSpacing: 4, fontSize: '1.1rem', marginBottom: 6 }}>NOW IN THE</p>
        <p className="fd" style={{ fontSize: 'clamp(2.5rem,7vw,6rem)', color: '#ffd60a', lineHeight: '.85', animation: 'neonY 2s infinite' }}>HOT SEAT</p>
        <p className="fd" style={{ fontSize: 'clamp(1.8rem,4vw,4rem)', color: '#eeeef8', marginTop: 12 }}>{sel.name}</p>
        {hotSeat.category ? (
          <div style={{
            marginTop: 16, display: 'inline-block', background: 'rgba(255,45,85,.15)',
            border: '2px solid rgba(255,45,85,.4)', borderRadius: 10, padding: '10px 28px',
          }}>
            <p className="fd" style={{ fontSize: '1.6rem', color: '#00e8ff', letterSpacing: 2 }}>{hotSeat.category}</p>
          </div>
        ) : (
          <p style={{ color: '#5a5a8a', marginTop: 14, animation: 'flashAnim 1s infinite' }}>{sel.name} is picking a category...</p>
        )}
      </div>
    );
  }

  if (phase === 'part3' && !currentPhoto) return <BigLabel color="#00e8ff" icon="📸" text="PHOTO TAKEOVER" sub="Upload a random photo from your camera roll!" />;

  if (phase === 'part3' && currentPhoto) {
    return (
      <div style={{ textAlign: 'center', animation: 'zoomIn .35s ease' }}>
        <p className="fd" style={{ color: '#00e8ff', letterSpacing: 3, marginBottom: 10 }}>PHOTO FROM {currentPhoto.playerName.toUpperCase()}</p>
        <img src={currentPhoto.dataUrl} style={{ maxWidth: '100%', maxHeight: '50vh', borderRadius: 12, objectFit: 'contain', border: '3px solid #00e8ff' }} alt="Submitted" />
        <p style={{ color: '#5a5a8a', marginTop: 10, fontStyle: 'italic' }}>Debaters — work this into your argument!</p>
      </div>
    );
  }

  return <BigLabel color="#5a5a8a" icon="⏳" text="STANDBY" sub="" />;
}
