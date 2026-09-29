import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_INIT':
      return { ...state, isLoading: false, ...action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        role: action.payload.role,
        isLoading: false,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

// Contas de demonstração: qualquer password é aceite. O email identifica o perfil na sessão local.
export const DEMO_USERS = {
  'admin@demo.pt': { role: 'admin', name: 'Administrador', email: 'admin@demo.pt' },
  'owner@demo.pt': { role: 'owner', name: 'Rui Alexandre Santos', email: 'owner@demo.pt', nif: '123456789', phone: '+351 910 000 001' },
  'driver@demo.pt': { role: 'driver', name: 'Diogo Nunes Ferreira', email: 'driver@demo.pt', nif: '456789123', phone: '+351 910 000 003' },
};

// Página inicial de cada perfil depois de entrar.
export const homeFor = role => (role === 'admin' ? '/admin' : '/user/vehicles');

// Depois de entrar, volta à página pedida antes do login só se pertencer à área do perfil.
export function destinationFor(role, from) {
  const area = role === 'admin' ? '/admin' : '/user';
  return from?.startsWith(area) ? from : homeFor(role);
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const stored = localStorage.getItem('tvde_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.user && parsed.role) {
          dispatch({ type: 'AUTH_INIT', payload: parsed });
          return;
        }
      } catch {
        localStorage.removeItem('tvde_auth');
      }
    }
    dispatch({ type: 'AUTH_INIT', payload: { user: null, role: null, isAuthenticated: false } });
  }, []);

  const login = useCallback(async (email, role) => {
    await new Promise(r => setTimeout(r, 500));
    
    const demoUser = DEMO_USERS[String(email).trim().toLowerCase()];
    if (!demoUser || demoUser.role !== role) {
      throw new Error('Email ou tipo de utilizador incorrecto. Use uma das contas de demonstração indicadas abaixo.');
    }

    const userData = { user: demoUser, role, isAuthenticated: true };
    localStorage.setItem('tvde_auth', JSON.stringify(userData));
    dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tvde_auth');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((updates) => {
    const newUser = { ...state.user, ...updates };
    localStorage.setItem('tvde_auth', JSON.stringify({ user: newUser, role: state.role, isAuthenticated: true }));
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, [state.user, state.role]);

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    hasRole: (roles) => {
      if (!state.isAuthenticated) return false;
      const allowed = Array.isArray(roles) ? roles : [roles];
      return allowed.includes(state.role);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}