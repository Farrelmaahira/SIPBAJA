import { useState, type FC, type ReactNode } from 'react';
import AppSidebar, { type AppNavItem } from '../../organisms/AppSidebar';
import AppTopbar, { type BreadcrumbItem, type AppTopbarUser } from '../../organisms/AppTopbar';
import FlashMessage from '../../molecules/FlashMessage';
import { useAuth } from '../../../hooks/useAuth';
import type { NotificationItem } from '../../../types/notification';

export type { AppNavItem } from '../../organisms/AppSidebar';
export type { BreadcrumbItem, AppTopbarUser } from '../../organisms/AppTopbar';

export interface AppLayoutProps {
  children?: ReactNode;
  activeRoute?: string;
  notifications?: NotificationItem[];
  unreadCount?: number;
  breadcrumb?: BreadcrumbItem[] | null;
  pendingCount?: number;
  navItems?: AppNavItem[] | null;
  basePath?: string;
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
  user?: AppTopbarUser | null;
}

export const AppLayout: FC<AppLayoutProps> = ({
  children,
  activeRoute = 'dashboard',
  notifications,
  unreadCount,
  breadcrumb = null,
  pendingCount = 4,
  navItems = null,
  basePath,
  roleInitials,
  roleTitle = null,
  roleSubtitle = null,
  profileHref,
  notifikasiHref,
  readAllHref,
  flash,
  user,
}) => {
  const auth = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const effectiveUser = user || (auth.user as AppTopbarUser | null);

  const resolvedProfileHref = profileHref || (basePath ? `${basePath}/profil` : undefined);
  const resolvedNotifikasiHref = notifikasiHref || (basePath ? `${basePath}/notifikasi` : undefined);
  const resolvedReadAllHref = readAllHref || (basePath ? `${basePath}/notifikasi/read-all` : undefined);

  return (
    <div className="flex min-h-screen bg-[#F3F6F5] text-[#14201C] font-sans antialiased">
      {/* Sidebar */}
      <AppSidebar
        activeRoute={activeRoute}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pendingCount={pendingCount}
        navItems={navItems}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 px-4 sm:px-8 py-5 max-w-[1360px] mx-auto w-full">
        {/* Topbar */}
        <AppTopbar
          onMenuClick={() => setMobileOpen(true)}
          user={effectiveUser}
          notifications={notifications}
          unreadCount={unreadCount}
          breadcrumb={breadcrumb}
          roleInitials={roleInitials}
          roleTitle={roleTitle}
          roleSubtitle={roleSubtitle}
          profileHref={resolvedProfileHref}
          notifikasiHref={resolvedNotifikasiHref}
          readAllHref={resolvedReadAllHref}
        />

        {/* Flash Messages (Sejajar di bawah topbar, rata kanan dengan komponen) */}
        {(flash?.success || flash?.error) && (
          <div className="flex justify-end mb-4">
            {flash?.success && (
              <FlashMessage type="success" message={flash.success} duration={4000} />
            )}
            {flash?.error && (
              <FlashMessage type="error" message={flash.error} duration={5000} />
            )}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;

