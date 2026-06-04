import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

interface Props {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: Props) => {
  const token = useAuthStore((state) => state.token);
  const roles = useAuthStore((state) => state.roles);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = roles?.some((r) => allowedRoles.includes(r));

    if (!hasRole) {
      return <Navigate to="/tasks" replace />;
    }
  }

  return <Outlet />;
};