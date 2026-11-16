import { useState, type FC } from 'react';
import usePpDashboard from '../../hooks/usePpDashboard';
import PpDashboardTemplate from '../../components/templates/PpDashboardTemplate';
import type {
  PpDashboardStats,
  PpChartData,
  PpPengadaanItem,
} from '../../types/pp';

export type { PpDashboardStats, PpPengadaanItem as PengadaanReviewItem };

export const PpDashboard: FC = () => {
  const { data, isLoading, error } = usePpDashboard();
  const [viewMode, setViewMode] = useState<'bulan' | 'tahun'>('tahun');

  const stats: PpDashboardStats = data?.stats || {};
  const chart: PpChartData | undefined = data?.chart;
  const pengadaanPerluReview: PpPengadaanItem[] =
    data?.pengadaanPerluReview || data?.pengadaan_perlu_review || [];

  return (
    <PpDashboardTemplate
      stats={stats}
      chart={chart}
      pengadaanPerluReview={pengadaanPerluReview}
      recentNotifications={data?.recentNotifications || []}
      unreadNotificationsCount={data?.unreadNotificationsCount || 0}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      isLoading={isLoading}
      errorMessage={error || ''}
    />
  );
};

export default PpDashboard;
