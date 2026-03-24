'use client';

export default function BigLabel({ color, icon, text, sub }) {
  return (
    <div style={{ textAlign: 'center', animation: 'fadeUp .5s ease' }}>
      <div style={{ fontSize: '4rem', marginBottom: 6 }}>{icon}</div>
      <p className="fd" style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', color, lineHeight: '.9' }}>{text}</p>
      {sub && <p style={{ color: '#5a5a8a', fontSize: '1rem', marginTop: 10 }}>{sub}</p>}
    </div>
  );
}
