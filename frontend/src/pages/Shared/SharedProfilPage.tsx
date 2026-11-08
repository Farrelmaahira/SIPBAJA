import { useState, type FC } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppLayout, { type AppNavItem } from '../../components/templates/AppLayout';
import UserProfileSection from '../../components/organisms/UserProfileSection';
import LogoutModal from '../../components/organisms/LogoutModal';
import { useAuth } from '../../hooks/useAuth';

export interface SharedProfilPageProps {
  user?: any;
  basePath?: string;
  roleInitials?: string;
  roleTitle?: string | null;
  roleSubtitle?: string | null;
  navItems?: AppNavItem[] | null;
  badgeLabel?: string;
}

export const SharedProfilPage: FC<SharedProfilPageProps> = ({
  user: initialUser,
  basePath: propBasePath,
  roleInitials,
  roleTitle,
  roleSubtitle,
  navItems,
  badgeLabel,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser, role: authRole, logout } = useAuth();

  // Auto-resolve basePath from current URL (e.g. /perencanaan, /ppk, /pp)
  const segments = location.pathname.split('/').filter(Boolean);
  const derivedBasePath = segments.length > 0 ? `/${segments[0]}` : '/dashboard';
  const basePath = propBasePath || derivedBasePath;

  const [logoutOpen, setLogoutOpen] = useState(false);

  const effectiveUser = initialUser || authUser;

  const handleConfirmLogout = async () => {
    setLogoutOpen(false);
    await logout();
    navigate('/');
  };

  const resolvedBadge =
    badgeLabel ||
    (typeof effectiveUser?.role === 'string'
      ? effectiveUser.role
      : effectiveUser?.role?.nama) ||
    authRole ||
    'Pengguna SIPBAJA';

  return (
    <AppLayout
      activeRoute="dashboard"
      roleInitials={roleInitials}
      roleTitle={roleTitle}
      roleSubtitle={roleSubtitle}
      navItems={navItems}
      basePath={basePath}
      profileHref={`${basePath}/profil`}
      notifikasiHref={`${basePath}/notifikasi`}
      readAllHref={`${basePath}/notifikasi/read-all`}
    >
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
              AKUN PENGGUNA
            </span>
            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
              Profil Saya
            </h1>
            <p className="text-xs sm:text-sm text-white/85 mt-1.5">
              Lihat informasi akun yang sedang Anda gunakan dalam sistem SIPBAJA.
            </p>
          </div>

          <Link
            to={`${basePath}/dashboard`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold transition-colors shrink-0 self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
        </div>

        <div
          className="absolute -right-10 -top-20 w-[280px] h-[280px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute right-28 -bottom-20 w-[190px] h-[190px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Reusable Profile Organism */}
      <UserProfileSection
        user={effectiveUser}
        roleInitials={roleInitials}
        roleTitle={roleTitle}
        roleSubtitle={roleSubtitle}
        badgeLabel={resolvedBadge}
        onLogoutClick={() => setLogoutOpen(true)}
        isLoading={!effectiveUser}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </AppLayout>
  );
};

export default SharedProfilPage;

