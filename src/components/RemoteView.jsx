import { useGame } from '../context/GameContext';

export default function RemoteView() {
  const { game, setGame, advance, doPickHotSeat, spinning, spinLabel, voteCount, getSteps } = useGame();

  const allSteps = getSteps(game.presets);
  const stepIdx = Math.min(game.step || 0, allSteps.length - 1);
  const curStep = allSteps[stepIdx];
  const isLast = stepIdx >= allSteps.length - 1;
  const { poll, phase, hotSeat, players, photos, currentPhoto } = game;
  const tv = poll ? Object.keys(poll.votes || {}).length : 0;
  const sel = hotSeat.selected ? players[hotSeat.selected] : null;
  const pending = (photos || []).filter(p => !p.approved);
  const readyQ = (photos || []).filter(p => p.approved && !p.used);

  return (
    <div style={{ minHeight: '100vh', background: '#07070e' }}>
      {/* Header */}
      <div style={{
        background: '#0f0f1c', borderBottom: '1px solid #252538', padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <span className="fd" style={{ fontSize: '1.2rem', color: '#ff2d55', letterSpacing: 2 }}>🎬 REMOTE</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#5a5a8a', fontSize: '.8rem' }}>👥 {Object.keys(players || {}).length}</span>
          <span className="fd" style={{
            fontSize: '.72rem', letterSpacing: 2, color: '#ff2d55',
            background: 'rgba(255,45,85,.15)', border: '1px solid rgba(255,45,85,.3)',
            padding: '3px 10px', borderRadius: 4,
          }}>{phase.toUpperCase()}</span>
        </div>
      </div>

      <div style={{ maxWidth: 440, margin: '0 auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Step control */}
        <div style={{ background: '#0f0f1c', border: '2px solid rgba(255,45,85,.4)', borderRadius: 12, padding: 16 }}>
          <p style={{ color: '#5a5a8a', fontSize: '.68rem', letterSpacing: 2, fontFamily: "'Bebas Neue',sans-serif", marginBottom: 4 }}>
            STEP {stepIdx + 1}/{allSteps.length}
          </p>
          <p className="fd" style={{ fontSize: '1.05rem', marginBottom: 12 }}>{curStep?.label}</p>
          <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
            {allSteps.map((_, i) => (
              <div key={i} style={{
                height: 4, flex: 1, borderRadius: 2,
                background: i < stepIdx ? '#ff2d55' : i === stepIdx ? '#ffd60a' : '#252538',
              }} />
            ))}
          </div>
          <button className="btn btn-r btn-xl btn-full" onClick={advance} disabled={isLast}>
            {isLast ? '🏁 DONE' : 'NEXT →'}
          </button>
        </div>

        {/* Poll */}
        {phase === 'part1' && poll && (
          <div style={{ background: '#0f0f1c', border: '1px solid rgba(255,214,10,.3)', borderRadius: 12, padding: 14 }}>
            <p className="fd" style={{ color: '#ffd60a', fontSize: '.78rem', letterSpacing: 2, marginBottom: 6 }}>POLL · {tv} VOTES</p>
            <p className="fd" style={{ fontSize: '1rem', marginBottom: 12 }}>{poll.question}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              {[['YES', 'yes', '#00c96e'], ['NO', 'no', '#ff2d55']].map(([l, v, c]) => {
                const cnt = voteCount(poll.votes, v);
                const p = tv ? Math.round(cnt / tv * 100) : 0;
                return (
                  <div key={v} style={{ background: '#161625', border: `1px solid ${c}44`, borderRadius: 8, padding: 8 }}>
                    <p className="fd" style={{ color: c, fontSize: '.78rem' }}>{l}</p>
                    <p className="fd" style={{ color: c, fontSize: '1.5rem' }}>{p}%</p>
                  </div>
                );
              })}
            </div>
            {!poll.closed ? (
              <button className="btn btn-ghost btn-sm btn-full" onClick={() => setGame(s => s.poll ? { ...s, poll: { ...s.poll, closed: true } } : s)}>
                CLOSE POLL
              </button>
            ) : (
              <p className="fd" style={{ color: '#ff2d55', fontSize: '.76rem' }}>● CLOSED — hit NEXT</p>
            )}
          </div>
        )}

        {/* Hot Seat */}
        {(phase === 'part2' || phase === 'part2b') && (
          <div style={{ background: '#0f0f1c', border: '1px solid rgba(255,45,85,.3)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
            <p className="fd" style={{ color: '#ff2d55', fontSize: '.78rem', letterSpacing: 2, marginBottom: 10 }}>HOT SEAT</p>
            {spinning && <p className="fd" style={{ fontSize: '1.6rem', color: '#ffd60a', animation: 'flashAnim .12s infinite', marginBottom: 10 }}>{spinLabel}</p>}
            {sel && !spinning && (
              <div style={{ marginBottom: 10 }}>
                <p className="fd" style={{ fontSize: '1.5rem', color: '#ffd60a' }}>{sel.name}</p>
                {hotSeat.category ? (
                  <p className="fd" style={{ color: '#00e8ff', fontSize: '.9rem' }}>📂 {hotSeat.category}</p>
                ) : (
                  <p style={{ color: '#5a5a8a', fontSize: '.8rem', animation: 'flashAnim 1.2s infinite' }}>Waiting…</p>
                )}
              </div>
            )}
            {!sel && !spinning && <p style={{ color: '#5a5a8a', marginBottom: 10 }}>🙋 {hotSeat.candidates.length} volunteers</p>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn btn-r" onClick={doPickHotSeat} disabled={!hotSeat.candidates.length || spinning}>🎲 RANDOM PICK</button>
              {sel && <button className="btn btn-ghost btn-sm" onClick={() => setGame(s => ({
                ...s, hotSeat: { ...s.hotSeat, selected: null, category: null }, phase: 'part2',
              }))}>CLEAR</button>}
            </div>
          </div>
        )}

        {/* Photos */}
        {phase === 'part3' && (
          <div style={{ background: '#0f0f1c', border: '1px solid rgba(0,232,255,.3)', borderRadius: 12, padding: 14 }}>
            <p className="fd" style={{ color: '#00e8ff', fontSize: '.78rem', letterSpacing: 2, marginBottom: 10 }}>PHOTO TAKEOVER</p>
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
            {pending.map(ph => (
              <div key={ph.id} style={{
                display: 'flex', gap: 7, alignItems: 'center', marginBottom: 7,
                background: '#161625', borderRadius: 8, padding: 7,
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
    </div>
  );
}
