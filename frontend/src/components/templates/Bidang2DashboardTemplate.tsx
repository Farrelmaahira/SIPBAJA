import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, FileText, CheckCircle, XCircle } from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import HeroBanner from '../organisms/HeroBanner';
import StatCard, { type StatBadge } from '../molecules/StatCard';
import StatistikChart, { type ChartDatum } from '../organisms/StatistikChart';
import Bidang2PermohonanTable from '../organisms/Bidang2PermohonanTable';
import DetailPermohonanModal, { type PermohonanDetailData } from '../organisms/DetailPermohonanModal';
import type { Bidang2PermohonanItem } from '../molecules/Bidang2PermohonanRow';
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
    label: 'List Pengajuan',
    icon: ClipboardList,
    href: '/bidang-2/pengajuan',
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
  riwayatTerbaru?: Bidang2PermohonanItem[];
  chartData?: ChartDatum[];
  totalDisetujui?: number;
  totalDitolak?: number;
  tahunAktif?: number;
  viewMode?: 'bulan' | 'tahun';
  onViewModeChange?: (mode: 'bulan' | 'tahun') => void;
  gantiTahun?: (tahun: number) => void;
  selectedPermohonan?: PermohonanDetailData | null;
  onSelectPermohonan?: (permohonan: Bidang2PermohonanItem) => void;
  onCloseDetail: () => void;
  isLoading?: boolean;
  isError?: boolean;
}

export const Bidang2DashboardTemplate: FC<Bidang2DashboardTemplateProps> = ({
  user,
  ringkasan = {},
  riwayatTerbaru = [],
  chartData,
  totalDisetujui,
  totalDitolak,
  tahunAktif,
  viewMode,
  onViewModeChange,
  gantiTahun,
  selectedPermohonan,
  onSelectPermohonan,
  onCloseDetail,
  isLoading = false,
  isError = false,
}) => {
  const navigate = useNavigate();

  const tambahanBulanLabel =
    (ringkasan.tambahan_bulan_ini ?? 0) > 0 ? `+${ringkasan.tambahan_bulan_ini} bulan ini` : null;
  const disetujuiBulanLabel =
    (ringkasan.disetujui_bulan_ini ?? 0) > 0 ? `+${ringkasan.disetujui_bulan_ini} bulan ini` : null;

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
      value: ringkasan.total ?? 0,
      iconBg: 'bg-[#E4F6EC]',
      iconColor: 'text-[#0E7C5A]',
      badge: tambahanBulanLabel ? { label: tambahanBulanLabel, variant: 'success' } : null,
    },
    {
      key: 'menunggu',
      icon: ClipboardList,
      label: 'Menunggu Verifikasi',
      value: ringkasan.menunggu_verifikasi ?? 0,
      iconBg: 'bg-[#E8F0FF]',
      iconColor: 'text-[#1F55C7]',
      badge: (ringkasan.menunggu_verifikasi ?? 0) > 0 ? { label: 'Dalam antrean', variant: 'info' } : null,
    },
    {
      key: 'disetujui',
      icon: CheckCircle,
      label: 'Disetujui',
      value: ringkasan.disetujui ?? 0,
      iconBg: 'bg-[#E4F6EC]',
      iconColor: 'text-[#0E7C5A]',
      badge: disetujuiBulanLabel ? { label: disetujuiBulanLabel, variant: 'success' } : null,
    },
    {
      key: 'ditolak',
      icon: XCircle,
      label: 'Ditolak',
      value: ringkasan.ditolak ?? 0,
      iconBg: 'bg-[#FDECEC]',
      iconColor: 'text-[#B42318]',
      badge: (ringkasan.ditolak ?? 0) > 0 ? { label: 'Perlu revisi', variant: 'danger' } : null,
    },
  ];

  const navItems = NAV_ITEMS.map((item) => {
    if (item.key === 'pengajuan' && (ringkasan.menunggu_verifikasi ?? 0) > 0) {
      return { ...item, badge: ringkasan.menunggu_verifikasi };
    }
    return item;
  });

  const sidebarProps = {
    navItems,
    activeRoute: 'dashboard',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'MENU',
  };

  const topbarProps = {
    user,
  };

  const handleCta = () => {
    navigate('/bidang-2/pengajuan');
  };

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      <HeroBanner
        eyebrow="DASHBOARD"
        title="Selamat datang, Bidang 2"
        description="Pantau statistik permohonan pengadaan serta kelola Dokumen RKAKL."
        ctaLabel="Lihat Pengajuan"
        ctaIcon={ClipboardList}
        onCta={handleCta}
      />

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

      <StatistikChart
        chartData={chartData}
        tahunAktif={tahunAktif}
        gantiTahun={gantiTahun}
        totalDisetujui={totalDisetujui}
        totalDitolak={totalDitolak}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        isLoading={isLoading && !chartData}
      />

      <Bidang2PermohonanTable
        rows={riwayatTerbaru}
        isLoading={isLoading}
        isError={isError}
        onDetail={onSelectPermohonan}
      />

      <DetailPermohonanModal
        isOpen={Boolean(selectedPermohonan)}
        onClose={onCloseDetail}
        permohonan={selectedPermohonan}
      />
    </DashboardShellTemplate>
  );
};

export default Bidang2DashboardTemplate;
