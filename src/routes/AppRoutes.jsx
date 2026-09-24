import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { ProtectedRoute, GuestRoute } from '../auth/ProtectedRoute';
import { AdminLayout } from '../layouts/AdminLayout';
import { UserLayout } from '../layouts/UserLayout';
import { LoginForm } from '../auth/LoginForm';
import { AdminApp } from '../app/AdminApp';
import { UserApp } from '../app/UserApp';

export function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<GuestRoute><LoginForm /></GuestRoute>} />

        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin/*" element={<AdminApp />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['owner', 'driver']}><UserLayout /></ProtectedRoute>}>
          <Route path="/user" element={<Navigate to="/user/vehicles" replace />} />
          <Route path="/user/vehicles" element={<UserApp page="vehicles" />} />
          <Route path="/user/payments" element={<UserApp page="payments" />} />
          <Route path="/user/documents" element={<UserApp page="documents" />} />
          <Route path="/user/profile" element={<UserApp page="profile" />} />
        </Route>

        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}