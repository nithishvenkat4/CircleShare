export default function Avatar({ name, color = '#4C1D95', size = 40 }) {
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';
  return (
    <div className="avatar-badge" style={{ background: color, width: size, height: size, fontSize: size * 0.4 }}>
      {initial}
    </div>
  );
}
