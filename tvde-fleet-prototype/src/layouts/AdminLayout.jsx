import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { X, Menu, List } from '@phosphor-icons/react';
import { ProfileMenu } from '../WorkspaceExtras.jsx';

const ADMIN_MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: List },
  { id: 'owners', label: 'Proprietários', icon: List },
  { id: 'vehicles', label: 'Viaturas', icon: List },
  { id: 'vehicle-library', label: 'Biblioteca de imagens', icon: List },
  { id: 'drivers', label: 'Motoristas', icon: List },
  { id: 'contracts', label: 'Contratos', icon: List },
  { id: 'operation', label: 'Operação', icon: List },
  { id: 'payments', label: 'Pagamentos', icon: List },
  { id: 'documents', label: 'Documentos', icon: List },
  { id: 'crm', label: 'CRM', icon: List },
  { id: 'retakes', label: 'Retomas', icon: List },
  { id: 'billing', label: 'Facturação', icon: List },
  { id: 'team', label: 'Equipa', icon: List },
  { id: 'email-templates', label: 'Modelos de email', icon: List },
  { id: 'reports', label: 'Relatórios', icon: List },
  { id: 'settings', label: 'Definições', icon: List },
];

export function AdminLayout({ profile, activePage, setActivePage, openModal, mobileMenu, setMobileMenu }) {
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      <a className="skip-link" href="#main-content">Ir para o conteúdo</a>

      <aside className={`admin-sidebar ${mobileMenu ? 'mobile-open' : ''}`} role="navigation" aria-label="Navegação administrativa">
        <div className="admin-brand">
          <div className="brand-mark">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="brand-text">
            <strong>TVDE Fleet</strong>
            <span>Gestão de frota</span>
          </div>
          <button className="mobile-close" aria-label="Fechar menu" onClick={() => setMobileMenu(false)}>
            <X size={19} />
          </button>
        </div>

        <nav className="admin-nav">
          <div className="nav-section-title">WORKSPACE / PORTUGAL</div>
          {ADMIN_MENU.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                aria-current={activePage === item.id ? 'page' : undefined}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenu(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            key="email-settings"
            className={`nav-item ${activePage === 'email-settings' ? 'active' : ''}`}
            aria-current="page"
            onClick={() => {
              setActivePage('email-settings');
              setMobileMenu(false);
            }}
          >
            <List size={18} />
            <span>Definições de Email</span>
          </button>
        </nav>

        <div className="sidebar-user">
          <ProfileMenu
            profile={profile}
            placement="up"
            onEdit={() => openModal('profile-edit')}
            onTeam={() => { setActivePage('team'); setMobileMenu(false); }}
            onTemplates={() => { setActivePage('email-templates'); setMobileMenu(false); }}
          />
        </div>
      </aside>

      {mobileMenu && (
        <div className="mobile-overlay" onClick={() => setMobileMenu(false)} aria-hidden="true" />
      )}

      <main className="admin-main" role="main">
        <header className="admin-topbar">
          <button className="mobile-menu" aria-label="Abrir menu" onClick={() => setMobileMenu(true)}>
            <Menu size={20} />
          </button>

          <div className="global-search">
            <svg className="search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              aria-label="Pesquisar módulos"
              placeholder="Pesquisar módulos…"
              onChange={(e) => navigate(`/admin/search?q=${encodeURIComponent(e.target.value)}`)}
            />
          </div>

          <div className="topbar-actions">
            <span className="session-chip">
              <span aria-hidden="true" />
              Demonstração
            </span>
            <button className="icon-button notification-button" aria-label="Ver avisos">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="notification-badge" aria-hidden="true" />
            </button>

            <ProfileMenu
              profile={profile}
              compact
              onEdit={() => openModal('profile-edit')}
              onTeam={() => setActivePage('team')}
              onTemplates={() => setActivePage('email-templates')}
            />
          </div>
        </header>

        <section className="content" id="main-content" tabIndex={-1}>
          <Outlet />
        </section>
      </main>
    </div>
  );
}