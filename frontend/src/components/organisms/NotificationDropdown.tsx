import { useState, useEffect, type FC } from 'react';
import { Link } from 'react-router-dom';
import { CheckCheck, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

export interface NotificationItem {
  id: number | string;
  judul?: string;
  pesan?: string;
  waktu?: string;
  read_at?: string | null;
  created_at?: string;
  [key: string]: unknown;
}

export interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  unreadCount?: number;
  notifikasiHref?: string;
  readAllHref?: string;
  onMarkAllRead?: () => void;
}

export const NotificationDropdown: FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  notifikasiHref = '/notifikasi',
  onMarkAllRead,
}) => {
  const [tab, setTab] = useState<'semua' | 'pengingat' | 'status'>('semua');
  const [items, setItems] = useState<NotificationItem[]>(notifications);
  const [currentUnreadCount, setCurrentUnreadCount] = useState<number>(unreadCount);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNotificationsFromApi = async (selectedTab = tab) => {
    setIsLoading(true);
    try {
      if (selectedTab === 'semua') {
        const res = await api.get<{
          recentNotifications?: NotificationItem[];
          unreadNotificationsCount?: number;
          unreadCount?: number;
        }>('/v1/notifications/summary');

        if (res.data.recentNotifications) {
          setItems(res.data.recentNotifications);
        }
        const unread = res.data.unreadNotificationsCount ?? res.data.unreadCount;
        if (unread !== undefined) {
          setCurrentUnreadCount(unread);
        }
      } else {
        const res = await api.get<{
          notifications?: { data?: NotificationItem[] };
          unreadCount?: number;
          unreadNotificationsCount?: number;
        }>('/v1/notifications', {
          params: { tab: selectedTab, per_page: 5 },
        });

        if (res.data.notifications?.data) {
          setItems(res.data.notifications.data);
        }
        const unread = res.data.unreadCount ?? res.data.unreadNotificationsCount;
        if (unread !== undefined) {
          setCurrentUnreadCount(unread);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data notifikasi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void fetchNotificationsFromApi(tab);
    }
  }, [isOpen, tab]);

  useEffect(() => {
    if (notifications.length > 0) {
      setItems(notifications);
    }
  }, [notifications]);

  useEffect(() => {
    if (unreadCount !== undefined) {
      setCurrentUnreadCount(unreadCount);
    }
  }, [unreadCount]);

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    try {
      await api.post('/v1/notifications/read-all');
      setItems((prev) => prev.map((item) => ({ ...item, read_at: new Date().toISOString() })));
      setCurrentUnreadCount(0);
      if (onMarkAllRead) {
        onMarkAllRead();
      }
    } catch (err) {
      console.error('Gagal menandai semua notifikasi telah dibaca:', err);
    }
  };

  const handleMarkOneRead = async (item: NotificationItem) => {
    if (!item.read_at && item.id) {
      try {
        await api.post(`/v1/notifications/${item.id}/read`);
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, read_at: new Date().toISOString() } : i))
        );
        setCurrentUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Gagal menandai notifikasi telah dibaca:', err);
      }
    }
  };

  const getIcon = (item: NotificationItem) => {
    const j = item.judul?.toLowerCase() || '';
    if (j.includes('pengingat')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#FEF3DC] flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-[#9A5B00]" />
        </div>
      );
    }
    if (j.includes('ditolak') || j.includes('dikembalikan')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] flex items-center justify-center shrink-0">
          <XCircle className="w-5 h-5 text-[#D92D20]" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-[#DDF3E8] flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5 text-[#0E7C5A]" />
      </div>
    );
  };

  return (
    <div className="absolute right-0 top-12 w-96 rounded-[24px] bg-white border border-[#E4EBE8] shadow-[0_16px_40px_rgba(13,51,38,0.14)] z-50 overflow-hidden animate-scale-up">
      <div className="p-5 pb-3.5 border-b border-[#F0F4F2]">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-[17px] font-bold text-[#14201C] leading-tight">Notifikasi</h4>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              {currentUnreadCount} belum dibaca
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7C5A] hover:underline cursor-pointer mt-0.5"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Tandai semua dibaca</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => setTab('semua')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${tab === 'semua'
                ? 'bg-[#EAF6F1] text-[#0E7C5A] border-[#0E7C5A]'
                : 'bg-white text-[#5F6F6A] border-[#E4EBE8] hover:bg-[#F4F7F5]'
              }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setTab('pengingat')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${tab === 'pengingat'
                ? 'bg-[#EAF6F1] text-[#0E7C5A] border-[#0E7C5A]'
                : 'bg-white text-[#5F6F6A] border-[#E4EBE8] hover:bg-[#F4F7F5]'
              }`}
          >
            Pengingat
          </button>
          <button
            type="button"
            onClick={() => setTab('status')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${tab === 'status'
                ? 'bg-[#EAF6F1] text-[#0E7C5A] border-[#0E7C5A]'
                : 'bg-white text-[#5F6F6A] border-[#E4EBE8] hover:bg-[#F4F7F5]'
              }`}
          >
            Status
          </button>
        </div>
      </div>

      <div className="max-h-[380px] overflow-y-auto p-3 space-y-2">
        {isLoading && items.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8A9A95] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0E7C5A]" />
            <span>Memuat notifikasi...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8A9A95]">
            Tidak ada notifikasi pada kategori ini.
          </div>
        ) : (
          items.map((item) => {
            const isUnread = !item.read_at;
            return (
              <div
                key={item.id}
                onClick={() => void handleMarkOneRead(item)}
                className={`flex items-start gap-3.5 p-3.5 rounded-2xl transition-colors cursor-pointer ${isUnread ? 'bg-[#EAF6F1] hover:bg-[#DDF3E8]' : 'bg-white hover:bg-[#F8FAF9]'
                  }`}
              >
                {getIcon(item)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-[#14201C] leading-snug">
                      {item.judul}
                    </p>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#0E7C5A] mt-1 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#5F6F6A] mt-0.5 leading-relaxed">
                    {item.pesan}
                  </p>
                  <span className="text-[11px] text-[#8A9A95] mt-1.5 inline-block">
                    {item.waktu ||
                      (item.created_at
                        ? new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                        : 'Baru saja')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="py-3 px-4 border-t border-[#F0F4F2] text-center bg-white">
        <Link
          to={notifikasiHref}
          onClick={onClose}
          className="text-xs font-bold text-[#0E7C5A] hover:underline inline-block"
        >
          Lihat semua notifikasi
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
