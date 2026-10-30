import type { FC, ReactNode } from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleDashboardPath } from '../utils/role';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Auth Pages
import Login from '../pages/Auth/Login';

// Admin Pages
import AdminDashboard from '../pages/Admin/Dashboard';
import PenggunaIndex from '../pages/Admin/Pengguna/Index';
import UnitKerjaIndex from '../pages/Admin/UnitKerja/Index';
import MakIndex from '../pages/Admin/Mak/Index';
import RoleIndex from '../pages/Admin/Role/Index';
import RolePermissionIndex from '../pages/Admin/RolePermission/Index';

// Pemohon Pages
import PemohonDashboard from '../pages/Pemohon/Dashboard';
import PemohonPermohonanIndex from '../pages/Pemohon/Permohonan/Index';
import PemohonPermohonanCreate from '../pages/Pemohon/Permohonan/Create';

// Perencanaan Pages
import PerencanaanDashboard from '../pages/Perencanaan/Dashboard';
import PerencanaanPengajuanIndex from '../pages/Perencanaan/Pengajuan/Index';
import PerencanaanPengajuanShow from '../pages/Perencanaan/Pengajuan/Show';
import PerencanaanJenisMakIndex from '../pages/Perencanaan/JenisMak/Index';
import PerencanaanRkaklIndex from '../pages/Perencanaan/Rkakl/Index';
import PerencanaanNotifikasiIndex from '../pages/Perencanaan/Notifikasi/Index';
import PerencanaanProfilIndex from '../pages/Perencanaan/Profil/Index';

// Bidang 2 Pages
import Bidang2Dashboard from '../pages/Bidang2/Dashboard';
import Bidang2PengajuanIndex from '../pages/Bidang2/Pengajuan/Index';
import Bidang2RkaklIndex from '../pages/Bidang2/Rkakl/Index';

// PPBJ Pages
import PpbjDashboard from '../pages/Ppbj/Dashboard';
import PpbjPermohonanIndex from '../pages/Ppbj/Permohonan/Index';
import PpbjPermohonanShow from '../pages/Ppbj/Permohonan/Show';

// PP Pages
import PpDashboard from '../pages/Pp/Dashboard';
import PpPengajuanIndex from '../pages/Pp/Pengajuan/Index';
import PpPengajuanShow from '../pages/Pp/Pengajuan/Show';
import PpPengajuanReview from '../pages/Pp/Pengajuan/Review';
import PpNotifikasiIndex from '../pages/Pp/Notifikasi/Index';
import PpProfilIndex from '../pages/Pp/Profil/Index';

// PPK Pages
import PpkDashboard from '../pages/Ppk/Dashboard';
import PpkPengajuanIndex from '../pages/Ppk/Pengajuan/Index';
import PpkPengajuanShow from '../pages/Ppk/Pengajuan/Show';
import PpkPengajuanReview from '../pages/Ppk/Pengajuan/Review';
import PpkPengajuanPembayaran from '../pages/Ppk/Pengajuan/Pembayaran';
import PpkNotifikasiIndex from '../pages/Ppk/Notifikasi/Index';
import PpkProfilIndex from '../pages/Ppk/Profil/Index';

// Perlengkapan & Keuangan Pages
import PerlengkapanDashboard from '../pages/Perlengkapan/Dashboard';
import KeuanganDashboard from '../pages/Keuangan/Dashboard';

// Error Pages
import Error403 from '../pages/Errors/403';
import Error404 from '../pages/Errors/404';
import Error419 from '../pages/Errors/419';
import Error429 from '../pages/Errors/429';
import Error500 from '../pages/Errors/500';
import Error503 from '../pages/Errors/503';

export { ProtectedRoute } from './ProtectedRoute';
export { RoleRoute } from './RoleRoute';

export interface GuestRouteProps {
  children?: ReactNode;
}

/**
 * Route wrapper that redirects authenticated users to their role-specific dashboard.
 */
export const GuestRoute: FC<GuestRouteProps> = ({ children }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={getRoleDashboardPath(role)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export interface PlaceholderPageProps {
  title: string;
  role?: string;
  description?: string;
}

export const PlaceholderPage: FC<PlaceholderPageProps> = ({
  title,
  role,
  description = 'Halaman ini sedang dalam proses migrasi komponen.',
}) => {
  const { user, role: userRole, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 max-w-lg w-full text-center">
        {role && (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-3">
            Role: {role}
          </span>
        )}
        <h1 className="text-xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-sm text-slate-500 mb-6">{description}</p>
        {user && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 mb-6 text-left">
            <p>
              <strong>Pengguna:</strong> {user.nama} ({user.email})
            </p>
            <p>
              <strong>Role Aktif:</strong> {userRole || 'Tanpa Role'}
            </p>
          </div>
        )}
        <div className="flex items-center justify-center gap-3">
          <Link
            to={getRoleDashboardPath(userRole)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            Ke Dashboard
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
          >
            Keluar (Logout)
          </button>
        </div>
        <div className="text-xs text-slate-400 border-t border-slate-100 pt-4 mt-6">
          SIPBAJA Monorepo • React Router
        </div>
      </div>
    </div>
  );
};

export const LoginPage = Login;
export const NotFoundPage = Error404;

export const AppRoutes: FC = () => {
  return (
    <Routes>
      {/* Guest / Public Route: / redirects to dashboard if authenticated */}
      <Route element={<GuestRoute />}>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected Routes: requires authenticated user */}
      <Route element={<ProtectedRoute />}>
        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['Admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/pengguna" element={<PenggunaIndex />} />
          <Route path="/admin/unit-kerja" element={<UnitKerjaIndex />} />
          <Route path="/admin/mak" element={<MakIndex />} />
          <Route path="/admin/role" element={<RoleIndex />} />
          <Route path="/admin/role-permission" element={<RolePermissionIndex />} />
        </Route>

        {/* Pemohon Routes */}
        <Route element={<RoleRoute allowedRoles={['Pemohon']} />}>
          <Route path="/pemohon/dashboard" element={<PemohonDashboard />} />
          <Route path="/pemohon/permohonan" element={<PemohonPermohonanIndex />} />
          <Route path="/pemohon/permohonan/create" element={<PemohonPermohonanCreate />} />
        </Route>

        {/* Perencanaan Routes */}
        <Route element={<RoleRoute allowedRoles={['Perencanaan']} />}>
          <Route path="/perencanaan/dashboard" element={<PerencanaanDashboard />} />
          <Route path="/perencanaan/pengajuan" element={<PerencanaanPengajuanIndex />} />
          <Route path="/perencanaan/pengajuan/:id" element={<PerencanaanPengajuanShow />} />
          <Route path="/perencanaan/jenis-mak" element={<PerencanaanJenisMakIndex />} />
          <Route path="/perencanaan/rkakl" element={<PerencanaanRkaklIndex />} />
          <Route path="/perencanaan/notifikasi" element={<PerencanaanNotifikasiIndex />} />
          <Route path="/perencanaan/profil" element={<PerencanaanProfilIndex />} />
        </Route>

        {/* Bidang 2 Routes */}
        <Route element={<RoleRoute allowedRoles={['Bidang 2', 'bidang-2']} />}>
          <Route path="/bidang-2/dashboard" element={<Bidang2Dashboard />} />
          <Route path="/bidang-2/pengajuan" element={<Bidang2PengajuanIndex />} />
          <Route path="/bidang-2/rkakl" element={<Bidang2RkaklIndex />} />
        </Route>

        {/* PPBJ Routes */}
        <Route element={<RoleRoute allowedRoles={['PPBJ']} />}>
          <Route path="/ppbj/dashboard" element={<PpbjDashboard />} />
          <Route path="/ppbj/permohonan" element={<PpbjPermohonanIndex />} />
          <Route path="/ppbj/permohonan/:id" element={<PpbjPermohonanShow />} />
        </Route>

        {/* PP Routes */}
        <Route element={<RoleRoute allowedRoles={['PP']} />}>
          <Route path="/pp/dashboard" element={<PpDashboard />} />
          <Route path="/pp/pengajuan" element={<PpPengajuanIndex />} />
          <Route path="/pp/pengajuan/:id" element={<PpPengajuanShow />} />
          <Route path="/pp/pengajuan/:id/review" element={<PpPengajuanReview />} />
          <Route path="/pp/notifikasi" element={<PpNotifikasiIndex />} />
          <Route path="/pp/profil" element={<PpProfilIndex />} />
        </Route>

        {/* PPK Routes */}
        <Route element={<RoleRoute allowedRoles={['PPK']} />}>
          <Route path="/ppk/dashboard" element={<PpkDashboard />} />
          <Route path="/ppk/pengajuan" element={<PpkPengajuanIndex />} />
          <Route path="/ppk/pengajuan/:id" element={<PpkPengajuanShow />} />
          <Route path="/ppk/pengajuan/:id/review" element={<PpkPengajuanReview />} />
          <Route path="/ppk/pengajuan/:id/pembayaran" element={<PpkPengajuanPembayaran />} />
          <Route path="/ppk/notifikasi" element={<PpkNotifikasiIndex />} />
          <Route path="/ppk/profil" element={<PpkProfilIndex />} />
        </Route>

        {/* Perlengkapan Routes */}
        <Route element={<RoleRoute allowedRoles={['Perlengkapan']} />}>
          <Route path="/perlengkapan/dashboard" element={<PerlengkapanDashboard />} />
        </Route>

        {/* Keuangan Routes */}
        <Route element={<RoleRoute allowedRoles={['Keuangan']} />}>
          <Route path="/keuangan/dashboard" element={<KeuanganDashboard />} />
        </Route>
      </Route>

      {/* Explicit Error Pages */}
      <Route path="/errors/403" element={<Error403 />} />
      <Route path="/errors/404" element={<Error404 />} />
      <Route path="/errors/419" element={<Error419 />} />
      <Route path="/errors/429" element={<Error429 />} />
      <Route path="/errors/500" element={<Error500 />} />
      <Route path="/errors/503" element={<Error503 />} />

      {/* 404 Catch-All */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default AppRoutes;
