export function StatusBadge({ type = 'default', children }) {
  return <span className={`status-badge ${type}`}>{children}</span>;
}
