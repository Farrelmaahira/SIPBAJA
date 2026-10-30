import { useState, type FC, type ReactNode, type FormEvent } from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleDashboardPath } from '../utils/role';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

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

export const LoginPage: FC = () => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Gagal masuk. Periksa kembali username dan password Anda.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">SIPBAJA</h1>
          <p className="text-slate-600 text-sm mt-1">Sistem Informasi Pengadaan Barang dan Jasa</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username / Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan username atau email"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const NotFoundPage: FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 max-w-md w-full text-center">
        <h1 className="text-5xl font-black text-slate-900 mb-2">404</h1>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mb-6">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export const AppRoutes: FC = () => {
  return (
    <Routes>
      {/* Guest / Public Route: / redirects to dashboard if authenticated */}
      <Route element={<GuestRoute />}>
        <Route path="/" element={<LoginPage />} />
      </Route>

      {/* Protected Routes: requires authenticated user */}
      <Route element={<ProtectedRoute />}>
        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['Admin']} />}>
          <Route path="/admin/dashboard" element={<PlaceholderPage title="Admin Dashboard" role="Admin" />} />
          <Route path="/admin/pengguna" element={<PlaceholderPage title="Kelola Pengguna" role="Admin" />} />
          <Route path="/admin/unit-kerja" element={<PlaceholderPage title="Kelola Unit Kerja" role="Admin" />} />
          <Route path="/admin/mak" element={<PlaceholderPage title="Kelola MAK" role="Admin" />} />
          <Route path="/admin/role" element={<PlaceholderPage title="Kelola Role" role="Admin" />} />
          <Route path="/admin/role-permission" element={<PlaceholderPage title="Role & Permission" role="Admin" />} />
        </Route>

        {/* Pemohon Routes */}
        <Route element={<RoleRoute allowedRoles={['Pemohon']} />}>
          <Route path="/pemohon/dashboard" element={<PlaceholderPage title="Pemohon Dashboard" role="Pemohon" />} />
          <Route path="/pemohon/permohonan" element={<PlaceholderPage title="Daftar Permohonan" role="Pemohon" />} />
          <Route path="/pemohon/permohonan/create" element={<PlaceholderPage title="Buat Permohonan" role="Pemohon" />} />
        </Route>

        {/* Perencanaan Routes */}
        <Route element={<RoleRoute allowedRoles={['Perencanaan']} />}>
          <Route path="/perencanaan/dashboard" element={<PlaceholderPage title="Perencanaan Dashboard" role="Perencanaan" />} />
          <Route path="/perencanaan/pengajuan" element={<PlaceholderPage title="Daftar Pengajuan" role="Perencanaan" />} />
          <Route path="/perencanaan/pengajuan/:id" element={<PlaceholderPage title="Detail Pengajuan" role="Perencanaan" />} />
          <Route path="/perencanaan/jenis-mak" element={<PlaceholderPage title="Jenis MAK" role="Perencanaan" />} />
          <Route path="/perencanaan/rkakl" element={<PlaceholderPage title="RKAKL" role="Perencanaan" />} />
          <Route path="/perencanaan/notifikasi" element={<PlaceholderPage title="Notifikasi Perencanaan" role="Perencanaan" />} />
          <Route path="/perencanaan/profil" element={<PlaceholderPage title="Profil Perencanaan" role="Perencanaan" />} />
        </Route>

        {/* Bidang 2 Routes */}
        <Route element={<RoleRoute allowedRoles={['Bidang 2', 'bidang-2']} />}>
          <Route path="/bidang-2/dashboard" element={<PlaceholderPage title="Bidang 2 Dashboard" role="Bidang 2" />} />
          <Route path="/bidang-2/pengajuan" element={<PlaceholderPage title="Pengajuan Bidang 2" role="Bidang 2" />} />
          <Route path="/bidang-2/rkakl" element={<PlaceholderPage title="RKAKL Bidang 2" role="Bidang 2" />} />
        </Route>

        {/* PPBJ Routes */}
        <Route element={<RoleRoute allowedRoles={['PPBJ']} />}>
          <Route path="/ppbj/dashboard" element={<PlaceholderPage title="PPBJ Dashboard" role="PPBJ" />} />
          <Route path="/ppbj/permohonan" element={<PlaceholderPage title="Daftar Permohonan PPBJ" role="PPBJ" />} />
          <Route path="/ppbj/permohonan/:id" element={<PlaceholderPage title="Detail Permohonan PPBJ" role="PPBJ" />} />
        </Route>

        {/* PP Routes */}
        <Route element={<RoleRoute allowedRoles={['PP']} />}>
          <Route path="/pp/dashboard" element={<PlaceholderPage title="PP Dashboard" role="PP" />} />
          <Route path="/pp/pengajuan" element={<PlaceholderPage title="Daftar Pengajuan PP" role="PP" />} />
          <Route path="/pp/pengajuan/:id" element={<PlaceholderPage title="Detail Pengajuan PP" role="PP" />} />
          <Route path="/pp/pengajuan/:id/review" element={<PlaceholderPage title="Review Pengajuan PP" role="PP" />} />
          <Route path="/pp/notifikasi" element={<PlaceholderPage title="Notifikasi PP" role="PP" />} />
          <Route path="/pp/profil" element={<PlaceholderPage title="Profil PP" role="PP" />} />
        </Route>

        {/* PPK Routes */}
        <Route element={<RoleRoute allowedRoles={['PPK']} />}>
          <Route path="/ppk/dashboard" element={<PlaceholderPage title="PPK Dashboard" role="PPK" />} />
          <Route path="/ppk/pengajuan" element={<PlaceholderPage title="Daftar Pengajuan PPK" role="PPK" />} />
          <Route path="/ppk/pengajuan/:id" element={<PlaceholderPage title="Detail Pengajuan PPK" role="PPK" />} />
          <Route path="/ppk/pengajuan/:id/review" element={<PlaceholderPage title="Review Pengajuan PPK" role="PPK" />} />
          <Route path="/ppk/pengajuan/:id/pembayaran" element={<PlaceholderPage title="Pembayaran Pengajuan PPK" role="PPK" />} />
          <Route path="/ppk/notifikasi" element={<PlaceholderPage title="Notifikasi PPK" role="PPK" />} />
          <Route path="/ppk/profil" element={<PlaceholderPage title="Profil PPK" role="PPK" />} />
        </Route>

        {/* Perlengkapan Routes */}
        <Route element={<RoleRoute allowedRoles={['Perlengkapan']} />}>
          <Route path="/perlengkapan/dashboard" element={<PlaceholderPage title="Perlengkapan Dashboard" role="Perlengkapan" />} />
        </Route>

        {/* Keuangan Routes */}
        <Route element={<RoleRoute allowedRoles={['Keuangan']} />}>
          <Route path="/keuangan/dashboard" element={<PlaceholderPage title="Keuangan Dashboard" role="Keuangan" />} />
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
