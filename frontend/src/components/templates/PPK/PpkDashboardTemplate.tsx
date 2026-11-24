import { type FC } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import AppLayout, { type AppNavItem } from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatCard from '../../molecules/StatCard';
import PpkPengajuanTable from '../../organisms/PpkPengajuanTable';
import type { NotificationItem } from '../../../types/notification';
import type { PpkDashboardStats, PpkTableRow } from '../../../types/ppk';

export interface PpkDashboardTemplateProps {
  navItems: AppNavItem[];
  stats: PpkDashboardStats;
  rows: PpkTableRow[];
  isLoading: boolean;
  hoveredBar: number;
  onHoverBar: (idx: number) => void;
  recentNotifications: NotificationItem[];
  unreadNotificationsCount: number;
}

export const PpkDashboardTemplate: FC<PpkDashboardTemplateProps> = ({
  navItems,
  stats,
  rows,
  isLoading,
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
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      profileHref="/ppk/profil"
      notifikasiHref="/ppk/notifikasi"
      readAllHref="/ppk/notifikasi/read-all"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
    >
      <div className="space-y-6">
        {/* Hero Welcome Banner */}
        <HeroBanner
          eyebrow="DASHBOARD"
          title="Selamat datang, PPK"
          description="Kelola dan otorisasi komitmen pengadaan barang & jasa serta persetujuan dokumen pembayaran per-termin."
        />

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total Pengajuan"
            value={isLoading ? '-' : total}
            iconBg="bg-[#E4F6EC]"
            iconColor="text-[#0E7C5A]"
          />
          <StatCard
            icon={Clock}
            label="Menunggu Review"
            value={isLoading ? '-' : menunggu}
            iconBg="bg-[#FEF3DC]"
            iconColor="text-[#9A5B00]"
          />
          <StatCard
            icon={CheckCircle2}
            label="Disetujui"
            value={isLoading ? '-' : disetujui}
            iconBg="bg-[#E4F6EC]"
            iconColor="text-[#0B7A4E]"
          />
          <StatCard
            icon={XCircle}
            label="Ditolak"
            value={isLoading ? '-' : ditolak}
            iconBg="bg-[#FDECEC]"
            iconColor="text-[#D92D20]"
          />
        </div>

        {/* Organism: Pengajuan Masuk Terbaru */}
        <div className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#F0F4F2] flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-[#14201C]">Pengajuan Masuk Terbaru</h2>
              <p className="text-xs text-[#8A9A95] mt-0.5">Permohonan yang membutuhkan tindakan PPK</p>
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
            rows={rows}
            isLoading={isLoading}
            emptyMessage="Belum ada pengajuan masuk."
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default PpkDashboardTemplate;
