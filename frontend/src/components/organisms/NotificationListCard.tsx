import { useMemo, type FC, type MouseEvent } from 'react';
import { Clock, CheckCircle2, XCircle, Loader2, Trash2, Bell } from 'lucide-react';
import type { NotificationItem } from '../../types/notification';

export interface NotificationListCardProps {
  notifications?: NotificationItem[];
  activeTab: string;
  totalCount?: number;
  unreadCount?: number;
  isLoading?: boolean;
  onTabChange: (tab: string) => void;
  onMarkAllAsRead: () => void;
  onMarkOneRead: (item: NotificationItem) => void;
  onDeleteNotification: (item: NotificationItem) => void;
}

export const NotificationListCard: FC<NotificationListCardProps> = ({
  notifications = [],
  activeTab,
  totalCount = 0,
  isLoading = false,
  onTabChange,
  onMarkAllAsRead,
  onMarkOneRead,
  onDeleteNotification,
}) => {
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
        <div className="w-10 h-10 rounded-xl bg-[#FDECEC] flex items-center justify-center shrink-0">
          <XCircle className="w-5 h-5 text-[#D92D20]" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] flex items-center justify-center shrink-0">
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
        onClick={() => onMarkOneRead(item)}
        className={`group flex items-start gap-3.5 p-4 rounded-xl border border-transparent transition-all cursor-pointer ${
          isUnread
            ? 'bg-[#F2F9F6] border-[#D1EADB] hover:bg-[#EAF6F1]'
            : 'bg-white hover:bg-[#F9FBFA] border-[#F0F4F2]'
        }`}
      >
        {getIcon(item)}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-xs sm:text-sm leading-5 text-[#14201C] ${
                isUnread ? 'font-bold' : 'font-medium'
              }`}
            >
              {item.judul}
            </p>
            <div className="flex items-center gap-2">
              {isUnread && (
                <span className="w-2 h-2 rounded-full bg-[#0E7C5A] shrink-0" />
              )}
              <button
                type="button"
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  onDeleteNotification(item);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[#8A9A95] hover:text-[#D92D20] hover:bg-[#FDECEC] transition-all cursor-pointer"
                title="Hapus notifikasi"
                aria-label="Hapus notifikasi"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-xs text-[#5F6F6A] mt-1 leading-relaxed">
            {item.pesan}
          </p>
          <span className="text-[11px] text-[#8A9A95] mt-1.5 inline-block">
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
    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F4F2]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onTabChange('semua')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer border ${
              activeTab === 'semua'
                ? 'bg-[#EAF6F1] text-[#0E7C5A] border-[#0E7C5A] font-bold'
                : 'bg-white border-[#E4EBE8] text-[#5F6F6A] font-medium hover:bg-[#F9FBFA]'
            }`}
          >
            Semua &bull; {totalCount || notifications.length}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('pengingat')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer border ${
              activeTab === 'pengingat'
                ? 'bg-[#EAF6F1] text-[#0E7C5A] border-[#0E7C5A] font-bold'
                : 'bg-white border-[#E4EBE8] text-[#5F6F6A] font-medium hover:bg-[#F9FBFA]'
            }`}
          >
            Pengingat
          </button>
          <button
            type="button"
            onClick={() => onTabChange('status')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer border ${
              activeTab === 'status'
                ? 'bg-[#EAF6F1] text-[#0E7C5A] border-[#0E7C5A] font-bold'
                : 'bg-white border-[#E4EBE8] text-[#5F6F6A] font-medium hover:bg-[#F9FBFA]'
            }`}
          >
            Status
          </button>
        </div>

        <button
          type="button"
          onClick={onMarkAllAsRead}
          className="px-4 py-2 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#14201C] hover:bg-[#F9FBFA] transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          Tandai semua dibaca
        </button>
      </div>

      {isLoading && notifications.length === 0 ? (
        <div className="py-16 text-center text-xs text-[#8A9A95] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#0E7C5A]" />
          <span>Memuat notifikasi...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center text-[#8A9A95]">
          <Bell className="w-8 h-8 mx-auto mb-2 text-[#C5D2CD]" />
          <p className="text-xs font-bold text-[#5F6F6A]">Tidak ada notifikasi pada kategori ini.</p>
          <p className="text-[11px] text-[#8A9A95] mt-0.5">Pembaruan berkas dan status akan tampil di sini.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {hariIni.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider">
                HARI INI
              </p>
              <div className="flex flex-col gap-2">{hariIni.map(renderItem)}</div>
            </div>
          )}

          {kemarin.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider">
                KEMARIN
              </p>
              <div className="flex flex-col gap-2">{kemarin.map(renderItem)}</div>
            </div>
          )}

          {sebelumnya.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider">
                SEBELUMNYA
              </p>
              <div className="flex flex-col gap-2">{sebelumnya.map(renderItem)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationListCard;

