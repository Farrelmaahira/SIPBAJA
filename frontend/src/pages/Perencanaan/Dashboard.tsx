import { useState, useEffect, useMemo, type FC } from 'react';
import perencanaanService from '../../services/perencanaanService';
import PerencanaanDashboardTemplate from '../../components/templates/Perencanaan/PerencanaanDashboardTemplate';
import type {
  PerencanaanDashboardStats,
  PermohonanTerbaruItem,
  StatistikBulananItem,
  StatistikTahunanItem,
} from '../../types/perencanaan';
import type { NotificationItem } from '../../types/notification';
import type { ChartDatum } from '../../components/organisms/StatistikChart';
import { namaBulan } from '../../utils/formatPermohonan';

export type { PerencanaanDashboardStats, PermohonanTerbaruItem };

export const PerencanaanDashboard: FC = () => {
  const [stats, setStats] = useState<PerencanaanDashboardStats | undefined>(undefined);
  const [permohonanTerbaru, setPermohonanTerbaru] = useState<PermohonanTerbaruItem[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [statistikBulanan, setStatistikBulanan] = useState<StatistikBulananItem[]>([]);
  const [statistikTahunan, setStatistikTahunan] = useState<StatistikTahunanItem[]>([]);
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
        if (res.statistikBulanan) setStatistikBulanan(res.statistikBulanan);
        if (res.statistikTahunan) setStatistikTahunan(res.statistikTahunan);
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

  const chartData = useMemo<ChartDatum[] | undefined>(() => {
    if (viewMode === 'tahun') {
      if (!statistikTahunan || statistikTahunan.length === 0) return undefined;
      return statistikTahunan.map((item) => ({
        bulan: item.tahun,
        label: String(item.tahun),
        disetujui: item.disetujui,
        ditolak: item.ditolak,
      }));
    }
    if (!statistikBulanan || statistikBulanan.length === 0) return undefined;
    return statistikBulanan.map((item) => ({
      bulan: item.bulan,
      label: namaBulan(item.bulan),
      disetujui: item.disetujui,
      ditolak: item.ditolak,
    }));
  }, [viewMode, statistikBulanan, statistikTahunan]);

  return (
    <PerencanaanDashboardTemplate
      stats={stats}
      permohonanTerbaru={permohonanTerbaru}
      chartData={chartData}
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
