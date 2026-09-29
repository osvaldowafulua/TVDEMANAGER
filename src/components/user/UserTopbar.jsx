import { useEffect, useRef, useState } from 'react';
import { Car, Moon, Sun, Monitor, SignOut, User, CaretDown } from '@phosphor-icons/react';

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };
const THEME_LABELS = { light: 'Claro', dark: 'Escuro', system: 'Sistema' };
const ROLE_LABELS = { owner: 'Proprietário', driver: 'Motorista' };

export function UserTopbar({ user, role, theme, onToggleTheme, onProfile, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = event => { if (!menuRef.current?.contains(event.target)) setOpen(false); };
    const closeEscape = event => { if (event.key === 'Escape') { setOpen(false); menuRef.current?.querySelector('.user-avatar-btn')?.focus(); } };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeEscape);
    };
  }, [open]);

  const initials = user?.name?.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('') || '?';
  const ThemeIcon = THEME_ICONS[theme] || Monitor;
  const choose = callback => { setOpen(false); callback(); };

  return (
    <div className="user-topbar-inner">
      <div className="user-brand">
        <div className="brand-mark"><Car size={20} aria-hidden="true" /></div>
        <div className="user-brand-text">
          <strong>TVDE Fleet</strong>
          <span>Painel do {ROLE_LABELS[role]?.toLowerCase() || 'utilizador'}</span>
        </div>
      </div>

      <div className="user-topbar-end">
        <span className="user-demo-pill">Demonstração</span>

        <button
          type="button"
          className="user-icon-btn"
          onClick={onToggleTheme}
          aria-label={`Tema: ${THEME_LABELS[theme]}. Alterar tema`}
          title={`Tema: ${THEME_LABELS[theme]}`}
        >
          <ThemeIcon size={20} aria-hidden="true" />
        </button>

        <div className="user-menu" ref={menuRef}>
          <button
            type="button"
            className="user-avatar-btn"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={`Menu do utilizador: ${user?.name}`}
            onClick={() => setOpen(v => !v)}
          >
            <span className="user-avatar">{initials}</span>
            <CaretDown size={14} aria-hidden="true" />
          </button>

          {open && (
            <div className="user-dropdown" role="menu" aria-label="Opções do utilizador">
              <div className="user-dropdown-head">
                <strong>{user?.name}</strong>
                <small>{ROLE_LABELS[role]} · {user?.email}</small>
              </div>
              <button type="button" role="menuitem" onClick={() => choose(onProfile)}>
                <User size={16} aria-hidden="true" /> O meu perfil
              </button>
              <button type="button" role="menuitem" onClick={() => choose(onLogout)}>
                <SignOut size={16} aria-hidden="true" /> Terminar sessão
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
