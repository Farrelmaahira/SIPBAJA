import { useState, useEffect, type FC } from 'react';
import { LayoutGrid, FileText, Tag, FileSpreadsheet } from 'lucide-react';
import perencanaanService from '../../services/perencanaanService';
import PerencanaanDashboardTemplate from '../../components/templates/PerencanaanDashboardTemplate';
import type {
  PerencanaanDashboardStats,
  PermohonanTerbaruItem,
} from '../../types/perencanaan';
import type { NotificationItem } from '../../types/notification';

export const PERENCANAAN_NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
    href: '/perencanaan/dashboard',
    badge: null,
  },
  {
    key: 'pengajuan',
    label: 'List Pengajuan',
    icon: FileText,
    href: '/perencanaan/pengajuan',
    badge: null,
  },
  {
    key: 'mak',
    label: 'Jenis MAK',
    icon: Tag,
    href: '/perencanaan/jenis-mak',
    badge: null,
  },
  {
    key: 'rkakl',
    label: 'Dokumen RKAKL',
    icon: FileSpreadsheet,
    href: '/perencanaan/rkakl',
    badge: null,
  },
];

export type { PerencanaanDashboardStats, PermohonanTerbaruItem };

export const PerencanaanDashboard: FC = () => {
  const [stats, setStats] = useState<PerencanaanDashboardStats | undefined>(undefined);
  const [permohonanTerbaru, setPermohonanTerbaru] = useState<PermohonanTerbaruItem[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'bulan' | 'tahun'>('tahun');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);

    perencanaanService
      .getDashboardData(controller.signal)
      .then((res) => {
        if (!isMounted) return;
        if (res.stats) setStats(res.stats);
        if (res.permohonanTerbaru) setPermohonanTerbaru(res.permohonanTerbaru);
        if (res.recentNotifications) setRecentNotifications(res.recentNotifications);
        if (res.unreadNotificationsCount !== undefined) {
          setUnreadNotificationsCount(res.unreadNotificationsCount);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch Perencanaan dashboard:', err);
          setErrorMessage('Gagal memuat data dashboard Perencanaan.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <PerencanaanDashboardTemplate
      stats={stats}
      permohonanTerbaru={permohonanTerbaru}
      isLoading={isLoading}
      errorMessage={errorMessage}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadNotificationsCount}
    />
  );
};

export default PerencanaanDashboard;
