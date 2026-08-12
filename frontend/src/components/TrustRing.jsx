// Signature visual: a circular "trust ring" whose fill reflects the user's
// trust score, echoing the CircleShare "circle" identity everywhere an
// avatar appears (navbar, cards, profile, dashboard).
export default function TrustRing({ score = 50, color = '#4C1D95', size = 44, children }) {
  const pct = Math.max(0, Math.min(100, score));
  const style = {
    width: size,
    height: size,
    background: `conic-gradient(${color} ${pct * 3.6}deg, var(--ring-track) ${pct * 3.6}deg)`,
    padding: 3,
  };
  const innerSize = size - 6;
  return (
    <div className="trust-ring" style={style} title={`Trust score: ${pct}`}>
      <div className="trust-ring-inner" style={{ width: innerSize, height: innerSize, fontSize: size * 0.34 }}>
        {children}
      </div>
    </div>
  );
}
