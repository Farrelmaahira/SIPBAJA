import type { FC, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import CrudTable, { type CrudColumn } from '../../organisms/CrudTable';
import StatusPill from '../../atoms/StatusPill';
import FilterPengajuanModal, { type FilterStatusOption } from '../../organisms/FilterPengajuanModal';
import { BIDANG2_NAV_ITEMS } from '../../../constants/bidang2Nav';
import { formatRupiah, formatTanggal } from '../../../utils/formatters';
import type { Bidang2PengajuanListItem } from '../../../types/bidang2';
import type { ProfilePillUser } from '../../molecules/ProfilePill';

const BIDANG2_FILTER_STATUS_OPTIONS: FilterStatusOption[] = [
  {
    key: 'menunggu_bidang2',
    label: 'Review Permohonan',
    pillClass: 'bg-[#EFF4FE] text-[#2F68D6] border border-[#D0E1FD]',
    dotClass: 'bg-[#2F68D6]',
  },
  {
    key: 'disetujui',
    label: 'Disetujui',
    pillClass: 'bg-[#E8F5E9] text-[#0E7C5A] border border-[#C8E6C9]',
    dotClass: 'bg-[#0E7C5A]',
  },
  {
    key: 'ditolak',
    label: 'Ditolak',
    pillClass: 'bg-[#FDECEC] text-[#E5484D] border border-[#FECDCA]',
    dotClass: 'bg-[#E5484D]',
  },
];

export interface Bidang2PengajuanIndexTemplateProps {
  user?: ProfilePillUser | null;
  items: Bidang2PengajuanListItem[];
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e?: FormEvent) => void;
  selectedStatus?: string;
  selectedStatuses?: string[];
  filterModalOpen?: boolean;
  onOpenFilterModal?: () => void;
  onCloseFilterModal?: () => void;
  onApplyFilter?: (statuses: string[]) => void;
  onStatusChange?: (status: string) => void;
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
    from: number;
    to: number;
  };
  onPageChange: (page: number) => void;
  onViewDetail: (id: number | string) => void;
  onDownloadDokumen?: (id: number | string) => void;
  onRetry?: () => void;
}

export const Bidang2PengajuanIndexTemplate: FC<Bidang2PengajuanIndexTemplateProps> = ({
  user,
  items,
  isLoading,
  hasError: _hasError,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedStatuses = [],
  filterModalOpen = false,
  onOpenFilterModal,
  onCloseFilterModal,
  onApplyFilter,
  pagination,
  onPageChange,
  onViewDetail,
}) => {
  const columns: CrudColumn<Bidang2PengajuanListItem>[] = [
    {
      key: 'nomor_surat',
      header: 'No Permohonan',
      className: 'font-bold text-[#0E7C5A] whitespace-nowrap',
      render: (item) => (
        <Link
          to={`/bidang-2/pengajuan/${item.id}`}
          className="hover:underline font-bold"
        >
          {item.nomor_surat || '-'}
        </Link>
      ),
    },
    {
      key: 'judul',
      header: 'Judul Permohonan',
      render: (item) => (
        <span className="font-bold text-[#14201C] line-clamp-1" title={item.judul || undefined}>
          {item.judul || 'Tanpa Judul'}
        </span>
      ),
    },
    {
      key: 'unit_nama',
      header: 'Diajukan Oleh',
      className: 'whitespace-nowrap text-[#14201C]',
      render: (item) => item.unit_nama || 'Unit Kampus',
    },
    {
      key: 'created_at',
      header: 'Tanggal Pengajuan',
      className: 'text-[#5F6F6A] whitespace-nowrap',
      render: (item) => formatTanggal(item.created_at || item.tanggal_pengajuan),
    },
    {
      key: 'estimasi_anggaran',
      header: 'Nilai Pengajuan',
      className: 'font-bold text-[#14201C] whitespace-nowrap',
      render: (item) => formatRupiah(Number(item.estimasi_anggaran || 0)),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (item) => (
        <StatusPill
          status={item.status}
          label={item.status === 'menunggu_bidang2' ? 'Review Permohonan' : undefined}
        />
      ),
    },
  ];

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      <div className="flex flex-wrap items-center gap-2.5">
        {onOpenFilterModal && (
          <button
            type="button"
            onClick={onOpenFilterModal}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              selectedStatuses.length > 0
                ? 'bg-[#E8F5EF] text-[#0E7C5A] border-[#0E7C5A]'
                : 'bg-white text-[#14201C] border-[#E4EBE8] hover:bg-[#F4F7F5]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Status</span>
            {selectedStatuses.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#0E7C5A] text-white text-[10px] flex items-center justify-center font-bold">
                {selectedStatuses.length}
              </span>
            )}
          </button>
        )}

        <form onSubmit={onSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-[#8A9A95] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nomor surat atau judul..."
            className="w-64 sm:w-72 pl-10 pr-4 py-2.5 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:ring-2 focus:ring-[#0E7C5A] focus:border-transparent outline-none bg-white placeholder-[#8A9A95]"
          />
        </form>
      </div>

      <span className="text-xs text-[#8A9A95] font-medium">
        {pagination.total} permohonan
      </span>
    </div>
  );

  const footer = pagination.lastPage > 1 && onPageChange ? (
    <div className="flex items-center justify-between pt-5 border-t border-[#F0F4F2]">
      <span className="text-xs text-[#8A9A95]">
        Halaman <strong className="text-[#14201C]">{pagination.currentPage}</strong> dari{' '}
        <strong className="text-[#14201C]">{pagination.lastPage}</strong>
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pagination.currentPage <= 1 || isLoading}
          onClick={() => onPageChange(pagination.currentPage - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#14201C] hover:bg-[#F4F7F5] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Sebelumnya</span>
        </button>
        <button
          type="button"
          disabled={pagination.currentPage >= pagination.lastPage || isLoading}
          onClick={() => onPageChange(pagination.currentPage + 1)}
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
      navItems={BIDANG2_NAV_ITEMS}
      roleInitials="WD2"
      roleTitle="Bidang 2"
      roleSubtitle="Wakil Direktur II"
      profileHref="/bidang-2/profil"
      notifikasiHref="/bidang-2/dashboard"
      user={user}
      breadcrumb={[
        { label: 'BIDANG 2', href: '/bidang-2/dashboard' },
        { label: 'LIST PERMOHONAN' },
      ]}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PERMOHONAN"
          title="List Permohonan"
          description="Pantau dan review permohonan serta pengajuan yang masuk ke Bidang 2."
        />

        <CrudTable
          title="Daftar Permohonan"
          subtitle="Permohonan dan pengajuan yang perlu direview Bidang 2"
          columns={columns}
          rows={items}
          isLoading={isLoading}
          toolbar={toolbar}
          footer={footer}
          actions={[
            {
              key: 'view',
              label: 'Detail',
              onClick: (item) => onViewDetail(item.id),
            },
          ]}
        />
      </div>

      {onCloseFilterModal && onApplyFilter && (
        <FilterPengajuanModal
          isOpen={filterModalOpen}
          onClose={onCloseFilterModal}
          onApply={onApplyFilter}
          selectedStatuses={selectedStatuses}
          options={BIDANG2_FILTER_STATUS_OPTIONS}
        />
      )}
    </AppLayout>
  );
};

export default Bidang2PengajuanIndexTemplate;
