import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="auth-loading" role="status" aria-label="A verificar autenticação">
        <div className="spinner" aria-hidden="true" />
        <span className="sr-only">A carregar...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/user/vehicles" replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading" role="status" aria-label="A verificar autenticação">
        <div className="spinner" aria-hidden="true" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/user/vehicles" replace />;
  }

  return children;
}