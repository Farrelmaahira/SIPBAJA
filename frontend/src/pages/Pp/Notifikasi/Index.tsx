import { useState, useEffect, type FC } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import api from '../../../services/api';
import PpLayout, { type PpNavItem } from '../../../components/templates/PpLayout';

export interface PpNotificationItem {
  id: number;
  judul?: string;
  pesan?: string;
  read_at?: string | null;
  waktu_relatif?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface PpNotifikasiProps {
  notifications?: {
    data?: PpNotificationItem[];
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
  notifications: initialNotifications,
  unreadCount: initialUnreadCount = 0,
  activeTab: initialActiveTab = 'semua',
  basePath = '/pp',
  roleInitials = 'PP',
  roleTitle = null,
  roleSubtitle = null,
  navItems = null,
}) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [items, setItems] = useState<PpNotificationItem[]>(initialNotifications?.data || []);
  const [totalCount, setTotalCount] = useState<number>(initialNotifications?.total || 0);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);

  const fetchNotifications = async (tab = activeTab) => {
    try {
      const res = await api.get<{
        notifications?: {
          data?: PpNotificationItem[];
          total?: number;
        };
        unreadCount?: number;
        unreadNotificationsCount?: number;
      }>(`${basePath}/notifikasi`, {
        params: { tab },
      });

      const notifs = res.data.notifications;
      if (notifs?.data) {
        setItems(notifs.data);
        setTotalCount(notifs.total || notifs.data.length);
      }
      if (res.data.unreadCount !== undefined) {
        setUnreadCount(res.data.unreadCount);
      } else if (res.data.unreadNotificationsCount !== undefined) {
        setUnreadCount(res.data.unreadNotificationsCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications(activeTab);
  }, [basePath, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post(`${basePath}/notifikasi/read-all`);
      setItems((prev) => prev.map((item) => ({ ...item, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleMarkOneRead = async (item: PpNotificationItem) => {
    if (!item.read_at && item.id) {
      try {
        await api.post(`${basePath}/notifikasi/${item.id}/read`);
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, read_at: new Date().toISOString() } : i))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
  };

  const getIcon = (item: PpNotificationItem) => {
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

  const hariIni = items.slice(0, 2);
  const kemarin = items.slice(2, 5);
  const sebelumnya = items.slice(5);

  const renderItem = (item: PpNotificationItem) => {
    const isUnread = !item.read_at;
    return (
      <div
        key={item.id}
        onClick={() => handleMarkOneRead(item)}
        className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
          isUnread
            ? 'bg-[#EBF7F1] cursor-pointer hover:bg-[#DDF3E6]'
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
            {isUnread && (
              <span className="w-2 h-2 rounded-full bg-[#16825C] mt-1.5 shrink-0" />
            )}
          </div>
          <p className="text-xs text-[#3F4E47] mt-0.5 leading-4">
            {item.pesan}
          </p>
          <span className="text-xs text-[#6B7A73] mt-1 inline-block">
            {item.waktu_relatif ||
              (item.created_at
                ? new Date(item.created_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '2 jam lalu')}
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
      profileHref={`${basePath}/profil`}
      notifikasiHref={`${basePath}/notifikasi`}
      readAllHref={`${basePath}/notifikasi/read-all`}
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
            to={`${basePath}/dashboard`}
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
              Semua · {totalCount || items.length}
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
              Pengingat · 3
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
              Status · 5
            </button>
          </div>

          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-5 py-3 rounded-xl bg-white border border-[#E3EAE6] shadow-2xs text-sm font-semibold text-[#0E1B16] hover:bg-[#F5F8F6] transition-colors cursor-pointer self-start sm:self-auto"
          >
            Tandai semua dibaca
          </button>
        </div>

        <div className="h-px bg-[#E3EAE6] w-full" />

        {items.length === 0 ? (
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
          </div>
        )}
      </div>
    </PpLayout>
  );
};

export default PpNotifikasiIndex;
