import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Hourglass, CheckCircle2, XCircle } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatCard from '../../molecules/StatCard';
import StatistikChart, { type ChartDatum } from '../../organisms/StatistikChart';
import PerencanaanPermohonanTerbaruTable from '../../organisms/PerencanaanPermohonanTerbaruTable';
import type {
  PerencanaanDashboardStats,
  PermohonanTerbaruItem,
} from '../../../types/perencanaan';
import type { NotificationItem } from '../../../types/notification';
import { PERENCANAAN_NAV_ITEMS } from '@/constants/perencanaanNav';

export interface PerencanaanDashboardTemplateProps {
  stats?: PerencanaanDashboardStats;
  permohonanTerbaru: PermohonanTerbaruItem[];
  chartData?: ChartDatum[];
  isLoading?: boolean;
  errorMessage?: string;
  viewMode: 'bulan' | 'tahun';
  onViewModeChange: (mode: 'bulan' | 'tahun') => void;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export const PerencanaanDashboardTemplate: FC<PerencanaanDashboardTemplateProps> = ({
  stats,
  permohonanTerbaru,
  chartData,
  isLoading = false,
  errorMessage = '',
  viewMode,
  onViewModeChange,
  recentNotifications,
  unreadNotificationsCount,
}) => {
  const navigate = useNavigate();

  return (
    <AppLayout
      activeRoute="dashboard"
      navItems={PERENCANAAN_NAV_ITEMS}
      roleInitials="PR"
      roleTitle="Perencanaan"
      roleSubtitle="Unit Perencanaan"
      profileHref="/perencanaan/profil"
      notifikasiHref="/perencanaan/notifikasi"
      readAllHref="/perencanaan/notifikasi/read-all"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      flash={errorMessage ? { error: errorMessage } : undefined}
    >
      <div className="space-y-6">
        {/* Hero Welcome Banner */}
        <HeroBanner
          eyebrow="DASHBOARD PERENCANAAN"
          title="Selamat datang, Tim Perencanaan"
          description="Pantau permohonan pengadaan yang masuk, serta kelola Jenis MAK dan Dokumen RKAKL."
          ctaLabel="Lihat Permohonan"
          ctaIcon={FileText}
          onCta={() => navigate('/perencanaan/permohonan')}
        />

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total Permohonan"
            value={isLoading ? '-' : (stats?.total ?? 0)}
            iconBg="bg-[#E4F6EC]"
            iconColor="text-[#0E7C5A]"
            badge={{
              label: stats?.tambahan_bulan_ini ? `+${stats.tambahan_bulan_ini} bulan ini` : 'Bulan ini',
              variant: 'success',
            }}
          />
          <StatCard
            icon={Hourglass}
            label="Diajukan"
            value={isLoading ? '-' : (stats?.diajukan ?? 0)}
            iconBg="bg-[#E8F0FF]"
            iconColor="text-[#2F68D6]"
            badge={{ label: 'Dalam antrean', variant: 'info' }}
          />
          <StatCard
            icon={CheckCircle2}
            label="Selesai"
            value={isLoading ? '-' : (stats?.selesai ?? 0)}
            iconBg="bg-[#E4F6EC]"
            iconColor="text-[#0E7C5A]"
            badge={{
              label: stats?.selesai_bulan_ini ? `+${stats.selesai_bulan_ini} bulan ini` : 'Selesai diproses',
              variant: 'success',
            }}
          />
          <StatCard
            icon={XCircle}
            label="Ditolak"
            value={isLoading ? '-' : (stats?.ditolak ?? 0)}
            iconBg="bg-[#FDECEC]"
            iconColor="text-[#E5484D]"
            badge={{ label: 'Perlu revisi', variant: 'danger' }}
          />
        </div>

        {/* Statistik Chart Card */}
        <StatistikChart
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          chartData={chartData}
          totalDisetujui={stats?.selesai ?? 0}
          totalDitolak={stats?.ditolak ?? 0}
          isLoading={isLoading}
        />

        {/* Table Organism: Permohonan Masuk Terbaru */}
        <PerencanaanPermohonanTerbaruTable
          items={permohonanTerbaru}
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
};

export default PerencanaanDashboardTemplate;
