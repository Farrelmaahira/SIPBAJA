import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import PpSidebar from '../organisms/PpSidebar';
import PpTopbar from '../organisms/PpTopbar';

export default function PpLayout({
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
}) {
    const { auth, recentNotifications, unreadNotificationsCount, flash } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    const effectiveNotifs = notifications.length > 0 ? notifications : (recentNotifications || []);
    const effectiveUnread = unreadCount || unreadNotificationsCount || 0;

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
                    user={auth?.user}
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
}
