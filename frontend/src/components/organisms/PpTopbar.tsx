import { useState, useRef, useEffect, type FC, type ReactNode } from 'react';
import { Menu, Bell, ChevronDown, User as UserIcon, LogOut, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationDropdown, { type NotificationItem } from './NotificationDropdown';
import LogoutModal from './LogoutModal';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}

export interface PpTopbarUser {
  nama?: string;
  name?: string;
  role?: string | { nama?: string };
  email?: string;
  [key: string]: unknown;
}

export interface PpTopbarProps {
  onMenuClick?: () => void;
  user?: PpTopbarUser | null;
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

export const PpTopbar: FC<PpTopbarProps> = ({
  onMenuClick,
  user,
  notifications = [],
  unreadCount = 0,
  breadcrumb = null,
  roleInitials = 'PP',
  roleTitle = null,
  roleSubtitle = null,
  profileHref = '/pp/profil',
  notifikasiHref = '/pp/notifikasi',
  readAllHref = '/pp/notifikasi/read-all',
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

  const rawRole = typeof user?.role === 'string' ? user.role : user?.role?.nama;
  const displayName =
    roleTitle ||
    (rawRole === 'PP'
      ? 'PP'
      : rawRole === 'Perencanaan'
      ? 'Perencanaan'
      : rawRole === 'PPK'
      ? 'PPK'
      : user?.nama || 'PP');
  const displayRole =
    roleSubtitle ||
    (rawRole === 'PP'
      ? 'Pejabat Pengadaan'
      : rawRole === 'Perencanaan'
      ? 'Unit Perencanaan'
      : rawRole === 'PPK'
      ? 'Unit PPK'
      : 'Pejabat Pengadaan');

  return (
    <>
      <header className="flex items-center justify-between gap-4 pb-5">
        {/* Left: mobile menu toggle + optional breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#EEF5F2]"
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
              notifikasiHref={notifikasiHref}
              readAllHref={readAllHref}
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
                {roleInitials}
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

            {/* Modal Profil Popover */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-[24px] bg-white border border-[#E4EBE8] shadow-[0_16px_40px_rgba(13,51,38,0.14)] py-2 z-50 animate-scale-up">
                <div className="flex items-center gap-3.5 px-4 py-3.5 border-b border-[#F0F4F2]">
                  <div className="w-11 h-11 rounded-full bg-[#0E7C5A] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {roleInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#14201C] truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-[#8A9A95] truncate mt-0.5">
                      {displayRole}
                    </p>
                  </div>
                </div>

                <div className="py-1 border-b border-[#F0F4F2]">
                  <Link
                    to={profileHref}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-[#5F6F6A] hover:text-[#14201C] hover:bg-[#F4F7F5] transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-[#5F6F6A]" />
                    <span>Profil Saya</span>
                  </Link>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setLogoutOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-[#D92D20] hover:bg-[#FEE4E2]/50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-[#D92D20]" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
      />
    </>
  );
};

export default PpTopbar;
