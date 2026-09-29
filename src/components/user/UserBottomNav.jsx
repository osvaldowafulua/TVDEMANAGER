export function UserBottomNav({ currentPath, navItems, onNavigate }) {
  if (!navItems.length) return null;

  return (
    <nav className="user-bottom-nav" role="navigation" aria-label="Navegação principal móvel">
      <ul className="bottom-nav-list">
        {navItems.map(item => (
          <li key={item.path}>
            <button
              type="button"
              className={`bottom-nav-item ${currentPath === item.path ? 'active' : ''}`}
              onClick={() => onNavigate(item.path)}
              aria-current={currentPath === item.path ? 'page' : undefined}
            >
              <item.icon size={22} weight={currentPath === item.path ? 'fill' : 'light'} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}