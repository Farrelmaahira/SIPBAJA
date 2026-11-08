import { useState, useRef, useEffect, type FC, type ReactNode } from 'react';
import { Menu, Bell, ChevronDown, User as UserIcon, LogOut, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import LogoutModal from './LogoutModal';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import type { NotificationItem } from '../../types/notification';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}

export interface AppTopbarUser {
  nama?: string;
  name?: string;
  role?: string | { nama?: string };
  email?: string;
  [key: string]: unknown;
}

export interface AppTopbarProps {
  onMenuClick?: () => void;
  user?: AppTopbarUser | null;
  notifications?: NotificationItem[];
  unreadCount?: number;
  breadcrumb?: BreadcrumbItem[] | null;
  roleInitials?: string;
  roleTitle?: string | null;
  roleSubtitle?: string | null;
  profileHref?: string;
  notifikasiHref?: string;
  readAllHref?: string;
}

interface RoleConfig {
  initials: string;
  title: string;
  subtitle: string;
  basePath: string;
}

function resolveRoleConfig(roleName?: string): RoleConfig {
  const normalized = (roleName || '').toLowerCase().trim();

  if (normalized.includes('perencanaan')) {
    return {
      initials: 'PR',
      title: 'Perencanaan',
      subtitle: 'Unit Perencanaan',
      basePath: '/perencanaan',
    };
  }
  if (normalized.includes('ppk')) {
    return {
      initials: 'PPK',
      title: 'PPK',
      subtitle: 'Pejabat Pembuat Komitmen',
      basePath: '/ppk',
    };
  }
  if (normalized.includes('pengadaan') || normalized === 'pp') {
    return {
      initials: 'PP',
      title: 'PP',
      subtitle: 'Pejabat Pengadaan',
      basePath: '/pp',
    };
  }
  if (normalized.includes('pemohon') || normalized.includes('jurusan') || normalized.includes('bagian')) {
    return {
      initials: 'PM',
      title: 'Pemohon',
      subtitle: 'Unit Pemohon',
      basePath: '/pemohon',
    };
  }
  if (normalized.includes('bidang') || normalized.includes('wadir') || normalized.includes('b2')) {
    return {
      initials: 'B2',
      title: 'Bidang 2',
      subtitle: 'Wakil Direktur Bidang 2',
      basePath: '/bidang-2',
    };
  }

  return {
    initials: 'US',
    title: 'Pengguna',
    subtitle: 'Sistem SIPBAJA',
    basePath: '/dashboard',
  };
}

export const AppTopbar: FC<AppTopbarProps> = ({
  onMenuClick,
  user,
  notifications: propNotifications,
  unreadCount: propUnreadCount,
  breadcrumb = null,
  roleInitials,
  roleTitle = null,
  roleSubtitle = null,
  profileHref,
  notifikasiHref,
  readAllHref,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const auth = useAuth();
  const { recentNotifications, unreadCount: contextUnreadCount } = useNotifications();

  const unreadCount = propUnreadCount !== undefined ? propUnreadCount : contextUnreadCount;
  const notifications =
    propNotifications && propNotifications.length > 0 ? propNotifications : recentNotifications;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const effectiveUser = user || (auth.user as AppTopbarUser | null);
  const rawRole =
    auth.role ||
    (typeof effectiveUser?.role === 'string'
      ? effectiveUser.role
      : effectiveUser?.role?.nama) ||
    '';

  const defaultConfig = resolveRoleConfig(rawRole);

  const effectiveInitials =
    roleInitials ||
    (effectiveUser?.nama
      ? effectiveUser.nama
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
      : defaultConfig.initials);

  const displayName = roleTitle || effectiveUser?.nama || defaultConfig.title;
  const displayRole = roleSubtitle || defaultConfig.subtitle;

  const effectiveProfileHref = profileHref || `${defaultConfig.basePath}/profil`;
  const effectiveNotifikasiHref = notifikasiHref || `${defaultConfig.basePath}/notifikasi`;
  const effectiveReadAllHref = readAllHref || `${defaultConfig.basePath}/notifikasi/read-all`;

  return (
    <>
      <header className="flex items-center justify-between gap-4 pb-5">
        {/* Left: mobile menu toggle + optional breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#EEF5F2] cursor-pointer"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          {breadcrumb && breadcrumb.length > 0 && (
            <nav
              className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase truncate"
              aria-label="Breadcrumb"
            >
              {breadcrumb.map((item, idx) => {
                const isLast = idx === breadcrumb.length - 1;
                return (
                  <span key={idx} className="inline-flex items-center gap-2">
                    {idx > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 text-[#8A9A95] shrink-0" />
                    )}
                    {item.href && !isLast ? (
                      <Link
                        to={item.href}
                        className="text-[#8A9A95] hover:text-[#0E7C5A] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className={isLast ? 'text-[#14201C]' : 'text-[#8A9A95]'}>
                        {item.label}
                      </span>
                    )}
                  </span>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3.5 ml-auto shrink-0">
          {/* Bell Notification */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#EEF5F2] hover:text-[#14201C] transition-colors cursor-pointer shadow-2xs"
              aria-label="Buka notifikasi"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E5484D] ring-2 ring-white" />
              )}
            </button>

            <NotificationDropdown
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
              notifications={notifications}
              unreadCount={unreadCount}
              notifikasiHref={effectiveNotifikasiHref}
              readAllHref={effectiveReadAllHref}
            />
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 py-1 px-1.5 rounded-full hover:bg-white/60 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#0E7C5A] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {effectiveInitials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#14201C] leading-tight">
                  {displayName}
                </p>
                <p className="text-[11px] text-[#8A9A95] leading-tight mt-0.5">
                  {displayRole}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8A9A95] ml-0.5" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-48 rounded-2xl bg-white border border-[#E4EBE8] shadow-lg py-1.5 z-50 animate-scale-up">
                <Link
                  to={effectiveProfileHref}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#14201C] hover:bg-[#F4F7F5] transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-[#8A9A95]" />
                  Profil Saya
                </Link>
                <div className="my-1 border-t border-[#F0F4F2]" />
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    setLogoutOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#D92D20] hover:bg-[#FEE4E2]/40 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-[#D92D20]" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutModal isOpen={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </>
  );
};

export default AppTopbar;

