'use client';

import { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';

function PlayerHeader({ name }) {
  return (
    <div style={{
      background: '#0f0f1c', borderBottom: '1px solid #252538',
      padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span className="fd" style={{ fontSize: '1.1rem', color: '#ff2d55' }}>HOT SEAT</span>
      <span style={{ color: '#5a5a8a', fontSize: '.82rem' }}>{name}</span>
    </div>
  );
}

function LobbyWaiting() {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', animation: 'fadeUp .4s ease' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🎉</div>
      <p className="fd" style={{ fontSize: '2rem', color: '#ffd60a' }}>YOU ARE IN!</p>
      <p style={{ color: '#5a5a8a', marginTop: 8 }}>The host will kick things off soon...</p>
    </div>
  );
}

function PollPhase() {
  const { game, setGame, myPid } = useGame();
  const poll = game.poll;

  if (!poll) return <div style={{ textAlign: 'center', padding: '40px 0', color: '#5a5a8a' }}>Next poll loading...</div>;
  if (poll.closed) return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <p className="fd" style={{ fontSize: '1.5rem', color: '#ffd60a' }}>POLL CLOSED</p>
      <p style={{ color: '#5a5a8a', marginTop: 8 }}>Check the big screen for results!</p>
    </div>
  );

  const voted = poll.votes?.[myPid];

  function vote(v) {
    if (voted || poll.closed) return;
    setGame(s => s.poll ? {
      ...s,
      poll: { ...s.poll, votes: { ...s.poll.votes, [myPid]: v } },
    } : s);
  }

  if (voted) {
    return (
      <div style={{ animation: 'fadeUp .3s ease' }}>
        <p className="fd" style={{ color: '#ffd60a', fontSize: '.82rem', marginBottom: 8 }}>HOT TAKE</p>
        <p className="fd" style={{ fontSize: '1.6rem', color: '#eeeef8', marginBottom: 24, lineHeight: 1.12 }}>{poll.question}</p>
        <div style={{
          textAlign: 'center', padding: 24, background: 'rgba(255,45,85,.12)',
          border: '2px solid rgba(255,45,85,.4)', borderRadius: 12,
        }}>
          <p className="fd" style={{ fontSize: '1.4rem', color: '#ff2d55' }}>LOCKED IN</p>
          <p style={{ color: '#5a5a8a', marginTop: 4 }}>Your vote: <strong style={{ color: '#eeeef8' }}>{voted.toUpperCase()}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <p className="fd" style={{ color: '#ffd60a', fontSize: '.82rem', marginBottom: 8 }}>HOT TAKE</p>
      <p className="fd" style={{ fontSize: '1.6rem', color: '#eeeef8', marginBottom: 24, lineHeight: 1.12 }}>{poll.question}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <button className="btn btn-full" onClick={() => vote('yes')} style={{
          background: '#00c96e', color: '#fff', fontFamily: "'Bebas Neue',sans-serif",
          fontSize: '1.8rem', padding: 22, letterSpacing: 2, borderRadius: 10,
        }}>YES</button>
        <button className="btn btn-r btn-full" onClick={() => vote('no')} style={{
          fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.8rem', padding: 22,
          letterSpacing: 2, borderRadius: 10,
        }}>NO</button>
      </div>
    </div>
  );
}

function HotSeatPhase() {
  const { game, setGame, myPid } = useGame();
  const { hotSeat, players, categories } = game;
  const isInHotSeat = hotSeat.selected === myPid;
  const isOptedIn = hotSeat.candidates.includes(myPid);

  function toggleOpt() {
    setGame(s => ({
      ...s,
      hotSeat: {
        ...s.hotSeat,
        candidates: isOptedIn
          ? s.hotSeat.candidates.filter(x => x !== myPid)
          : [...s.hotSeat.candidates, myPid],
      },
    }));
  }

  function pickCategory(cat) {
    if (hotSeat.selected !== myPid) return;
    setGame(s => ({ ...s, hotSeat: { ...s.hotSeat, category: cat } }));
  }

  if (isInHotSeat) {
    return (
      <div style={{ textAlign: 'center', animation: 'zoomIn .3s ease' }}>
        <p className="fd" style={{ color: '#ff2d55', letterSpacing: 3 }}>YOU ARE IN THE</p>
        <p className="fd" style={{ fontSize: '3rem', color: '#ffd60a', animation: 'neonY 2s infinite' }}>HOT SEAT</p>
        <p style={{ color: '#5a5a8a', margin: '12px 0 20px', fontSize: '.9rem' }}>Pick your category:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {categories.map(cat => (
            <button
              key={cat}
              className="btn btn-full btn-lg"
              onClick={() => pickCategory(cat)}
              style={{
                background: hotSeat.category === cat ? '#ff2d55' : '#161625',
                color: hotSeat.category === cat ? '#fff' : '#eeeef8',
                border: `1px solid ${hotSeat.category === cat ? '#ff2d55' : '#252538'}`,
                fontFamily: "'Bebas Neue',sans-serif", letterSpacing: '1.5px',
              }}
            >{cat}</button>
          ))}
        </div>
        {hotSeat.category && (
          <div style={{
            marginTop: 14, padding: '10px 20px', background: 'rgba(255,45,85,.12)',
            borderRadius: 10, border: '1px solid rgba(255,45,85,.3)',
          }}>
            <p style={{ color: '#ff2d55', fontSize: '.9rem' }}>Locked — head to the front!</p>
          </div>
        )}
      </div>
    );
  }

  const selectedPlayer = hotSeat.selected ? players[hotSeat.selected] : null;

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <p className="fd" style={{ fontSize: '1.4rem', color: '#ff2d55', marginBottom: 6 }}>HOT SEAT</p>
      <p style={{ color: '#5a5a8a', fontSize: '.88rem', marginBottom: 20 }}>
        Tap to volunteer — host randomly picks from all volunteers.
      </p>
      {selectedPlayer && (
        <div style={{
          background: 'rgba(255,214,10,.1)', border: '1px solid rgba(255,214,10,.3)',
          borderRadius: 10, padding: 12, marginBottom: 16, textAlign: 'center',
        }}>
          <p className="fd" style={{ color: '#ffd60a' }}>{selectedPlayer.name} is in the hot seat!</p>
        </div>
      )}
      <button
        className="btn btn-full btn-lg"
        onClick={toggleOpt}
        style={{
          background: isOptedIn ? '#ff2d55' : '#161625',
          color: isOptedIn ? '#fff' : '#5a5a8a',
          border: isOptedIn ? 'none' : '2px dashed #252538',
        }}
      >
        {isOptedIn ? 'OPTED IN — TAP TO REMOVE' : 'VOLUNTEER FOR THE HOT SEAT'}
      </button>
      <p style={{ color: '#5a5a8a', fontSize: '.78rem', textAlign: 'center', marginTop: 10 }}>
        {hotSeat.candidates.length} volunteer{hotSeat.candidates.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

function PhotoPhase() {
  const { game, setGame, myPid, uid } = useGame();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoSent, setPhotoSent] = useState(false);
  const fileRef = useRef(null);
  const me = game.players[myPid];

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setPhotoFile(ev.target.result);
    r.readAsDataURL(f);
  }

  function sendPhoto() {
    if (!photoFile) return;
    setGame(s => ({
      ...s,
      photos: [...s.photos, {
        id: uid(),
        playerId: myPid,
        playerName: me?.name || '?',
        dataUrl: photoFile,
        approved: false,
        used: false,
      }],
    }));
    setPhotoSent(true);
    setPhotoFile(null);
  }

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <p className="fd" style={{ fontSize: '1.3rem', color: '#00e8ff', marginBottom: 4 }}>PHOTO TAKEOVER</p>
      <p style={{ color: '#5a5a8a', fontSize: '.88rem', marginBottom: 18 }}>
        Upload a random photo — debaters have to work it into their argument!
      </p>
      {photoSent ? (
        <div style={{
          textAlign: 'center', padding: 24, background: 'rgba(0,232,255,.08)',
          border: '2px solid rgba(0,232,255,.3)', borderRadius: 12,
        }}>
          <p className="fd" style={{ fontSize: '1.3rem', color: '#00e8ff' }}>SUBMITTED!</p>
          <p style={{ color: '#5a5a8a', marginTop: 6, fontSize: '.82rem' }}>Waiting for host approval...</p>
          <button className="btn btn-ghost btn-sm" onClick={() => setPhotoSent(false)} style={{ marginTop: 12 }}>Submit another</button>
        </div>
      ) : photoFile ? (
        <div>
          <img src={photoFile} style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 10, marginBottom: 14 }} alt="Preview" />
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-c btn-lg" onClick={sendPhoto} style={{ flex: 1 }}>SEND IT</button>
            <button className="btn btn-ghost" onClick={() => setPhotoFile(null)}>REDO</button>
          </div>
        </div>
      ) : (
        <div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          <button className="btn btn-c btn-lg btn-full" onClick={() => fileRef.current?.click()}>CHOOSE A PHOTO</button>
        </div>
      )}
      {game.currentPhoto && (
        <div style={{
          marginTop: 18, padding: '10px 14px', background: 'rgba(0,232,255,.08)',
          borderRadius: 10, border: '1px solid rgba(0,232,255,.2)',
        }}>
          <p style={{ color: '#00e8ff', fontSize: '.82rem' }}>On screen: photo by <strong>{game.currentPhoto.playerName}</strong></p>
        </div>
      )}
    </div>
  );
}

export default function PlayerView() {
  const { game, setGame, myPid } = useGame();
  const [nameInput, setNameInput] = useState('');

  const me = game.players[myPid];

  function join() {
    if (!nameInput.trim()) return;
    setGame(s => ({
      ...s,
      players: { ...s.players, [myPid]: { id: myPid, name: nameInput.trim() } },
    }));
  }

  if (!me) {
    return (
      <div style={{ minHeight: '100vh', background: '#07070e' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', padding: '32px 24px',
        }}>
          <div className="fd" style={{
            fontSize: '2.8rem', color: '#ff2d55',
            animation: 'neonP 3s ease-in-out infinite', marginBottom: 8,
          }}>THE HOT SEAT</div>
          <p style={{ color: '#5a5a8a', marginBottom: 28, textAlign: 'center' }}>Enter your name to join the game</p>
          <div style={{ width: '100%', maxWidth: 340 }}>
            <input
              className="inp"
              placeholder="Your name or nickname..."
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && join()}
              style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: 14 }}
              autoFocus
            />
            <button className="btn btn-r btn-lg btn-full" onClick={join}>JOIN</button>
          </div>
          <p style={{ color: '#5a5a8a', fontSize: '.72rem', marginTop: 18 }}>Ask the host if you need help joining</p>
        </div>
      </div>
    );
  }

  let content;
  if (game.phase === 'lobby') content = <LobbyWaiting />;
  else if (game.phase === 'part1') content = <PollPhase />;
  else if (game.phase === 'part2' || game.phase === 'part2b') content = <HotSeatPhase />;
  else if (game.phase === 'part3') content = <PhotoPhase />;
  else content = <div style={{ color: '#5a5a8a', textAlign: 'center', padding: '40px 0' }}>Waiting...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#07070e' }}>
      <PlayerHeader name={me.name} />
      <div style={{ padding: '22px 18px', maxWidth: 440, margin: '0 auto' }}>{content}</div>
    </div>
  );
}
