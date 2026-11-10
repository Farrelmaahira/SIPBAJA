import { useState, useEffect, type FC } from 'react';
import ppService from '../../services/ppService';
import PpDashboardTemplate from '../../components/templates/PpDashboardTemplate';
import type {
  PpDashboardStats,
  PpChartData,
  PpPengadaanItem,
} from '../../types/pp';
import type { NotificationItem } from '../../types/notification';

export type { PpDashboardStats, PpPengadaanItem as PengadaanReviewItem };

export const PpDashboard: FC = () => {
  const [stats, setStats] = useState<PpDashboardStats>({});
  const [chart, setChart] = useState<PpChartData | undefined>(undefined);
  const [pengadaanPerluReview, setPengadaanPerluReview] = useState<PpPengadaanItem[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'bulan' | 'tahun'>('tahun');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage('');

    ppService
      .getDashboardData(controller.signal)
      .then((res) => {
        if (!isMounted) return;
        if (res.stats) setStats(res.stats);
        if (res.chart) setChart(res.chart);
        const reviewItems = res.pengadaanPerluReview || res.pengadaan_perlu_review;
        if (reviewItems) setPengadaanPerluReview(reviewItems);
        if (res.recentNotifications) setRecentNotifications(res.recentNotifications);
        if (res.unreadNotificationsCount !== undefined) {
          setUnreadNotificationsCount(res.unreadNotificationsCount);
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch PP dashboard data:', err);
          setErrorMessage('Gagal memuat data dashboard PP.');
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
    <PpDashboardTemplate
      stats={stats}
      chart={chart}
      pengadaanPerluReview={pengadaanPerluReview}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadNotificationsCount}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  );
};

export default PpDashboard;
