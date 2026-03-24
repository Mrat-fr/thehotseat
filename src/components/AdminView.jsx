import { useState } from 'react';
import { useGame } from '../context/GameContext';
import PresArea from './PresArea';
import SetupTab from './SetupTab';

const STAGE_LABELS = {
  lobby: '🏠 LOBBY',
  yesno: '📊 YES OR NO',
  hotseat: '🔥 HOT SEAT',
  photo: '📸 PHOTO TAKEOVER',
};

function LobbyControls() {
  const { game, startGame } = useGame();
  const playerList = Object.values(game.players || {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#161625', border: '2px solid rgba(255,214,10,.4)', borderRadius: 10, padding: 18, textAlign: 'center' }}>
        <p className="fd" style={{ color: '#ffd60a', letterSpacing: 2, fontSize: '1rem', marginBottom: 6 }}>WAITING FOR PLAYERS</p>
        <p style={{ color: '#5a5a8a', fontSize: '.85rem', marginBottom: 16 }}>
          {playerList.length} player{playerList.length !== 1 ? 's' : ''} joined
        </p>
        <button
          className="btn btn-r btn-xl btn-full"
          onClick={startGame}
          disabled={playerList.length === 0}
          style={{ fontSize: '1.3rem', padding: '16px 0' }}
        >
          🚀 START GAME
        </button>
      </div>

      {/* Player list */}
      <div style={{ background: '#161625', border: '1px solid #252538', borderRadius: 10, padding: 14 }}>
        <p className="fd" style={{ color: '#5a5a8a', fontSize: '.7rem', letterSpacing: 2, marginBottom: 8 }}>PLAYERS ({playerList.length})</p>
        {!playerList.length ? (
          <p style={{ color: '#5a5a8a', fontSize: '.82rem' }}>Waiting for players to join…</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {playerList.map(p => (
              <span key={p.id} className="fd" style={{
                fontSize: '.8rem', color: '#00e8ff',
                background: 'rgba(0,232,255,.08)', border: '1px solid rgba(0,232,255,.2)',
                padding: '3px 12px', borderRadius: 14,
              }}>{p.name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function YesNoControls() {
  const { game, nextQuestion, skipStage, closePoll, voteCount } = useGame();
  const { poll, questionIndex, presets, players } = game;
  const isLastQuestion = questionIndex >= presets.length - 1;
  const playerList = Object.values(players || {});
  const tv = poll ? Object.keys(poll.votes || {}).length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Current question info */}
      <div style={{ background: '#161625', border: '2px solid rgba(255,214,10,.4)', borderRadius: 10, padding: 16 }}>
        <p className="fd" style={{ color: '#5a5a8a', fontSize: '.68rem', letterSpacing: 2, marginBottom: 4 }}>
          QUESTION {questionIndex + 1} OF {presets.length}
        </p>
        {poll && (
          <>
            <p className="fd" style={{ fontSize: '.95rem', color: '#eeeef8', marginBottom: 12, lineHeight: 1.2 }}>
              {poll.question}
            </p>

            {/* Live vote counts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[
                ['YES', 'yes', '#00c96e'],
                ['NO', 'no', '#ff2d55'],
              ].map(([label, val, color]) => {
                const cnt = voteCount(poll.votes, val);
                const pct = tv ? Math.round(cnt / tv * 100) : 0;
                return (
                  <div key={val} style={{ background: '#0f0f1c', border: `1px solid ${color}44`, borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                    <p className="fd" style={{ color, fontSize: '.75rem' }}>{label}</p>
                    <p className="fd" style={{ color, fontSize: '1.4rem' }}>{pct}%</p>
                    <p style={{ color: '#5a5a8a', fontSize: '.7rem' }}>{cnt} vote{cnt !== 1 ? 's' : ''}</p>
                  </div>
                );
              })}
            </div>

            <p style={{ color: '#5a5a8a', fontSize: '.76rem', textAlign: 'center', marginBottom: 12 }}>
              {tv} of {playerList.length} voted
            </p>

            {/* Close poll button */}
            {!poll.closed ? (
              <button className="btn btn-ghost btn-sm btn-full" onClick={closePoll} style={{ marginBottom: 10 }}>
                🔒 CLOSE POLL
              </button>
            ) : (
              <p className="fd" style={{ color: '#ff2d55', fontSize: '.76rem', textAlign: 'center', marginBottom: 10 }}>● POLL CLOSED</p>
            )}
          </>
        )}
      </div>

      {/* Host action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="btn btn-r btn-xl btn-full"
          onClick={nextQuestion}
          disabled={isLastQuestion}
          style={{ fontSize: '1.1rem', padding: '14px 0' }}
        >
          {isLastQuestion ? '✅ LAST QUESTION' : 'NEXT QUESTION →'}
        </button>

        <button
          className="btn btn-full"
          onClick={skipStage}
          style={{
            background: 'transparent', color: '#ffd60a',
            border: '2px solid rgba(255,214,10,.4)',
            fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2,
            fontSize: '.9rem', padding: '10px 0', borderRadius: 8,
          }}
        >
          ⏭ SKIP TO NEXT STAGE
        </button>
      </div>
    </div>
  );
}

function HotSeatControls() {
  const { game, setGame, doPickHotSeat, spinning, spinLabel, skipStage } = useGame();
  const { hotSeat, players } = game;
  const sel = hotSeat.selected ? players[hotSeat.selected] : null;
  const playerList = Object.values(players || {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#161625', border: '2px solid rgba(255,45,85,.4)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
        <p className="fd" style={{ color: '#ff2d55', letterSpacing: 2, fontSize: '.85rem', marginBottom: 12 }}>🔥 HOT SEAT</p>

        {spinning && (
          <p className="fd" style={{ fontSize: '1.8rem', color: '#ffd60a', animation: 'flashAnim .12s infinite', marginBottom: 12 }}>{spinLabel}</p>
        )}

        {sel && !spinning && (
          <div style={{ marginBottom: 14 }}>
            <p className="fd" style={{ fontSize: '1.5rem', color: '#ffd60a' }}>{sel.name}</p>
            {hotSeat.category ? (
              <p className="fd" style={{ color: '#00e8ff', fontSize: '.9rem', marginTop: 4 }}>📂 {hotSeat.category}</p>
            ) : (
              <p style={{ color: '#5a5a8a', fontSize: '.8rem', animation: 'flashAnim 1.2s infinite', marginTop: 4 }}>Waiting for category…</p>
            )}
          </div>
        )}

        {!sel && !spinning && (
          <p style={{ color: '#5a5a8a', fontSize: '.85rem', marginBottom: 12 }}>
            🙋 {hotSeat.candidates.length} volunteer{hotSeat.candidates.length !== 1 ? 's' : ''}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="btn btn-r" onClick={doPickHotSeat} disabled={!hotSeat.candidates.length || spinning}>
            🎲 RANDOM PICK
          </button>
          {sel && (
            <button className="btn btn-ghost btn-sm" onClick={() => setGame(s => ({
              ...s, hotSeat: { ...s.hotSeat, selected: null, category: null }, phase: 'part2',
            }))}>CLEAR</button>
          )}
        </div>
      </div>

      {/* Players with opt-in status */}
      <div style={{ background: '#161625', border: '1px solid #252538', borderRadius: 10, padding: 12 }}>
        <p className="fd" style={{ color: '#5a5a8a', fontSize: '.7rem', letterSpacing: 2, marginBottom: 8 }}>PLAYERS ({playerList.length})</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {playerList.map(p => {
            const opted = hotSeat.candidates.includes(p.id);
            return (
              <span key={p.id} className="fd" style={{
                fontSize: '.76rem',
                color: opted ? '#ff2d55' : '#eeeef8',
                background: opted ? 'rgba(255,45,85,.12)' : '#0f0f1c',
                border: `1px solid ${opted ? 'rgba(255,45,85,.4)' : '#252538'}`,
                padding: '2px 9px', borderRadius: 12,
              }}>{opted ? '🙋 ' : ''}{p.name}</span>
            );
          })}
        </div>
      </div>

      <button
        className="btn btn-full"
        onClick={skipStage}
        style={{
          background: 'transparent', color: '#ffd60a',
          border: '2px solid rgba(255,214,10,.4)',
          fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2,
          fontSize: '.9rem', padding: '10px 0', borderRadius: 8,
        }}
      >
        ⏭ SKIP TO NEXT STAGE
      </button>
    </div>
  );
}

function PhotoControls() {
  const { game, setGame } = useGame();
  const { currentPhoto, photos } = game;
  const pending = (photos || []).filter(p => !p.approved);
  const readyQ = (photos || []).filter(p => p.approved && !p.used);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#161625', border: '2px solid rgba(0,232,255,.4)', borderRadius: 10, padding: 16 }}>
        <p className="fd" style={{ color: '#00e8ff', letterSpacing: 2, fontSize: '.85rem', marginBottom: 12 }}>📸 PHOTO TAKEOVER</p>

        {currentPhoto && (
          <div style={{ marginBottom: 12 }}>
            <img src={currentPhoto.dataUrl} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8 }} alt="" />
            <button className="btn btn-ghost btn-sm btn-full" onClick={() => setGame(s => ({ ...s, currentPhoto: null }))} style={{ marginTop: 6 }}>CLEAR SCREEN</button>
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
          style={{ marginBottom: 10, padding: '12px 0', fontSize: '1rem' }}
        >📸 REVEAL RANDOM ({readyQ.length})</button>
      </div>

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div style={{ background: '#161625', border: '1px solid #252538', borderRadius: 10, padding: 12 }}>
          <p className="fd" style={{ color: '#ffd60a', fontSize: '.7rem', letterSpacing: 2, marginBottom: 8 }}>PENDING APPROVAL ({pending.length})</p>
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
    </div>
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
      <div style={{ background: '#161625', border: '1px solid rgba(255,214,10,.3)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
        <p className="fd" style={{ color: '#ffd60a', letterSpacing: 2, fontSize: '.8rem', marginBottom: 10 }}>📱 PLAYER JOIN LINK</p>
        <p style={{ color: '#5a5a8a', fontSize: '.76rem', marginBottom: 12 }}>Share this link with players to join on their phones</p>
        <div style={{
          background: '#0f0f1c', border: '1px solid #252538', borderRadius: 8,
          padding: '10px 14px', marginBottom: 10, wordBreak: 'break-all',
        }}>
          <p style={{ color: '#ffd60a', fontSize: '.85rem', fontFamily: 'monospace' }}>{playerUrl}</p>
        </div>
        <button className="btn btn-y btn-full" onClick={() => copy(playerUrl, setCopiedPlayer)}>
          {copiedPlayer ? '✅ COPIED!' : '📋 COPY PLAYER LINK'}
        </button>
      </div>

      <div style={{ background: '#161625', border: '1px solid rgba(0,232,255,.3)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
        <p className="fd" style={{ color: '#00e8ff', letterSpacing: 2, fontSize: '.8rem', marginBottom: 10 }}>🎬 PHONE REMOTE</p>
        <p style={{ color: '#5a5a8a', fontSize: '.76rem', marginBottom: 12 }}>Control the game from your phone</p>
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
        <button className="btn btn-c btn-full" onClick={() => copy(remoteUrl, setCopiedRemote)}>
          {copiedRemote ? '✅ COPIED!' : '📋 COPY REMOTE LINK'}
        </button>
      </div>
    </div>
  );
}

export default function AdminView() {
  const { game, resetAll, STAGES } = useGame();
  const [sidebarTab, setSidebarTab] = useState('controls');

  const tickerText = Array(10).fill('🔥 THE HOT SEAT  ·  DEBATE NIGHT  ·  HOT TAKES  ·  ').join('');
  const stageLabel = STAGE_LABELS[game.stage] || game.stage;
  const stageIdx = STAGES.indexOf(game.stage);

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', flex: 1, overflow: 'hidden', minHeight: 470 }}>
        {/* Presentation area — the big screen */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '32px 40px', borderRight: '1px solid #252538', overflow: 'hidden',
        }}>
          <PresArea />
        </div>

        {/* Sidebar — host controls */}
        <div style={{ background: '#0f0f1c', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {/* Current stage indicator */}
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid #252538',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="fd" style={{ color: '#ff2d55', fontSize: '.85rem' }}>{stageLabel}</span>
              {/* Stage dots */}
              <div style={{ display: 'flex', gap: 4 }}>
                {STAGES.map((s, i) => (
                  <div key={s} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: i < stageIdx ? '#ff2d55' : i === stageIdx ? '#ffd60a' : '#252538',
                    transition: 'background .3s',
                  }} />
                ))}
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{
            padding: '8px 14px', borderBottom: '1px solid #252538',
            display: 'flex', gap: 6, flexShrink: 0,
          }}>
            {[
              { key: 'controls', label: '🎮 CONTROLS' },
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

          {/* Tab content */}
          <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
            {sidebarTab === 'controls' && (
              <>
                {game.stage === 'lobby' && <LobbyControls />}
                {game.stage === 'yesno' && <YesNoControls />}
                {game.stage === 'hotseat' && <HotSeatControls />}
                {game.stage === 'photo' && <PhotoControls />}
              </>
            )}
            {sidebarTab === 'links' && <LinksTab />}
            {sidebarTab === 'setup' && <SetupTab />}

            {/* Reset at the bottom */}
            {sidebarTab === 'controls' && (
              <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm('Reset everything?')) resetAll(); }} style={{ color: '#5a5a8a', fontSize: '.72rem', marginTop: 'auto' }}>
                ⚠ RESET ALL DATA
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
