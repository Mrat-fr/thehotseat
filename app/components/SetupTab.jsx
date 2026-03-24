'use client';

import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function SetupTab() {
  const { game, setGame } = useGame();
  const [presets, setPresets] = useState(game.presets.slice());
  const [cats, setCats] = useState(game.categories.slice());
  const [pin, setPin] = useState('');
  const [saved, setSaved] = useState(false);

  function saveSetup() {
    const p = presets.map(x => x.trim()).filter(Boolean);
    const c = cats.map(x => x.trim()).filter(Boolean);
    setGame(s => ({
      ...s,
      presets: p,
      categories: c,
      adminPin: pin.length === 4 ? pin : s.adminPin,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Hot Takes */}
      <div style={{ background: '#161625', border: '1px solid rgba(255,214,10,.3)', borderRadius: 10, padding: 14 }}>
        <p className="fd" style={{ color: '#ffd60a', fontSize: '.8rem', letterSpacing: 2, marginBottom: 4 }}>HOT TAKES (PART 1)</p>
        <p style={{ color: '#5a5a8a', fontSize: '.72rem', marginBottom: 12 }}>Shown as yes/no polls in order.</p>
        {presets.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 7 }}>
            <input
              className="inp"
              value={p}
              onChange={e => { const n = [...presets]; n[i] = e.target.value; setPresets(n); }}
              style={{ fontSize: '.85rem', padding: '7px 10px' }}
              placeholder={`Hot take ${i + 1}...`}
            />
            <button className="btn btn-ghost btn-sm" onClick={() => setPresets(presets.filter((_, j) => j !== i))}>X</button>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={() => setPresets([...presets, ''])} style={{ marginTop: 2 }}>+ ADD</button>
      </div>

      {/* Categories */}
      <div style={{ background: '#161625', border: '1px solid rgba(0,232,255,.3)', borderRadius: 10, padding: 14 }}>
        <p className="fd" style={{ color: '#00e8ff', fontSize: '.8rem', letterSpacing: 2, marginBottom: 4 }}>CATEGORIES (PART 2)</p>
        {cats.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 7 }}>
            <input
              className="inp"
              value={c}
              onChange={e => { const n = [...cats]; n[i] = e.target.value; setCats(n); }}
              style={{ fontSize: '.85rem', padding: '7px 10px' }}
              placeholder={`Category ${i + 1}...`}
            />
            <button className="btn btn-ghost btn-sm" onClick={() => setCats(cats.filter((_, j) => j !== i))}>X</button>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={() => setCats([...cats, ''])} style={{ marginTop: 2 }}>+ ADD</button>
      </div>

      {/* Change PIN */}
      <div style={{ background: '#161625', border: '1px solid rgba(57,255,20,.3)', borderRadius: 10, padding: 14 }}>
        <p className="fd" style={{ color: '#39ff14', fontSize: '.8rem', letterSpacing: 2, marginBottom: 10 }}>CHANGE PIN</p>
        <input
          className="inp"
          type="password"
          maxLength={4}
          placeholder="New 4-digit PIN (blank = keep current)"
          value={pin}
          onChange={e => setPin(e.target.value)}
        />
      </div>

      <button className="btn btn-g btn-lg btn-full" onClick={saveSetup}>
        {saved ? 'SAVED!' : 'SAVE CHANGES'}
      </button>
    </div>
  );
}
