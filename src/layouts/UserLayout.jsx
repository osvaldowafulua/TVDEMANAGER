import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Car, CreditCard, FolderOpen, User, SignOut } from '@phosphor-icons/react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { UserTopbar } from '../components/user/UserTopbar';
import { UserBottomNav } from '../components/user/UserBottomNav';

const NAV_ITEMS = [
  { path: '/user/vehicles', label: 'Viaturas', driverLabel: 'Viatura', icon: Car, roles: ['owner', 'driver'] },
  { path: '/user/payments', label: 'Pagamentos', icon: CreditCard, roles: ['owner'] },
  { path: '/user/documents', label: 'Documentos', icon: FolderOpen, roles: ['owner', 'driver'] },
  { path: '/user/profile', label: 'Perfil', icon: User, roles: ['owner', 'driver'] },
];

export function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const navItems = NAV_ITEMS
    .filter(item => item.roles.includes(role))
    .map(item => ({ ...item, label: role === 'driver' && item.driverLabel ? item.driverLabel : item.label }));

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const currentPath = location.pathname;

  return (
    <div className="user-layout" data-theme={resolvedTheme}>
      <a className="skip-link" href="#main-content">Ir para o conteúdo</a>

      <header className="user-topbar">
        <UserTopbar
          user={user}
          role={role}
          theme={theme}
          onToggleTheme={toggleTheme}
          onProfile={() => navigate('/user/profile')}
          onLogout={handleLogout}
        />
      </header>

      <div className="user-shell">
        <aside className="user-sidebar" aria-label="Navegação principal">
          <nav>
            <ul className="user-nav-list">
              {navItems.map(item => (
                <li key={item.path}>
                  <button
                    type="button"
                    className={`user-nav-item ${currentPath === item.path ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    aria-current={currentPath === item.path ? 'page' : undefined}
                  >
                    <item.icon size={20} aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <button type="button" className="user-nav-item user-logout" onClick={handleLogout}>
            <SignOut size={20} aria-hidden="true" />
            <span>Terminar sessão</span>
          </button>
        </aside>

        <main id="main-content" className="user-main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      <UserBottomNav currentPath={currentPath} navItems={navItems} onNavigate={path => navigate(path)} />
    </div>
  );
}
