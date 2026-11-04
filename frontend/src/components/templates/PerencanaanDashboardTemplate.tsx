import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import AppLayout from './AppLayout';
import PerencanaanStatCards from '../organisms/PerencanaanStatCards';
import PerencanaanChartCard from '../organisms/PerencanaanChartCard';
import PerencanaanPermohonanTerbaruTable from '../organisms/PerencanaanPermohonanTerbaruTable';
import { PERENCANAAN_NAV_ITEMS } from '../../pages/Perencanaan/Dashboard';
import type {
  PerencanaanDashboardStats,
  PermohonanTerbaruItem,
} from '../../types/perencanaan';

export interface PerencanaanDashboardTemplateProps {
  stats?: PerencanaanDashboardStats;
  permohonanTerbaru: PermohonanTerbaruItem[];
  isLoading?: boolean;
  viewMode: 'bulan' | 'tahun';
  onViewModeChange: (mode: 'bulan' | 'tahun') => void;
  recentNotifications?: any[];
  unreadNotificationsCount?: number;
}

export const PerencanaanDashboardTemplate: FC<PerencanaanDashboardTemplateProps> = ({
  stats,
  permohonanTerbaru,
  isLoading = false,
  viewMode,
  onViewModeChange,
  recentNotifications,
  unreadNotificationsCount,
}) => {
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
    >
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 mb-1.5">
              DASHBOARD
            </p>
            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
              Selamat datang, Tim Perencanaan
            </h1>
            <p className="text-xs sm:text-sm text-white/85 mt-1.5 leading-relaxed">
              Pantau permohonan pengadaan yang masuk, serta kelola Jenis MAK dan Dokumen RKAKL.
            </p>
          </div>

          <Link
            to="/perencanaan/pengajuan"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#F1F7F4] text-[#0E7C5A] text-xs font-bold shadow-sm transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Lihat Permohonan</span>
          </Link>
        </div>

        <div
          className="absolute -right-10 -top-20 w-[280px] h-[280px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute right-28 -bottom-20 w-[190px] h-[190px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* 4 Stat Cards Organism */}
      <PerencanaanStatCards stats={stats} isLoading={isLoading} />

      {/* Statistik Chart Card Organism */}
      <PerencanaanChartCard
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />

      {/* Table Organism: Permohonan Masuk Terbaru */}
      <PerencanaanPermohonanTerbaruTable
        items={permohonanTerbaru}
        isLoading={isLoading}
      />
    </AppLayout>
  );
};

export default PerencanaanDashboardTemplate;
