import { Moon, Sun, Monitor, Bell, LogOut, User, X } from '@phosphor-icons/react';

export function UserTopbar({
  user,
  role,
  theme,
  onToggleTheme,
  onMenuToggle,
  onLogout,
  mobileMenuOpen,
}) {
  const themeIcons = {
    light: <Sun size={20} />,
    dark: <Moon size={20} />,
    system: <Monitor size={20} />,
  };

  const themeLabels = {
    light: 'Claro',
    dark: 'Escuro',
    system: 'Sistema',
  };

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('') || '?';

  const roleLabels = {
    owner: 'Proprietário',
    driver: 'Motorista',
  };

  return (
    <div className="user-topbar-inner">
      <div className="topbar-start">
        <button
          className="mobile-menu-btn"
          onClick={onMenuToggle}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-controls="user-sidebar"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="topbar-brand">
          <div className="brand-mark">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="brand-text">
            <strong>TVDE Fleet</strong>
            <span>Painel do Utilizador</span>
          </div>
        </div>
      </div>

      <div className="topbar-end">
        <button
          className="icon-button theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Tema atual: ${themeLabels[theme]}. Clique para alterar.`}
          title={`Tema: ${themeLabels[theme]}`}
        >
          {themeIcons[theme]}
        </button>

        <button className="icon-button notification-btn" aria-label="Notificações">
          <Bell size={20} />
          <span className="notification-badge" aria-hidden="true">3</span>
        </button>

        <div className="user-menu">
          <button
            className="user-avatar-btn"
            aria-haspopup="menu"
            aria-expanded="false"
            aria-label={`Menu do utilizador: ${user?.name}`}
          >
            <span className="avatar">{initials}</span>
          </button>

          <div className="user-dropdown" role="menu" aria-label="Opções do utilizador">
            <div className="dropdown-header">
              <strong>{user?.name}</strong>
              <small>{roleLabels[role]}</small>
            </div>
            <div className="dropdown-divider" />
            <button role="menuitem" className="dropdown-item" onClick={onLogout}>
              <LogOut size={16} aria-hidden="true" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}