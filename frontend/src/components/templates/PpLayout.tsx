import { useState, type FC, type ReactNode } from 'react';
import PpSidebar, { type PpNavItem } from '../organisms/PpSidebar';
import PpTopbar, { type BreadcrumbItem, type PpTopbarUser } from '../organisms/PpTopbar';
import { useAuth } from '../../hooks/useAuth';
import type { NotificationItem } from '../organisms/NotificationDropdown';

export interface PpLayoutProps {
  children?: ReactNode;
  activeRoute?: string;
  notifications?: NotificationItem[];
  unreadCount?: number;
  breadcrumb?: BreadcrumbItem[] | null;
  pendingCount?: number;
  navItems?: PpNavItem[] | null;
  roleInitials?: string;
  roleTitle?: string | null;
  roleSubtitle?: string | null;
  profileHref?: string;
  notifikasiHref?: string;
  readAllHref?: string;
  flash?: {
    success?: string;
    error?: string;
  };
  user?: PpTopbarUser | null;
}

export const PpLayout: FC<PpLayoutProps> = ({
  children,
  activeRoute = 'dashboard',
  notifications = [],
  unreadCount = 0,
  breadcrumb = null,
  pendingCount = 4,
  navItems = null,
  roleInitials = 'PP',
  roleTitle = null,
  roleSubtitle = null,
  profileHref = '/pp/profil',
  notifikasiHref = '/pp/notifikasi',
  readAllHref = '/pp/notifikasi/read-all',
  flash,
  user,
}) => {
  const auth = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const effectiveUser = user || (auth.user as PpTopbarUser | null);
  const effectiveNotifs = notifications;
  const effectiveUnread = unreadCount;

  return (
    <div className="flex min-h-screen bg-[#F3F6F5] text-[#14201C] font-sans antialiased">
      {/* Sidebar */}
      <PpSidebar
        activeRoute={activeRoute}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pendingCount={pendingCount}
        navItems={navItems}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 px-4 sm:px-8 py-5 max-w-[1360px] mx-auto w-full">
        {/* Topbar */}
        <PpTopbar
          onMenuClick={() => setMobileOpen(true)}
          user={effectiveUser}
          notifications={effectiveNotifs}
          unreadCount={effectiveUnread}
          breadcrumb={breadcrumb}
          roleInitials={roleInitials}
          roleTitle={roleTitle}
          roleSubtitle={roleSubtitle}
          profileHref={profileHref}
          notifikasiHref={notifikasiHref}
          readAllHref={readAllHref}
        />

        {/* Flash Messages */}
        {flash?.success && (
          <div className="mb-5 p-4 rounded-2xl bg-[#E4F6EC] border border-[#C8E6C9] text-xs font-semibold text-[#0B7A4E] flex items-center justify-between">
            <span>{flash.success}</span>
          </div>
        )}
        {flash?.error && (
          <div className="mb-5 p-4 rounded-2xl bg-[#FDECEC] border border-[#FECDCA] text-xs font-semibold text-[#B42318] flex items-center justify-between">
            <span>{flash.error}</span>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default PpLayout;
