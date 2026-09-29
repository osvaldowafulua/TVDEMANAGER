import { useNavigate } from 'react-router-dom';
import App from '../App.jsx';
import { useAuth } from '../auth/AuthContext';

// Área de gestão: o workspace existente, com saída de sessão ligada à autenticação.
export function AdminApp() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return <App onLogout={() => { logout(); navigate('/login', { replace: true }); }} />;
}
