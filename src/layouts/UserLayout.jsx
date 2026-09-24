import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Car, CreditCard, FolderOpen, User, LogOut, Menu, X, Moon, Sun, Monitor, Bell } from '@phosphor-icons/react';
import { UserTopbar } from '../components/user/UserTopbar';
import { UserBottomNav } from '../components/user/UserBottomNav';

const NAV_ITEMS = [
  { path: '/user/vehicles', label: 'Viaturas', icon: Car, roles: ['owner', 'driver'] },
  { path: '/user/payments', label: 'Pagamentos', icon: CreditCard, roles: ['owner'] },
  { path: '/user/documents', label: 'Documentos', icon: FolderOpen, roles: ['owner', 'driver'] },
  { path: '/user/profile', label: 'Perfil', icon: User, roles: ['owner', 'driver'] },
];

export function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPath = location.pathname;

  return (
    <div className="user-layout" data-theme={resolvedTheme}>
      <a className="skip-link" href="#main-content">Ir para o conteúdo</a>

      <header className="user-topbar" role="banner">
        <UserTopbar
          user={user}
          role={role}
          theme={resolvedTheme}
          onToggleTheme={toggleTheme}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          onLogout={handleLogout}
          mobileMenuOpen={mobileMenuOpen}
        />
      </header>

      {mobileMenuOpen && (
        <div
          className="user-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`user-sidebar ${mobileMenuOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Navegação principal"
      >
        <nav className="user-nav">
          <ul className="user-nav-list">
            {filteredNav.map(item => (
              <li key={item.path}>
                <button
                  className={`user-nav-item ${currentPath === item.path ? 'active' : ''}`}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  aria-current={currentPath === item.path ? 'page' : undefined}
                >
                  <item.icon size={22} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
            <li>
              <button
                className="user-nav-item logout-item"
                onClick={handleLogout}
              >
                <LogOut size={22} aria-hidden="true" />
                <span>Sair</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main id="main-content" className="user-main" role="main" tabIndex={-1}>
        <Outlet />
      </main>

      <UserBottomNav
        currentPath={currentPath}
        navItems={filteredNav}
        onNavigate={path => {
          navigate(path);
          setMobileMenuOpen(false);
        }}
      />
    </div>
  );
}