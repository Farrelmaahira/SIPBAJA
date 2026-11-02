import { useEffect, useMemo, type FC, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import PpLayout, { type PpNavItem } from '../../../components/templates/PpLayout';
import { useNotifications } from '../../../hooks/useNotifications';
import type { NotificationItem } from '../../../types/notification';

export type { NotificationItem as PpNotificationItem };

export interface PpNotifikasiProps {
  notifications?: {
    data?: NotificationItem[];
    total?: number;
  };
  unreadCount?: number;
  activeTab?: string;
  basePath?: string;
  roleInitials?: string;
  roleTitle?: string | null;
  roleSubtitle?: string | null;
  navItems?: PpNavItem[] | null;
}

export const PpNotifikasiIndex: FC<PpNotifikasiProps> = ({
  basePath = '/pp',
  roleInitials = 'PP',
  roleTitle = null,
  roleSubtitle = null,
  navItems = null,
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

  const handleDelete = (e: MouseEvent, item: NotificationItem) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus notifikasi ini?')) {
      void deleteNotification(item.id);
    }
  };

  const getIcon = (item: NotificationItem) => {
    const j = item.judul?.toLowerCase() || '';
    if (j.includes('pengingat')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#FFF3D6] flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-[#92580A]" />
        </div>
      );
    }
    if (j.includes('ditolak') || j.includes('dikembalikan')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#FDE6E4] flex items-center justify-center shrink-0">
          <XCircle className="w-5 h-5 text-[#D92D20]" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-[#DDF3E6] flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5 text-[#0E7C5A]" />
      </div>
    );
  };

  // Group notifications into Hari Ini, Kemarin, and Sebelumnya
  const { hariIni, kemarin, sebelumnya } = useMemo(() => {
    const today: NotificationItem[] = [];
    const yesterday: NotificationItem[] = [];
    const earlier: NotificationItem[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;

    notifications.forEach((item) => {
      if (!item.created_at) {
        earlier.push(item);
        return;
      }
      const itemTime = new Date(item.created_at).getTime();
      if (itemTime >= startOfToday) {
        today.push(item);
      } else if (itemTime >= startOfYesterday) {
        yesterday.push(item);
      } else {
        earlier.push(item);
      }
    });

    return { hariIni: today, kemarin: yesterday, sebelumnya: earlier };
  }, [notifications]);

  const renderItem = (item: NotificationItem) => {
    const isUnread = !item.read_at;
    return (
      <div
        key={item.id}
        onClick={() => handleMarkOneRead(item)}
        className={`group flex items-start gap-3 p-3.5 rounded-xl transition-colors cursor-pointer ${
          isUnread
            ? 'bg-[#EBF7F1] hover:bg-[#DDF3E6]'
            : 'bg-white hover:bg-[#F5F8F6]'
        }`}
      >
        {getIcon(item)}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm leading-5 text-[#0E1B16] ${
                isUnread ? 'font-semibold' : 'font-medium'
              }`}
            >
              {item.judul}
            </p>
            <div className="flex items-center gap-2">
              {isUnread && (
                <span className="w-2 h-2 rounded-full bg-[#16825C] shrink-0" />
              )}
              <button
                type="button"
                onClick={(e) => handleDelete(e, item)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                title="Hapus notifikasi"
                aria-label="Hapus notifikasi"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-xs text-[#3F4E47] mt-0.5 leading-relaxed">
            {item.pesan}
          </p>
          <span className="text-xs text-[#6B7A73] mt-1.5 inline-block">
            {item.waktu ||
              item.waktu_relatif ||
              (item.created_at
                ? new Date(item.created_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Baru saja')}
          </span>
        </div>
      </div>
    );
  };

  return (
    <PpLayout
      activeRoute="dashboard"
      unreadCount={unreadCount}
      roleInitials={roleInitials}
      roleTitle={roleTitle}
      roleSubtitle={roleSubtitle}
      navItems={navItems}
      profileHref={basePath ? `${basePath}/profil` : '/profil'}
      notifikasiHref={basePath ? `${basePath}/notifikasi` : '/notifikasi'}
      readAllHref={basePath ? `${basePath}/notifikasi/read-all` : '/notifikasi/read-all'}
    >
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0A5C42] to-[#17A373] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/75 block mb-2">
              NOTIFIKASI
            </span>
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight leading-9">
              Semua Notifikasi
            </h1>
            <p className="text-sm text-white/85 mt-2">
              Pengingat waktu dan pembaruan status pengadaan Anda dalam satu tempat.
            </p>
          </div>

          <Link
            to={basePath ? `${basePath}/dashboard` : '/'}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-[14px] bg-white/16 hover:bg-white/25 border border-white/35 text-white text-sm font-semibold transition-colors shrink-0 self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
        </div>
        <div
          className="absolute -right-10 -top-24 w-[260px] h-[260px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute right-24 -bottom-20 w-[170px] h-[170px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Main Notification Card */}
      <div className="bg-white rounded-[20px] p-6 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTabChange('semua')}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer border ${
                activeTab === 'semua'
                  ? 'bg-[#EBF7F1] text-[#0F6A49] border-[#16825C] font-semibold'
                  : 'bg-white border-[#E3EAE6] text-[#3F4E47] font-medium hover:bg-[#F5F8F6]'
              }`}
            >
              Semua · {totalCount || notifications.length}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('pengingat')}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer border ${
                activeTab === 'pengingat'
                  ? 'bg-[#EBF7F1] text-[#0F6A49] border-[#16825C] font-semibold'
                  : 'bg-white border-[#E3EAE6] text-[#3F4E47] font-medium hover:bg-[#F5F8F6]'
              }`}
            >
              Pengingat
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('status')}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer border ${
                activeTab === 'status'
                  ? 'bg-[#EBF7F1] text-[#0F6A49] border-[#16825C] font-semibold'
                  : 'bg-white border-[#E3EAE6] text-[#3F4E47] font-medium hover:bg-[#F5F8F6]'
              }`}
            >
              Status
            </button>
          </div>

          <button
            type="button"
            onClick={() => void markAllAsRead()}
            className="px-5 py-3 rounded-xl bg-white border border-[#E3EAE6] shadow-2xs text-sm font-semibold text-[#0E1B16] hover:bg-[#F5F8F6] transition-colors cursor-pointer self-start sm:self-auto"
          >
            Tandai semua dibaca
          </button>
        </div>

        <div className="h-px bg-[#E3EAE6] w-full" />

        {isLoading && notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6B7A73] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0E7C5A]" />
            <span>Memuat notifikasi...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6B7A73]">
            Tidak ada notifikasi pada kategori ini.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {hariIni.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-[#6B7A73] uppercase tracking-[0.08em]">
                  HARI INI
                </p>
                <div className="flex flex-col gap-1">{hariIni.map(renderItem)}</div>
              </div>
            )}

            {kemarin.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-[#6B7A73] uppercase tracking-[0.08em]">
                  KEMARIN
                </p>
                <div className="flex flex-col gap-1">{kemarin.map(renderItem)}</div>
              </div>
            )}

            {sebelumnya.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-[#6B7A73] uppercase tracking-[0.08em]">
                  SEBELUMNYA
                </p>
                <div className="flex flex-col gap-1">{sebelumnya.map(renderItem)}</div>
              </div>
            )}

            {hariIni.length === 0 && kemarin.length === 0 && sebelumnya.length === 0 && (
              <div className="flex flex-col gap-1">{notifications.map(renderItem)}</div>
            )}
          </div>
        )}
      </div>
    </PpLayout>
  );
};

export default PpNotifikasiIndex;
