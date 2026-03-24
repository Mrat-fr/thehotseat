import { useState } from 'react';
import { useGame } from '../context/GameContext';
import PresArea from './PresArea';
import SetupTab from './SetupTab';

function StepProgress({ allSteps, stepIdx }) {
  return (
    <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
      {allSteps.map((_, i) => (
        <div key={i} style={{
          height: 4, flex: 1, borderRadius: 2,
          background: i < stepIdx ? '#ff2d55' : i === stepIdx ? '#ffd60a' : '#252538',
          transition: 'background .3s',
        }} />
      ))}
    </div>
  );
}

function LiveTab() {
  const { game, setGame, advance, doPickHotSeat, spinning, spinLabel, voteCount, getSteps, resetAll } = useGame();
  const allSteps = getSteps(game.presets);
  const stepIdx = Math.min(game.step || 0, allSteps.length - 1);
  const curStep = allSteps[stepIdx];
  const isLast = stepIdx >= allSteps.length - 1;
  const { poll, phase, hotSeat, players, photos, currentPhoto } = game;
  const playerList = Object.values(players || {});
  const tv = poll ? Object.keys(poll.votes || {}).length : 0;
  const sel = hotSeat.selected ? players[hotSeat.selected] : null;
  const pending = (photos || []).filter(p => !p.approved);
  const readyQ = (photos || []).filter(p => p.approved && !p.used);

  return (
    <>
      {/* Step control */}
      <div style={{ background: '#161625', border: '2px solid rgba(255,45,85,.4)', borderRadius: 10, padding: 14 }}>
        <p style={{ color: '#5a5a8a', fontSize: '.68rem', letterSpacing: 2, fontFamily: "'Bebas Neue',sans-serif", marginBottom: 4 }}>
          STEP {stepIdx + 1}/{allSteps.length}
        </p>
        <p className="fd" style={{ fontSize: '1rem', color: '#eeeef8', marginBottom: 12 }}>{curStep?.label}</p>
        <StepProgress allSteps={allSteps} stepIdx={stepIdx} />
        <button className="btn btn-r btn-xl btn-full" onClick={advance} disabled={isLast}>
          {isLast ? '🏁 DONE' : 'NEXT →'}
        </button>
      </div>

      {/* Poll panel */}
      {phase === 'part1' && poll && (() => {
        const yC = voteCount(poll.votes, 'yes'), nC = voteCount(poll.votes, 'no');
        const yP = tv ? Math.round(yC / tv * 100) : 0, nP = tv ? Math.round(nC / tv * 100) : 0;
        return (
          <div style={{ background: '#161625', border: '1px solid rgba(255,214,10,.3)', borderRadius: 10, padding: 14 }}>
            <p className="fd" style={{ color: '#ffd60a', letterSpacing: 2, fontSize: '.78rem', marginBottom: 8 }}>LIVE POLL · {tv} VOTES</p>
            <p className="fd" style={{ fontSize: '.95rem', marginBottom: 10 }}>{poll.question}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              {[['YES', 'yes', '#00c96e', yP, yC], ['NO', 'no', '#ff2d55', nP, nC]].map(([l, v, c, p, cnt]) => (
                <div key={v} style={{ background: '#0f0f1c', border: `1px solid ${c}44`, borderRadius: 8, padding: '8px 12px' }}>
                  <p className="fd" style={{ color: c, fontSize: '.78rem' }}>{l}</p>
                  <p className="fd" style={{ color: c, fontSize: '1.5rem' }}>{p}%</p>
                </div>
              ))}
            </div>
            {!poll.closed ? (
              <button className="btn btn-ghost btn-sm btn-full" onClick={() => setGame(s => s.poll ? { ...s, poll: { ...s.poll, closed: true } } : s)}>
                CLOSE POLL
              </button>
            ) : (
              <p className="fd" style={{ color: '#ff2d55', fontSize: '.76rem' }}>● CLOSED — hit NEXT</p>
            )}
          </div>
        );
      })()}

      {/* Hot Seat panel */}
      {(phase === 'part2' || phase === 'part2b') && (
        <div style={{ background: '#161625', border: '1px solid rgba(255,45,85,.3)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <p className="fd" style={{ color: '#ff2d55', letterSpacing: 2, fontSize: '.78rem', marginBottom: 10 }}>HOT SEAT</p>
          {spinning && (
            <p className="fd" style={{ fontSize: '1.6rem', color: '#ffd60a', animation: 'flashAnim .12s infinite', marginBottom: 10 }}>{spinLabel}</p>
          )}
          {sel && !spinning && (
            <div style={{ marginBottom: 10 }}>
              <p className="fd" style={{ fontSize: '1.5rem', color: '#ffd60a' }}>{sel.name}</p>
              {hotSeat.category ? (
                <p className="fd" style={{ color: '#00e8ff', fontSize: '.9rem' }}>📂 {hotSeat.category}</p>
              ) : (
                <p style={{ color: '#5a5a8a', fontSize: '.8rem', animation: 'flashAnim 1.2s infinite' }}>Waiting for category…</p>
              )}
            </div>
          )}
          {!sel && !spinning && (
            <p style={{ color: '#5a5a8a', fontSize: '.82rem', marginBottom: 10 }}>
              🙋 {hotSeat.candidates.length} volunteer{hotSeat.candidates.length !== 1 ? 's' : ''} ready
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn btn-r" onClick={doPickHotSeat} disabled={!hotSeat.candidates.length || spinning}>🎲 RANDOM PICK</button>
            {sel && (
              <button className="btn btn-ghost btn-sm" onClick={() => setGame(s => ({
                ...s, hotSeat: { ...s.hotSeat, selected: null, category: null }, phase: 'part2',
              }))}>CLEAR</button>
            )}
          </div>
        </div>
      )}

      {/* Photo panel */}
      {phase === 'part3' && (
        <div style={{ background: '#161625', border: '1px solid rgba(0,232,255,.3)', borderRadius: 10, padding: 14 }}>
          <p className="fd" style={{ color: '#00e8ff', letterSpacing: 2, fontSize: '.78rem', marginBottom: 10 }}>PHOTO TAKEOVER</p>
          {currentPhoto && (
            <div style={{ marginBottom: 10 }}>
              <img src={currentPhoto.dataUrl} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8 }} alt="" />
              <button className="btn btn-ghost btn-sm btn-full" onClick={() => setGame(s => ({ ...s, currentPhoto: null }))} style={{ marginTop: 6 }}>CLEAR</button>
            </div>
          )}
          <button
            className="btn btn-c btn-full"
            disabled={!readyQ.length}
            onClick={() => {
              const pick = readyQ[Math.floor(Math.random() * readyQ.length)];
              setGame(s => ({
                ...s, currentPhoto: pick,
                photos: s.photos.map(p => p.id === pick.id ? { ...p, used: true } : p),
              }));
            }}
            style={{ marginBottom: 10 }}
          >📸 REVEAL RANDOM ({readyQ.length})</button>
          {pending.length > 0 && (
            <p className="fd" style={{ color: '#5a5a8a', fontSize: '.68rem', letterSpacing: 2, marginBottom: 8 }}>PENDING ({pending.length})</p>
          )}
          {pending.map(ph => (
            <div key={ph.id} style={{
              display: 'flex', gap: 7, alignItems: 'center', marginBottom: 7,
              background: '#0f0f1c', borderRadius: 8, padding: 7,
            }}>
              <img src={ph.dataUrl} style={{ width: 46, height: 36, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} alt="" />
              <p style={{ flex: 1, color: '#5a5a8a', fontSize: '.76rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ph.playerName}</p>
              <button className="btn btn-y btn-sm" onClick={() => setGame(s => ({
                ...s, photos: s.photos.map(p => p.id === ph.id ? { ...p, approved: true } : p),
              }))}>✓</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setGame(s => ({
                ...s, photos: s.photos.filter(p => p.id !== ph.id),
              }))}>✗</button>
            </div>
          ))}
        </div>
      )}

      {/* Players list */}
      <div style={{ background: '#161625', border: '1px solid #252538', borderRadius: 10, padding: 12 }}>
        <p className="fd" style={{ color: '#5a5a8a', fontSize: '.7rem', letterSpacing: 2, marginBottom: 8 }}>PLAYERS ({playerList.length})</p>
        {!playerList.length ? (
          <p style={{ color: '#5a5a8a', fontSize: '.82rem' }}>None yet</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {playerList.map(p => {
              const opted = hotSeat.candidates.includes(p.id);
              return (
                <span key={p.id} className="fd" style={{
                  fontSize: '.76rem',
                  color: opted ? '#ff2d55' : '#eeeef8',
                  background: '#0f0f1c',
                  border: `1px solid ${opted ? 'rgba(255,45,85,.4)' : '#252538'}`,
                  padding: '2px 9px', borderRadius: 12,
                }}>{opted ? '🙋 ' : ''}{p.name}</span>
              );
            })}
          </div>
        )}
      </div>
      <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm('Reset everything?')) resetAll(); }} style={{ color: '#5a5a8a', fontSize: '.72rem' }}>
        ⚠ RESET ALL DATA
      </button>
    </>
  );
}

function LinksTab() {
  const origin = window.location.origin;
  const playerUrl = `${origin}/play`;
  const remoteUrl = `${origin}/remote`;
  const [copiedPlayer, setCopiedPlayer] = useState(false);
  const [copiedRemote, setCopiedRemote] = useState(false);

  function copy(url, setCopied) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Player Join Link */}
      <div style={{ background: '#161625', border: '1px solid rgba(255,214,10,.3)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
        <p className="fd" style={{ color: '#ffd60a', letterSpacing: 2, fontSize: '.8rem', marginBottom: 10 }}>📱 PLAYER JOIN LINK</p>
        <p style={{ color: '#5a5a8a', fontSize: '.76rem', marginBottom: 12 }}>Share this link with players to join on their phones</p>
        <div style={{
          background: '#0f0f1c', border: '1px solid #252538', borderRadius: 8,
          padding: '10px 14px', marginBottom: 10, wordBreak: 'break-all',
        }}>
          <p style={{ color: '#ffd60a', fontSize: '.85rem', fontFamily: 'monospace' }}>{playerUrl}</p>
        </div>
        <button
          className="btn btn-y btn-full"
          onClick={() => copy(playerUrl, setCopiedPlayer)}
        >{copiedPlayer ? '✅ COPIED!' : '📋 COPY PLAYER LINK'}</button>
      </div>

      {/* Remote Controller */}
      <div style={{ background: '#161625', border: '1px solid rgba(0,232,255,.3)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
        <p className="fd" style={{ color: '#00e8ff', letterSpacing: 2, fontSize: '.8rem', marginBottom: 10 }}>🎬 PHONE REMOTE</p>
        <p style={{ color: '#5a5a8a', fontSize: '.76rem', marginBottom: 12 }}>Control the game from your phone — advance slides, pick hot seat, manage photos</p>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(remoteUrl)}&bgcolor=161625&color=eeeef8&margin=6`}
          width={140} height={140}
          style={{ borderRadius: 8, display: 'block', margin: '0 auto 12px' }}
          alt="Remote QR"
        />
        <div style={{
          background: '#0f0f1c', border: '1px solid #252538', borderRadius: 8,
          padding: '10px 14px', marginBottom: 10, wordBreak: 'break-all',
        }}>
          <p style={{ color: '#00e8ff', fontSize: '.85rem', fontFamily: 'monospace' }}>{remoteUrl}</p>
        </div>
        <button
          className="btn btn-c btn-full"
          onClick={() => copy(remoteUrl, setCopiedRemote)}
        >{copiedRemote ? '✅ COPIED!' : '📋 COPY REMOTE LINK'}</button>
      </div>
    </div>
  );
}

export default function AdminView() {
  const { game, adminTab, setAdminTab } = useGame();
  const [sidebarTab, setSidebarTab] = useState('live');

  const tickerText = Array(10).fill('🔥 THE HOT SEAT  ·  DEBATE NIGHT  ·  HOT TAKES  ·  ').join('');

  return (
    <div style={{ minHeight: '100vh', background: '#07070e', display: 'flex', flexDirection: 'column' }}>
      {/* Ticker */}
      <div style={{ background: '#ff2d55', height: 30, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        <div className="fd" style={{
          fontSize: '.9rem', letterSpacing: 3, color: '#fff', whiteSpace: 'nowrap',
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          animation: 'ticker 20s linear infinite',
        }}>{tickerText}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', flex: 1, overflow: 'hidden', minHeight: 470 }}>
        {/* Presentation area — the big screen monitor */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '32px 40px', borderRight: '1px solid #252538', overflow: 'hidden',
        }}>
          <PresArea />
        </div>

        {/* Sidebar — host controls */}
        <div style={{ background: '#0f0f1c', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {/* Tab bar */}
          <div style={{
            padding: '12px 14px', borderBottom: '1px solid #252538',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { key: 'live', label: '🎬 LIVE' },
                { key: 'links', label: '🔗 LINKS' },
                { key: 'setup', label: '⚙️ SETUP' },
              ].map(t => (
                <button
                  key={t.key}
                  className="btn btn-sm"
                  onClick={() => setSidebarTab(t.key)}
                  style={{
                    background: sidebarTab === t.key ? '#ff2d55' : 'transparent',
                    color: sidebarTab === t.key ? '#fff' : '#5a5a8a',
                    border: `1px solid ${sidebarTab === t.key ? '#ff2d55' : '#252538'}`,
                  }}
                >{t.label}</button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
            {sidebarTab === 'live' && <LiveTab />}
            {sidebarTab === 'links' && <LinksTab />}
            {sidebarTab === 'setup' && <SetupTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
