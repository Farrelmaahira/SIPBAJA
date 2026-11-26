import { type FC } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Hourglass,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import AppLayout, { type AppNavItem } from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatCard from '../../molecules/StatCard';
import StatistikChart, { type ChartDatum } from '../../organisms/StatistikChart';
import PpkPengajuanTable from '../../organisms/PpkPengajuanTable';
import type { NotificationItem } from '../../../types/notification';
import type { PpkDashboardStats, PpkTableRow } from '../../../types/ppk';

export interface PpkDashboardTemplateProps {
  navItems: AppNavItem[];
  stats: PpkDashboardStats;
  permohonanRows: PpkTableRow[];
  pengadaanRows: PpkTableRow[];
  chartData?: ChartDatum[];
  viewMode: 'bulan' | 'tahun';
  onViewModeChange: (mode: 'bulan' | 'tahun') => void;
  isLoading: boolean;
  errorMessage?: string;
  recentNotifications: NotificationItem[];
  unreadNotificationsCount: number;
}

export const PpkDashboardTemplate: FC<PpkDashboardTemplateProps> = ({
  navItems,
  stats,
  permohonanRows,
  pengadaanRows,
  chartData,
  viewMode,
  onViewModeChange,
  isLoading,
  errorMessage = '',
  recentNotifications,
  unreadNotificationsCount,
}) => {
  const total = stats.total ?? 0;
  const menunggu = stats.menunggu ?? 0;
  const disetujui = stats.disetujui ?? 0;
  const ditolak = stats.ditolak ?? 0;

  return (
    <AppLayout
      activeRoute="dashboard"
      navItems={navItems}
      roleInitials="PP"
      roleTitle="PPK"
      roleSubtitle="Unit PPK"
      profileHref="/ppk/profil"
      notifikasiHref="/ppk/notifikasi"
      readAllHref="/ppk/notifikasi/read-all"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      flash={errorMessage ? { error: errorMessage } : undefined}
    >
      <div className="space-y-6">
        {/* Hero Welcome Banner */}
        <HeroBanner
          eyebrow="DASHBOARD"
          title="Selamat datang, PPK"
          description="Pantau dan kelola seluruh pengajuan pengadaan yang masuk dalam satu tempat."
        />

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total Permohonan"
            value={isLoading ? '-' : total}
            iconBg="bg-[#E4F6EC]"
            iconColor="text-[#0E7C5A]"
            badge={{
              label: stats.tambahan_bulan_ini ? `+${stats.tambahan_bulan_ini} bulan ini` : 'Bulan ini',
              variant: 'success',
            }}
          />
          <StatCard
            icon={Hourglass}
            label="Menunggu Verifikasi"
            value={isLoading ? '-' : menunggu}
            iconBg="bg-[#E8F0FF]"
            iconColor="text-[#2F68D6]"
            badge={{ label: 'Dalam antrean', variant: 'info' }}
          />
          <StatCard
            icon={CheckCircle2}
            label="Disetujui"
            value={isLoading ? '-' : disetujui}
            iconBg="bg-[#E4F6EC]"
            iconColor="text-[#0E7C5A]"
            badge={{
              label: stats.disetujui_bulan_ini ? `+${stats.disetujui_bulan_ini} bulan ini` : 'Disetujui',
              variant: 'success',
            }}
          />
          <StatCard
            icon={XCircle}
            label="Ditolak"
            value={isLoading ? '-' : ditolak}
            iconBg="bg-[#FDECEC]"
            iconColor="text-[#D92D20]"
            badge={{
              label: stats.ditolak_tahun_ini ? `+${stats.ditolak_tahun_ini} tahun ini` : 'Tahun ini',
              variant: 'danger',
            }}
          />
        </div>

        {/* Statistik Permohonan Chart */}
        <StatistikChart
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          chartData={chartData}
          totalDisetujui={disetujui}
          totalDitolak={ditolak}
          isLoading={isLoading}
        />

        {/* Riwayat Permohonan Terbaru */}
        <div className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#F0F4F2] flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-[#14201C]">Riwayat Permohonan Terbaru</h2>
              <p className="text-xs text-[#8A9A95] mt-0.5">4 permohonan terakhir yang telah diproses</p>
            </div>
            <Link
              to="/ppk/permohonan"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E4EBE8] hover:bg-[#F4F7F5] text-xs font-bold text-[#0E7C5A] transition"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <PpkPengajuanTable
            rows={permohonanRows}
            isLoading={isLoading}
            emptyMessage="Belum ada riwayat permohonan."
          />
        </div>

        {/* Riwayat Pengadaan Terbaru */}
        <div className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#F0F4F2] flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-[#14201C]">Riwayat Pengadaan Terbaru</h2>
              <p className="text-xs text-[#8A9A95] mt-0.5">4 pengadaan terakhir yang telah diproses</p>
            </div>
            <Link
              to="/ppk/pengadaan"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E4EBE8] hover:bg-[#F4F7F5] text-xs font-bold text-[#0E7C5A] transition"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <PpkPengajuanTable
            rows={pengadaanRows}
            isLoading={isLoading}
            emptyMessage="Belum ada riwayat pengadaan."
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default PpkDashboardTemplate;
