import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function PinOverlay({ open, onClose, onSuccess }) {
  const { game } = useGame();
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);

  if (!open) return null;

  function handleSubmit() {
    if (pin === game.adminPin) {
      setPin('');
      setErr(false);
      onSuccess();
    } else {
      setErr(true);
      setPin('');
    }
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(7,7,14,.93)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 280, textAlign: 'center', animation: 'fadeUp .25s ease', padding: 24 }}>
        <p className="fd" style={{ fontSize: '1.6rem', color: '#39ff14', marginBottom: 4 }}>ADMIN</p>
        <p style={{ color: '#5a5a8a', fontSize: '.82rem', marginBottom: 18 }}>Enter PIN to continue</p>
        <input
          className="inp"
          type="password"
          maxLength={4}
          placeholder="••••"
          value={pin}
          onChange={e => { setPin(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{ textAlign: 'center', fontSize: '1.6rem', letterSpacing: 10, marginBottom: 10 }}
          autoFocus
        />
        {err && <p style={{ color: '#ff2d55', fontSize: '.8rem', marginBottom: 8 }}>Incorrect</p>}
        <button className="btn btn-g btn-lg btn-full" onClick={handleSubmit}>UNLOCK →</button>
        <button className="btn btn-ghost btn-sm" onClick={() => { setPin(''); setErr(false); onClose(); }} style={{ marginTop: 10, width: '100%' }}>Cancel</button>
      </div>
    </div>
  );
}
