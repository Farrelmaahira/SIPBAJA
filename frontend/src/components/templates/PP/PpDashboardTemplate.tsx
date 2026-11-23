import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, XCircle, ArrowRight, Tag } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatCard from '../../molecules/StatCard';
import StatistikChart from '../../organisms/StatistikChart';
import PpPengajuanTable from '../../organisms/PpPengajuanTable';
import type {
  PpDashboardStats,
  PpChartData,
  PpPengadaanItem,
} from '../../../types/pp';
import type { NotificationItem } from '../../../types/notification';
import { PP_NAV_ITEMS } from '@/constants/ppNav';

export interface PpDashboardTemplateProps {
  stats?: PpDashboardStats;
  chart?: PpChartData;
  pengadaanPerluReview: PpPengadaanItem[];
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
  viewMode: 'bulan' | 'tahun';
  onViewModeChange: (mode: 'bulan' | 'tahun') => void;
  isLoading?: boolean;
  errorMessage?: string;
}

export const PpDashboardTemplate: FC<PpDashboardTemplateProps> = ({
  stats,
  chart,
  pengadaanPerluReview,
  recentNotifications = [],
  unreadNotificationsCount = 0,
  viewMode,
  onViewModeChange,
  isLoading = false,
  errorMessage = '',
}) => {
  const chartItems =
    chart?.data?.map((item) => ({
      bulan: item.bulan_angka ?? item.bulan ?? '',
      label: item.bulan,
      disetujui: item.disetujui,
      ditolak: item.ditolak,
    })) || [];

  return (
    <AppLayout
      activeRoute="dashboard"
      roleInitials="PP"
      roleTitle="Pejabat Pengadaan"
      roleSubtitle="Unit Layanan Pengadaan"
      profileHref="/pp/profil"
      notifikasiHref="/pp/notifikasi"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      pendingCount={stats?.menunggu ?? 0}
      navItems={PP_NAV_ITEMS}
      flash={errorMessage ? { error: errorMessage } : undefined}
    >
      <div className="space-y-6">
        {/* Hero Welcome Banner */}
        <HeroBanner
          eyebrow="DASHBOARD"
          title="Selamat datang, PP"
          description="Review pengadaan dengan nominal Rp50 - 200 juta dalam satu tempat."
        />

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total Permohonan"
            value={isLoading ? '-' : (stats?.total ?? 0)}
            iconBg="bg-[#E4F6EC]"
            iconColor="text-[#0E7C5A]"
          />
          <StatCard
            icon={Clock}
            label="Menunggu Review"
            value={isLoading ? '-' : (stats?.menunggu ?? 0)}
            iconBg="bg-[#E8F0FF]"
            iconColor="text-[#2F68D6]"
          />
          <StatCard
            icon={CheckCircle2}
            label="Disetujui"
            value={isLoading ? '-' : (stats?.disetujui ?? 0)}
            iconBg="bg-[#E4F6EC]"
            iconColor="text-[#0B7A4E]"
          />
          <StatCard
            icon={XCircle}
            label="Ditolak"
            value={isLoading ? '-' : (stats?.ditolak ?? 0)}
            iconBg="bg-[#FDECEC]"
            iconColor="text-[#D92D20]"
          />
        </div>

        {/* Chart Section */}
        <StatistikChart
          chartData={chartItems}
          tahunAktif={chart?.tahun || new Date().getFullYear()}
          totalDisetujui={chart?.total_disetujui ?? stats?.disetujui ?? 0}
          totalDitolak={chart?.total_ditolak ?? stats?.ditolak ?? 0}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          isLoading={isLoading}
        />

        {/* Table Card: Pengadaan Perlu Review */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
            <div>
              <h3 className="text-base font-bold text-[#14201C]">Pengadaan Perlu Review</h3>
              <p className="text-xs text-[#8A9A95] mt-0.5">
                {pengadaanPerluReview.length} pengadaan bernilai Rp50 - 200 juta
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5EF] text-[#0E7C5A]">
                <Tag className="w-3.5 h-3.5" />
                <span>Rp50 - 200 juta</span>
              </span>
              <Link
                to="/pp/pengadaan"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E7C5A] hover:underline"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <PpPengajuanTable
            items={pengadaanPerluReview}
            isLoading={isLoading}
            emptyMessage="Tidak ada pengadaan yang menunggu review saat ini."
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default PpDashboardTemplate;
