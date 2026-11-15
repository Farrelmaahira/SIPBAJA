import type { FC, ReactNode } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
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

  // Robustly resolve effective role name from direct role string, role object relation, or known role IDs
  let effectiveRole = role || user.role?.nama || user.Role?.nama || '';
  if (!effectiveRole && user.role_id) {
    const roleIdMap: Record<number, string> = {
      1: 'Pemohon',
      2: 'Perencanaan',
      3: 'Bidang 2',
      4: 'PPBJ',
      5: 'PP',
      6: 'PPK',
      7: 'Perlengkapan',
      8: 'Keuangan',
      9: 'Admin',
    };
    effectiveRole = roleIdMap[user.role_id] || '';
  }

  const normalizedUserRole = normalizeRole(effectiveRole);
  const isAllowed =
    allowedRoles.some((allowed) => normalizeRole(allowed) === normalizedUserRole) ||
    (user.role_id === 3 && allowedRoles.some((r) => normalizeRole(r) === 'bidang2')) ||
    (normalizedUserRole === 'bidang2' && allowedRoles.some((r) => normalizeRole(r) === 'bidang2'));

  if (!isAllowed) {
    const fallbackPath = getRoleDashboardPath(effectiveRole);
    // Never bounce an authenticated user to the login route ('/' or '/login')
    if (fallbackPath === '/' || fallbackPath === '/login') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center">
            <h2 className="text-base font-bold text-slate-800 mb-2">Akses Terbatas</h2>
            <p className="text-xs text-slate-500 mb-4">
              Akun Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
            <Link
              to="/bidang-2/dashboard"
              className="inline-block px-4 py-2 text-xs font-semibold text-white bg-[#0E7C5A] rounded-xl hover:bg-[#0B6549] transition-colors"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleRoute;
