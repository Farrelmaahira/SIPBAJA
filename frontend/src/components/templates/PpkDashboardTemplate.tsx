import { type FC } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
} from 'lucide-react';
import PpLayout, { type PpNavItem } from './PpLayout';
import HeroBanner from '../organisms/HeroBanner';
import StatCard from '../molecules/StatCard';
import PpkPengajuanTable from '../organisms/PpkPengajuanTable';
import type { NotificationItem } from '../../types/notification';
import type { PpkDashboardStats, PpkRkaklDoc, PpkTableRow } from '../../types/ppk';

export interface PpkDashboardTemplateProps {
  navItems: PpNavItem[];
  stats: PpkDashboardStats;
  rows: PpkTableRow[];
  activeRkakl: PpkRkaklDoc | null;
  isLoading: boolean;
  hoveredBar: number;
  onHoverBar: (idx: number) => void;
  onPreviewRkakl: (doc: PpkRkaklDoc) => void;
  recentNotifications: NotificationItem[];
  unreadNotificationsCount: number;
}

export const PpkDashboardTemplate: FC<PpkDashboardTemplateProps> = ({
  navItems,
  stats,
  rows,
  activeRkakl,
  isLoading,
  onPreviewRkakl,
  recentNotifications,
  unreadNotificationsCount,
}) => {
  const total = stats.total ?? 0;
  const menunggu = stats.menunggu ?? 0;
  const disetujui = stats.disetujui ?? 0;
  const ditolak = stats.ditolak ?? 0;

  return (
    <PpLayout
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
      {/* Hero Welcome Banner */}
      <HeroBanner
        eyebrow="DASHBOARD"
        title="Selamat datang, PPK"
        description="Kelola dan otorisasi komitmen pengadaan barang & jasa serta persetujuan dokumen pembayaran per-termin."
        className="mb-6"
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      {/* Banner RKAKL Aktif (Jika Tersedia) */}
      {activeRkakl && (
        <div className="mb-6 bg-white rounded-[22px] border border-[#E4EBE8] p-5 shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E4F6EC] text-[#0B7A4E]">
                  RKAKL AKTIF {activeRkakl.tahun_anggaran || '2026'}
                </span>
                <span className="text-xs text-[#8A9A95]">v{activeRkakl.versi ?? 1}</span>
              </div>
              <p className="text-sm font-bold text-[#14201C] mt-1">{activeRkakl.nama_asli}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onPreviewRkakl(activeRkakl)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0B684A] text-white text-xs font-bold transition shadow-[0_4px_12px_rgba(14,124,90,0.2)] cursor-pointer self-start sm:self-auto"
          >
            <Eye className="w-4 h-4" />
            <span>Pratinjau RKAKL</span>
          </button>
        </div>
      )}

      {/* Organism: Pengajuan Masuk Terbaru */}
      <div className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#F0F4F2] flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-[#14201C]">Pengajuan Masuk Terbaru</h2>
            <p className="text-xs text-[#8A9A95] mt-0.5">Permohonan yang membutuhkan tindakan PPK</p>
          </div>
          <Link
            to="/ppk/pengajuan"
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
    </PpLayout>
  );
};

export default PpkDashboardTemplate;
