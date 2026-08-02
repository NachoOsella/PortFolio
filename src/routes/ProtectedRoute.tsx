import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingState label="Checking session" />;
  return session ? (
    <Outlet />
  ) : (
    <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />
  );
}
