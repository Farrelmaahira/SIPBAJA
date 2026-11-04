import { useEffect, type FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PpLayout from '../../../components/templates/PpLayout';
import NotificationListCard from '../../../components/organisms/NotificationListCard';
import { useNotifications } from '../../../hooks/useNotifications';
import type { NotificationItem } from '../../../types/notification';
import { PERENCANAAN_NAV_ITEMS } from '../Dashboard';

export interface PerencanaanNotifikasiProps {
  basePath?: string;
  roleInitials?: string;
  roleTitle?: string | null;
  roleSubtitle?: string | null;
}

export const PerencanaanNotifikasiIndex: FC<PerencanaanNotifikasiProps> = ({
  basePath = '/perencanaan',
  roleInitials = 'PR',
  roleTitle = 'Perencanaan',
  roleSubtitle = 'Unit Perencanaan',
}) => {
  const {
    notifications,
    unreadCount,
    totalCount,
    activeTab,
    setActiveTab,
    fetchList,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
  } = useNotifications();

  useEffect(() => {
    void fetchList(activeTab);
  }, [fetchList, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleMarkOneRead = (item: NotificationItem) => {
    if (!item.read_at && item.id) {
      void markAsRead(item.id);
    }
  };

  const handleDelete = (item: NotificationItem) => {
    if (confirm('Apakah Anda yakin ingin menghapus notifikasi ini?')) {
      void deleteNotification(item.id);
    }
  };

  return (
    <PpLayout
      activeRoute="dashboard"
      unreadCount={unreadCount}
      roleInitials={roleInitials}
      roleTitle={roleTitle}
      roleSubtitle={roleSubtitle}
      navItems={PERENCANAAN_NAV_ITEMS}
      profileHref={`${basePath}/profil`}
      notifikasiHref={`${basePath}/notifikasi`}
      readAllHref={`${basePath}/notifikasi/read-all`}
    >
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
              NOTIFIKASI
            </span>
            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
              Semua Notifikasi
            </h1>
            <p className="text-xs sm:text-sm text-white/85 mt-1.5">
              Pengingat waktu dan pembaruan status pengadaan Anda dalam satu tempat.
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

      {/* Reusable Notification Organism */}
      <NotificationListCard
        notifications={notifications}
        activeTab={activeTab}
        totalCount={totalCount}
        unreadCount={unreadCount}
        isLoading={isLoading}
        onTabChange={handleTabChange}
        onMarkAllAsRead={() => void markAllAsRead()}
        onMarkOneRead={handleMarkOneRead}
        onDeleteNotification={handleDelete}
      />
    </PpLayout>
  );
};

export default PerencanaanNotifikasiIndex;
