'use client';

import { useState } from 'react';

export default function PinOverlay({ correctPin, onSuccess }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);

  function tryPin() {
    if (pin === correctPin) {
      onSuccess();
    } else {
      setErr(true);
      setPin('');
      setTimeout(() => setErr(false), 1200);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(7,7,14,.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <p className="fd" style={{ color: '#ff2d55', fontSize: '1.6rem', letterSpacing: 3, marginBottom: 14 }}>ADMIN PIN</p>
        <input
          className="inp"
          type="password"
          maxLength={4}
          placeholder="Enter 4-digit PIN"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tryPin()}
          style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: 8, marginBottom: 14 }}
          autoFocus
        />
        {err && <p style={{ color: '#ff2d55', fontSize: '.85rem', marginBottom: 10 }}>Wrong PIN</p>}
        <button className="btn btn-r btn-lg btn-full" onClick={tryPin}>UNLOCK</button>
      </div>
    </div>
  );
}
