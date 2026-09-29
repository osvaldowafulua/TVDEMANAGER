import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Car, User, UserGear, SteeringWheel, LockKey, Eye, EyeClosed, EnvelopeSimple } from '@phosphor-icons/react';
import { useAuth, destinationFor, DEMO_USERS } from './AuthContext';

const ROLES = [
  { value: 'admin', label: 'Gestor de frota', description: 'Operação completa: viaturas, motoristas, pagamentos, facturação', icon: UserGear },
  { value: 'owner', label: 'Proprietário', description: 'As suas viaturas, pagamentos, contratos e documentos', icon: User },
  { value: 'driver', label: 'Motorista', description: 'Viatura atribuída, licença TVDE e documentos', icon: SteeringWheel },
];

const demoEmailFor = role => Object.keys(DEMO_USERS).find(email => DEMO_USERS[email].role === role);

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname;

  const [form, setForm] = useState({ email: demoEmailFor('admin'), role: 'admin', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const chooseRole = role => setForm(v => ({
    ...v,
    role,
    // Troca o email apenas se ainda estiver vazio ou com outra conta de demonstração.
    email: !v.email || DEMO_USERS[v.email] ? demoEmailFor(role) : v.email,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form.email, form.role);
      navigate(destinationFor(form.role, from), { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-container">
        <div className="login-brand">
          <div className="login-brand-mark">
            <Car size={26} aria-hidden="true" />
          </div>
          <div>
            <h1>TVDE Fleet</h1>
            <p>Gestão de frota TVDE · Portugal</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <h2>Entrar</h2>

          {error && <div className="login-error" role="alert">{error}</div>}

          <fieldset className="role-fieldset">
            <legend>Tipo de utilizador</legend>
            <div className="role-options">
              {ROLES.map(({ value, label, description, icon: Icon }) => (
                <label key={value} className={`role-option ${form.role === value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={form.role === value}
                    onChange={() => chooseRole(value)}
                    disabled={loading}
                  />
                  <Icon size={22} aria-hidden="true" />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="login-field">
            <label htmlFor="login-email">Email</label>
            <div className="input-with-icon">
              <EnvelopeSimple size={18} aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={e => setForm(v => ({ ...v, email: e.target.value }))}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <div className="input-with-icon">
              <LockKey size={18} aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Qualquer password (demonstração)"
                value={form.password}
                onChange={e => setForm(v => ({ ...v, password: e.target.value }))}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Ocultar password' : 'Mostrar password'}
                aria-pressed={showPassword}
                disabled={loading}
              >
                {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block login-submit" disabled={loading}>
            {loading ? 'A entrar…' : 'Entrar'}
          </button>
        </form>

        <p className="login-demo-hint">
          Sessão de demonstração: os dados são fictícios e ficam apenas neste browser. Contas: <code>admin@demo.pt</code>, <code>owner@demo.pt</code> e <code>driver@demo.pt</code>, com qualquer password.
        </p>
      </main>
    </div>
  );
}
