import type { FC, ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleDashboardPath, normalizeRole } from '../utils/role';

export interface RoleRouteProps {
  allowedRoles: string[];
  children?: ReactNode;
}

export const RoleRoute: FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { role, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Memeriksa hak akses...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const normalizedUserRole = normalizeRole(role);
  const isAllowed = allowedRoles.some(
    (allowed) => normalizeRole(allowed) === normalizedUserRole
  );

  if (!isAllowed) {
    const fallbackPath = getRoleDashboardPath(role);
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleRoute;
