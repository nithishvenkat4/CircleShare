export default function EmptyState({ icon = '○', title = 'Nothing here yet', hint, action }) {
  return (
    <div className="empty-state">
      <div className="icon-wrap" style={{ fontSize: 22 }}>{icon}</div>
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
      {action}
    </div>
  );
}
