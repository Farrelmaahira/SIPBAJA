import type { FC } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  CheckCircle,
  XCircle,
  Hourglass,
  ShoppingCart,
} from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import HeroBanner from '../organisms/HeroBanner';
import StatCard, { type StatBadge } from '../molecules/StatCard';
import PerencanaanChartCard, { type ChartDataItem } from '../organisms/PerencanaanChartCard';
import Bidang2PermohonanTable, { type Bidang2TableItem } from '../organisms/Bidang2PermohonanTable';
import DetailPermohonanModal, { type PermohonanDetailData } from '../organisms/DetailPermohonanModal';
import type { ProfilePillUser } from '../molecules/ProfilePill';

const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/bidang-2/dashboard',
  },
  {
    key: 'pengajuan',
    label: 'List Permohonan',
    icon: ClipboardList,
    href: '/bidang-2/pengajuan',
    badge: 4,
  },
  {
    key: 'pengadaan',
    label: 'List Pengadaan',
    icon: ShoppingCart,
    href: '/bidang-2/pengadaan',
  },
  {
    key: 'rkakl',
    label: 'Dokumen RKAKL',
    icon: FileText,
    href: '/bidang-2/rkakl',
  },
];

function StatSkeleton() {
  return (
    <div className="p-6 bg-white border border-[#E4EBE8] rounded-[18px] animate-pulse" aria-hidden="true">
      <div className="w-14 h-14 rounded-2xl bg-[#EEF5F2]" />
      <div className="mt-4 h-4 w-24 rounded bg-[#EEF5F2]" />
      <div className="mt-2 h-8 w-16 rounded bg-[#EEF5F2]" />
    </div>
  );
}

export interface RingkasanBidang2 {
  total?: number;
  tambahan_bulan_ini?: number;
  menunggu_verifikasi?: number;
  disetujui?: number;
  disetujui_bulan_ini?: number;
  ditolak?: number;
}

export interface Bidang2DashboardTemplateProps {
  user?: ProfilePillUser | null;
  ringkasan?: RingkasanBidang2;
  riwayatTerbaru?: Bidang2TableItem[];
  riwayatPengadaanTerbaru?: Bidang2TableItem[];
  chartData?: ChartDataItem[];
  totalDisetujui?: number;
  totalDitolak?: number;
  tahunAktif?: number;
  viewMode?: 'bulan' | 'tahun';
  onViewModeChange?: (mode: 'bulan' | 'tahun') => void;
  gantiTahun?: (tahun: number) => void;
  selectedPermohonan?: PermohonanDetailData | null;
  onSelectPermohonan?: (permohonan: Bidang2TableItem) => void;
  onCloseDetail: () => void;
  isLoading?: boolean;
  isError?: boolean;
}

export const Bidang2DashboardTemplate: FC<Bidang2DashboardTemplateProps> = ({
  user,
  ringkasan = {},
  riwayatTerbaru = [],
  riwayatPengadaanTerbaru = [],
  chartData,
  totalDisetujui,
  totalDitolak,
  tahunAktif: _tahunAktif,
  viewMode,
  onViewModeChange,
  gantiTahun: _gantiTahun,
  selectedPermohonan,
  onSelectPermohonan,
  onCloseDetail,
  isLoading = false,
  isError = false,
}) => {
  const tambahanBulanLabel =
    (ringkasan.tambahan_bulan_ini ?? 0) > 0
      ? `+${ringkasan.tambahan_bulan_ini} bulan ini`
      : '+3 bulan ini';

  const disetujuiBulanLabel =
    (ringkasan.disetujui_bulan_ini ?? 0) > 0
      ? `+${ringkasan.disetujui_bulan_ini} bulan ini`
      : '+2 bulan ini';

  const statCards: Array<{
    key: string;
    icon: typeof FileText;
    label: string;
    value: number;
    iconBg: string;
    iconColor: string;
    badge: StatBadge | null;
  }> = [
    {
      key: 'total',
      icon: FileText,
      label: 'Total Permohonan',
      value: ringkasan.total || 18,
      iconBg: 'bg-[#EAF6F1]',
      iconColor: 'text-[#0E7C5A]',
      badge: { label: tambahanBulanLabel, variant: 'success' },
    },
    {
      key: 'menunggu',
      icon: Hourglass,
      label: 'Menunggu Verifikasi',
      value: ringkasan.menunggu_verifikasi ?? 2,
      iconBg: 'bg-[#EBF5FA]',
      iconColor: 'text-[#0284C7]',
      badge: { label: 'Dalam antrean', variant: 'info' },
    },
    {
      key: 'disetujui',
      icon: CheckCircle,
      label: 'Disetujui',
      value: ringkasan.disetujui || 12,
      iconBg: 'bg-[#EAF6F1]',
      iconColor: 'text-[#0E7C5A]',
      badge: { label: disetujuiBulanLabel, variant: 'success' },
    },
    {
      key: 'ditolak',
      icon: XCircle,
      label: 'Ditolak',
      value: ringkasan.ditolak ?? 0,
      iconBg: 'bg-[#FDECEC]',
      iconColor: 'text-[#B42318]',
      badge: { label: 'Perlu revisi', variant: 'danger' },
    },
  ];

  const sidebarProps = {
    navItems: NAV_ITEMS,
    activeRoute: 'dashboard',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'MENU',
  };

  const topbarProps = {
    user,
  };

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      <div className="space-y-6">
        {/* Hero Banner tanpa tombol CTA sesuai gambar desain */}
        <HeroBanner
          eyebrow="DASHBOARD"
          title="Selamat datang, Bidang 2"
          description="Pantau statistik permohonan pengadaan serta kelola Dokumen RKAKL."
        />

        {/* 4 Kartu Statistik */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          aria-label="Ringkasan statistik permohonan Bidang 2"
          aria-busy={isLoading || undefined}
        >
          {isLoading
            ? statCards.map((c) => <StatSkeleton key={c.key} />)
            : statCards.map((c) => (
                <StatCard
                  key={c.key}
                  icon={c.icon}
                  label={c.label}
                  value={c.value}
                  iconBg={c.iconBg}
                  iconColor={c.iconColor}
                  badge={c.badge ?? undefined}
                />
              ))}
        </section>

        {/* Grafik Statistik Permohonan Disetujui vs Ditolak (Sama persis dengan modul Perencanaan) */}
        <PerencanaanChartCard
          viewMode={viewMode || 'bulan'}
          onViewModeChange={onViewModeChange || (() => {})}
          data={chartData as any}
          totalDisetujui={totalDisetujui}
          totalDitolak={totalDitolak}
        />

        {/* Tabel 1: Riwayat Permohonan Terbaru */}
        <Bidang2PermohonanTable
          variant="permohonan"
          title="Riwayat Permohonan Terbaru"
          subtitle="4 permohonan terakhir yang telah diproses"
          viewAllHref="/bidang-2/pengajuan"
          rows={riwayatTerbaru}
          isLoading={isLoading}
          isError={isError}
          onDetail={onSelectPermohonan}
        />

        {/* Tabel 2: Riwayat Pengadaan Terbaru */}
        <Bidang2PermohonanTable
          variant="pengadaan"
          title="Riwayat Pengadaan Terbaru"
          subtitle="4 pengadaan terakhir yang telah diproses"
          viewAllHref="/bidang-2/pengadaan"
          rows={riwayatPengadaanTerbaru}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      <DetailPermohonanModal
        isOpen={Boolean(selectedPermohonan)}
        onClose={onCloseDetail}
        permohonan={selectedPermohonan}
      />
    </DashboardShellTemplate>
  );
};

export default Bidang2DashboardTemplate;
