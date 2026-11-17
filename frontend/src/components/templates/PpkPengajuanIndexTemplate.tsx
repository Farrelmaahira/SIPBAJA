import { type FC, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, ChevronLeft, ChevronRight, FileText, Eye } from 'lucide-react';
import AppLayout, { type AppNavItem } from './AppLayout';
import HeroBanner from '../organisms/HeroBanner';
import CrudTable, { type CrudColumn } from '../organisms/CrudTable';
import SearchBar from '../molecules/SearchBar';
import SelectInput from '../molecules/SelectInput';
import StatusPill from '../atoms/StatusPill';
import FilterPengajuanModal, { type FilterOption } from '../organisms/FilterPengajuanModal';
import { formatRupiah, formatTanggal } from '../../utils/formatters';
import type { NotificationItem } from '../../types/notification';
import type { PpPaginationMeta, PpkRkaklDoc, PpkTableRow } from '../../types/ppk';

export const PPK_FILTER_OPTIONS: FilterOption[] = [
  {
    value: 'menunggu_persetujuan',
    label: 'Menunggu Persetujuan',
    dotClass: 'bg-[#F59E0B]',
  },
  {
    value: 'review_pembayaran',
    label: 'Review Pembayaran',
    dotClass: 'bg-[#3B82F6]',
  },
  {
    value: 'disetujui',
    label: 'Disetujui',
    dotClass: 'bg-[#10B981]',
  },
  {
    value: 'ditolak',
    label: 'Ditolak',
    dotClass: 'bg-[#EF4444]',
  },
];

const BULAN_OPTIONS = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

export interface PpkPengajuanIndexTemplateProps {
  navItems: AppNavItem[];
  activeTab: 'pengadaan' | 'permohonan';
  onTabChange: (tab: 'pengadaan' | 'permohonan') => void;
  rows: PpkTableRow[];
  meta: PpPaginationMeta;
  search: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  selectedStatuses: string[];
  bulan: string;
  tahun: string;
  onBulanChange: (val: string) => void;
  onTahunChange: (val: string) => void;
  filterOpen: boolean;
  onOpenFilter: () => void;
  onCloseFilter: () => void;
  onApplyFilter: (statuses: string[]) => void;
  onPageChange: (page: number) => void;
  activeRkakl: PpkRkaklDoc | null;
  onPreviewRkakl: (doc: PpkRkaklDoc) => void;
  isLoading: boolean;
  recentNotifications: NotificationItem[];
  unreadNotificationsCount: number;
}

export const PpkPengajuanIndexTemplate: FC<PpkPengajuanIndexTemplateProps> = ({
  navItems,
  activeTab,
  onTabChange,
  rows,
  meta,
  search,
  onSearchChange,
  onSearchSubmit,
  selectedStatuses,
  bulan,
  tahun,
  onBulanChange,
  onTahunChange,
  filterOpen,
  onOpenFilter,
  onCloseFilter,
  onApplyFilter,
  onPageChange,
  activeRkakl,
  onPreviewRkakl,
  isLoading,
  recentNotifications,
  unreadNotificationsCount,
}) => {
  const currentYear = new Date().getFullYear();
  const tahunOptions = [
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear - 1), label: String(currentYear - 1) },
    { value: String(currentYear - 2), label: String(currentYear - 2) },
  ];

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;

  const getDetailHref = (row: PpkTableRow): string => {
    if (row.sourceType === 'permohonan') {
      return `/ppk/pengajuan/${row.id}/review?type=permohonan`;
    }
    if (row.status === 'menunggu_persetujuan' || row.status === 'menunggu_review') {
      return `/ppk/pengajuan/${row.id}/review`;
    }
    if (row.status === 'review_pembayaran' || row.status === 'diteruskan') {
      return `/ppk/pengajuan/${row.id}/pembayaran`;
    }
    return `/ppk/pengajuan/${row.id}`;
  };

  const columns: CrudColumn<PpkTableRow>[] = [
    {
      key: 'nomor_surat',
      header: 'Nomor Surat',
      className: 'font-bold text-[#0E7C5A] whitespace-nowrap',
      render: (row) => (
        <Link to={getDetailHref(row)} className="hover:underline">
          {row.nomor_surat || '-'}
        </Link>
      ),
    },
    {
      key: 'judul',
      header: 'Judul Pengadaan',
      render: (row) => (
        <span className="font-bold text-[#14201C] line-clamp-1">{row.judul || '-'}</span>
      ),
    },
    {
      key: 'unit',
      header: 'Unit Pemohon',
      className: 'text-[#5F6F6A] whitespace-nowrap',
      render: (row) => row.unit || '-',
    },
    {
      key: 'tanggal',
      header: 'Tanggal',
      className: 'text-[#5F6F6A] whitespace-nowrap',
      render: (row) => formatTanggal(row.tanggal),
    },
    {
      key: 'nominal',
      header: 'Nominal',
      className: 'font-bold text-[#14201C] whitespace-nowrap',
      render: (row) => formatRupiah(row.nominal),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (row) => <StatusPill status={row.status} />,
    },
  ];

  const toolbar = (
    <div className="flex flex-col gap-4 w-full">
      {/* Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#F0F4F2]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onTabChange('pengadaan')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'pengadaan'
                ? 'bg-[#E8F5EF] text-[#0E7C5A]'
                : 'text-[#6B7280] hover:bg-[#F4F7F5]'
            }`}
          >
            Dokumen Pengadaan
          </button>
          <button
            type="button"
            onClick={() => onTabChange('permohonan')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'permohonan'
                ? 'bg-[#E8F5EF] text-[#0E7C5A]'
                : 'text-[#6B7280] hover:bg-[#F4F7F5]'
            }`}
          >
            Dokumen Turunan (MAK)
          </button>
        </div>

        <div className="text-xs text-[#8A9A95]">
          Menampilkan <strong className="text-[#14201C]">{rows.length}</strong> data
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <form onSubmit={onSearchSubmit} className="flex-1 max-w-md">
          <SearchBar
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nomor surat atau judul..."
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <SelectInput
            value={bulan}
            onChange={(e) => onBulanChange(e.target.value)}
            options={BULAN_OPTIONS}
            placeholder="Semua Bulan"
            className="w-36"
          />

          <SelectInput
            value={tahun}
            onChange={(e) => onTahunChange(e.target.value)}
            options={tahunOptions}
            placeholder="Semua Tahun"
            className="w-36"
          />

          <button
            type="button"
            onClick={onOpenFilter}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              selectedStatuses.length > 0
                ? 'bg-[#E8F5EF] text-[#0E7C5A] border-[#0E7C5A]'
                : 'bg-[#F7FAF9] text-[#14201C] border-[#E4EBE8] hover:bg-[#EEF3F0]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Status</span>
            {selectedStatuses.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#0E7C5A] text-white text-[10px] flex items-center justify-center font-bold">
                {selectedStatuses.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const footer = lastPage > 1 && onPageChange ? (
    <div className="flex items-center justify-between pt-5 border-t border-[#F0F4F2]">
      <span className="text-xs text-[#8A9A95]">
        Halaman <strong className="text-[#14201C]">{currentPage}</strong> dari{' '}
        <strong className="text-[#14201C]">{lastPage}</strong>
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#14201C] hover:bg-[#F4F7F5] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Sebelumnya</span>
        </button>
        <button
          type="button"
          disabled={currentPage >= lastPage || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#14201C] hover:bg-[#F4F7F5] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  ) : null;

  return (
    <AppLayout
      activeRoute="pengajuan"
      navItems={navItems}
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      profileHref="/ppk/profil"
      notifikasiHref="/ppk/notifikasi"
      readAllHref="/ppk/notifikasi/read-all"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      breadcrumb={[
        { label: 'PPK', href: '/ppk/dashboard' },
        { label: 'DAFTAR PENGAJUAN' },
      ]}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PENGAJUAN"
          title="Daftar Pengajuan PPK"
          description="Kelola dan verifikasi komitmen pengadaan serta persetujuan dokumen termin pembayaran."
        />

        {/* Banner RKAKL Aktif */}
        {activeRkakl && (
          <div className="bg-white rounded-[22px] border border-[#E4EBE8] p-5 shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <CrudTable
          title="Daftar Komitmen Pengadaan"
          subtitle="Paket pengadaan dan pengajuan MAK dalam wewenang PPK"
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          toolbar={toolbar}
          footer={footer}
          actions={[
            {
              key: 'view',
              label: 'Detail / Review',
              href: (row) => getDetailHref(row),
            },
          ]}
        />
      </div>

      <FilterPengajuanModal
        isOpen={filterOpen}
        onClose={onCloseFilter}
        selectedStatuses={selectedStatuses}
        onApplyFilter={onApplyFilter}
        options={PPK_FILTER_OPTIONS}
      />
    </AppLayout>
  );
};

export default PpkPengajuanIndexTemplate;
