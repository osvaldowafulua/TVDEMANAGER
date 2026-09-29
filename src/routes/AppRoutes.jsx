import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { ProtectedRoute, GuestRoute } from '../auth/ProtectedRoute';
import { UserLayout } from '../layouts/UserLayout';
import { LoginForm } from '../auth/LoginForm';
import { AdminApp } from '../app/AdminApp';
import { UserApp } from '../app/UserApp';

export function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<GuestRoute><LoginForm /></GuestRoute>} />

        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminApp /></ProtectedRoute>} />

        <Route element={<ProtectedRoute allowedRoles={['owner', 'driver']}><UserLayout /></ProtectedRoute>}>
          <Route path="/user" element={<Navigate to="/user/vehicles" replace />} />
          <Route path="/user/vehicles" element={<UserApp page="vehicles" />} />
          <Route path="/user/payments" element={<ProtectedRoute allowedRoles={['owner']}><UserApp page="payments" /></ProtectedRoute>} />
          <Route path="/user/documents" element={<UserApp page="documents" />} />
          <Route path="/user/profile" element={<UserApp page="profile" />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
