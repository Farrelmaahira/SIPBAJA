import { useMemo, type FC } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Download,
} from 'lucide-react';
import AppLayout, { type AppNavItem } from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatCard, { type StatBadge } from '../../molecules/StatCard';
import StatistikChart, { type ChartDatum } from '../../organisms/StatistikChart';
import DashboardTable, {
  type DashboardTableColumn,
  type DashboardTableAction,
} from '../../organisms/DashboardTable';
import StatusPill from '../../atoms/StatusPill';
import { formatRupiah, formatTanggal, labelStatusPermohonan } from '../../../utils/formatPermohonan';
import type { PermohonanAktifItem } from '../../../hooks/usePemohonDashboard';
import type { ProfilePillUser } from '../../molecules/ProfilePill';

const NAV_ITEMS: AppNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/pemohon/dashboard',
  },
  {
    key: 'permohonan',
    label: 'List Permohonan',
    icon: ClipboardList,
    href: '/pemohon/permohonan',
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

export interface RingkasanPemohon {
  total?: number;
  tambahan_bulan_ini?: number;
  menunggu_verifikasi?: number;
  disetujui?: number;
  ditolak?: number;
}

export interface PemohonDashboardTemplateProps {
  user?: (ProfilePillUser & { unit?: { nama?: string } }) | null;
  ringkasan?: RingkasanPemohon;
  permohonanAktif?: PermohonanAktifItem[];
  chartData?: ChartDatum[];
  totalDisetujui?: number;
  totalDitolak?: number;
  tahunAktif?: number;
  viewMode?: 'bulan' | 'tahun';
  onViewModeChange?: (mode: 'bulan' | 'tahun') => void;
  gantiTahun?: (tahun: number) => void;
  isLoading?: boolean;
  isError?: boolean;
  onBuatPermohonan?: () => void;
}

export const PemohonDashboardTemplate: FC<PemohonDashboardTemplateProps> = ({
  user,
  ringkasan = {},
  permohonanAktif = [],
  chartData,
  totalDisetujui,
  totalDitolak,
  tahunAktif,
  viewMode = 'bulan',
  onViewModeChange,
  gantiTahun,
  isLoading = false,
  isError = false,
  onBuatPermohonan,
}) => {
  const tambahanLabel =
    (ringkasan.tambahan_bulan_ini ?? 0) > 0 ? `+${ringkasan.tambahan_bulan_ini} bulan ini` : null;

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
        badge: tambahanLabel ? { label: tambahanLabel, variant: 'success' } : null,
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
        badge: null,
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

  const navItems: AppNavItem[] = NAV_ITEMS.map((item) => {
    if (item.key === 'permohonan' && (ringkasan.menunggu_verifikasi ?? 0) > 0) {
      return { ...item, badge: ringkasan.menunggu_verifikasi };
    }
    return item;
  });

  const tableColumns: DashboardTableColumn<PermohonanAktifItem>[] = useMemo(
    () => [
      {
        key: 'nomor_surat',
        header: 'No Permohonan',
        render: (row) =>
          row.id ? (
            <Link
              to={`/pemohon/permohonan/${row.id}`}
              className="text-left font-semibold text-[#0E7C5A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded whitespace-nowrap"
              aria-label={`Buka detail permohonan ${row.nomor_surat || '-'}`}
            >
              {row.nomor_surat || '-'}
            </Link>
          ) : (
            <span className="font-semibold text-[#14201C] whitespace-nowrap">
              {row.nomor_surat || '-'}
            </span>
          ),
      },
      {
        key: 'judul',
        header: 'Judul Pengadaan',
        render: (row) => (
          <span
            className="block max-w-xs truncate font-medium text-[#14201C]"
            title={row.judul || undefined}
          >
            {row.judul || '-'}
          </span>
        ),
      },
      {
        key: 'created_at',
        header: 'Tanggal',
        render: (row) => (
          <span className="text-[#5F6F6A] whitespace-nowrap">
            {formatTanggal(row.created_at)}
          </span>
        ),
      },
      {
        key: 'estimasi_anggaran',
        header: 'Nilai Pengajuan',
        render: (row) => (
          <span className="font-semibold text-[#14201C] whitespace-nowrap">
            {formatRupiah(row.estimasi_anggaran)}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => {
          const rawStatus = String(row.status ?? 'diajukan');
          const { label } = labelStatusPermohonan(rawStatus);
          return (
            <div className="whitespace-nowrap">
              <StatusPill status={rawStatus} label={label} />
            </div>
          );
        },
      },
    ],
    []
  );

  const tableActions = (
    row: PermohonanAktifItem
  ): DashboardTableAction<PermohonanAktifItem>[] => [
    {
      key: 'detail',
      label: 'Lihat Detail',
      icon: FileText,
      href: row.id ? `/pemohon/permohonan/${row.id}` : undefined,
    },
    {
      key: 'unduh',
      label: 'Unduh Berkas',
      icon: Download,
      hidden: !row.dokumen?.[0] && !row.id,
      onClick: () => {
        if (row.id) {
          window.open(`/api/v1/pemohon/permohonan/${row.id}/dokumen`, '_blank');
        }
      },
    },
  ];

  return (
    <AppLayout
      activeRoute="dashboard"
      navItems={navItems}
      roleInitials="PM"
      roleTitle="Pemohon"
      roleSubtitle={user?.unit?.nama || 'Jurusan / Bagian'}
      profileHref="/pemohon/profil"
      notifikasiHref="/pemohon/dashboard"
      user={user}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="Dashboard Pemohon"
          title={`Selamat datang, ${user?.unit?.nama ?? user?.nama ?? 'Jurusan / Unit'}`}
          description="Pantau dan kelola seluruh permohonan pengadaan Anda dalam satu tempat."
          ctaLabel="Buat Permohonan"
          onCta={onBuatPermohonan}
        />

        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          aria-label="Ringkasan permohonan"
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

        <DashboardTable<PermohonanAktifItem>
          title="Permohonan Sedang Berlangsung"
          subtitle={isLoading ? 'Memuat...' : `${permohonanAktif.length} permohonan aktif`}
          viewAllLink={{
            href: '/pemohon/permohonan',
            label: 'Lihat Semua',
          }}
          columns={tableColumns}
          data={permohonanAktif}
          actions={tableActions}
          isLoading={isLoading}
          isError={isError}
          errorMessage="Gagal memuat data permohonan."
          emptyState={{
            icon: ClipboardList,
            title: 'Tidak ada permohonan aktif',
            description: 'Buat permohonan pengadaan pertama unit Anda untuk memulai.',
            action: onBuatPermohonan ? (
              <button
                type="button"
                onClick={onBuatPermohonan}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0E7C5A] text-white text-sm font-semibold hover:bg-[#0B6B4D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] focus-visible:ring-offset-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Buat Permohonan
              </button>
            ) : undefined,
          }}
        />
      </div>
    </AppLayout>
  );
};

export default PemohonDashboardTemplate;
