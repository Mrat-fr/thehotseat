export default function BigLabel({ color, icon, text, sub }) {
  return (
    <div style={{ textAlign: 'center', animation: 'fadeUp .4s ease' }}>
      <div style={{ fontSize: '3rem', marginBottom: 10 }}>{icon}</div>
      <p className="fd" style={{ fontSize: 'clamp(2rem,5vw,4.5rem)', color, letterSpacing: 3 }}>{text}</p>
      {sub && <p style={{ color: '#5a5a8a', marginTop: 10, fontSize: '1rem' }}>{sub}</p>}
    </div>
  );
}
