import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LockKey, Eye, EyeClosed, Mail } from '@phosphor-icons/react';
import { useAuth } from './AuthContext';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/user/vehicles';

  const [form, setForm] = useState({ email: '', role: 'owner', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form.email, form.role);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-container">
        <div className="login-brand">
          <div className="login-brand-mark">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h1>TVDE Fleet</h1>
          <p>Painel do Utilizador</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="login-error" role="alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <Mail size={18} aria-hidden="true" />
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="owner@demo.pt ou driver@demo.pt"
                value={form.email}
                onChange={e => setForm(v => ({ ...v, email: e.target.value }))}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <LockKey size={18} aria-hidden="true" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Qualquer password (demo)"
                value={form.password}
                onChange={e => setForm(v => ({ ...v, password: e.target.value }))}
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="icon-button password-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Ocultar password' : 'Mostrar password'}
                aria-pressed={showPassword}
                disabled={loading}
              >
                {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <fieldset className="form-group role-fieldset">
            <legend>Tipo de utilizador</legend>
            <div className="role-options">
              <label className={`role-option ${form.role === 'owner' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="owner"
                  checked={form.role === 'owner'}
                  onChange={e => setForm(v => ({ ...v, role: e.target.value }))}
                  disabled={loading}
                />
                <span className="role-option-content">
                  <User size={20} aria-hidden="true" />
                  <div>
                    <strong>Proprietário</strong>
                    <small>Viaturas, pagamentos, contratos, documentos</small>
                  </div>
                </span>
              </label>
              <label className={`role-option ${form.role === 'driver' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="driver"
                  checked={form.role === 'driver'}
                  onChange={e => setForm(v => ({ ...v, role: e.target.value }))}
                  disabled={loading}
                />
                <span className="role-option-content">
                  <User size={20} aria-hidden="true" />
                  <div>
                    <strong>Motorista</strong>
                    <small>Viatura atribuída, licença TVDE, documentos</small>
                  </div>
                </span>
              </label>
            </div>
          </fieldset>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        <div className="login-demo-hint">
          <p><strong>Demo:</strong> Use <code>owner@demo.pt</code> ou <code>driver@demo.pt</code> com qualquer password.</p>
        </div>
      </main>
    </div>
  );
}