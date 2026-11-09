import type { FC, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import AppLayout from './AppLayout';
import FilterPengajuanModal from '../organisms/FilterPengajuanModal';
import RowActionMenu from '../organisms/RowActionMenu';
import CrudTable, { type CrudColumn } from '../organisms/CrudTable';
import { PERENCANAAN_NAV_ITEMS } from '../../pages/Perencanaan/Dashboard';

export interface PerencanaanPengajuanIndexTemplateProps {
  items: any[];
  totalCount: number;
  searchQuery: string;
  selectedStatuses: string[];
  isLoading?: boolean;
  filterModalOpen: boolean;
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  onOpenFilterModal: () => void;
  onCloseFilterModal: () => void;
  onApplyFilter: (statuses: string[]) => void;
}

export const PerencanaanPengajuanIndexTemplate: FC<PerencanaanPengajuanIndexTemplateProps> = ({
  items,
  totalCount,
  searchQuery,
  selectedStatuses,
  isLoading = false,
  filterModalOpen,
  onSearchChange,
  onSearchSubmit,
  onOpenFilterModal,
  onCloseFilterModal,
  onApplyFilter,
}) => {
  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'diajukan' || status === 'menunggu_verifikasi') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F0FF] text-[#2F68D6]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2F68D6]" />
          Diajukan
        </span>
      );
    }
    if (status === 'pengadaan') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#7E22CE]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7E22CE]" />
          Pengadaan
        </span>
      );
    }
    if (status === 'ditolak') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDECEC] text-[#D92D20]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]" />
          Ditolak
        </span>
      );
    }
    if (status === 'selesai' || status === 'disetujui') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#12A06B]" />
          Selesai
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3DC] text-[#9A5B00]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#9A5B00]" />
        Diteruskan
      </span>
    );
  };

  const columns: CrudColumn<any>[] = [
    {
      key: 'nomor_surat',
      header: 'No Permohonan',
      className: 'font-bold text-[#0E7C5A] whitespace-nowrap',
      render: (item) => (
        <Link
          to={`/perencanaan/pengajuan/${item.id}`}
          className="hover:underline"
        >
          {item.nomor_surat || '-'}
        </Link>
      ),
    },
    {
      key: 'judul',
      header: 'Judul Pengadaan',
      className: 'font-bold text-[#14201C]',
      render: (item) => item.judul || '-',
    },
    {
      key: 'created_at',
      header: 'Tanggal',
      className: 'text-[#5F6F6A] whitespace-nowrap',
      render: (item) => formatDate(item.created_at),
    },
    {
      key: 'estimasi_anggaran',
      header: 'Nilai Pengajuan',
      className: 'font-bold text-[#14201C] whitespace-nowrap',
      render: (item) => formatCurrency(item.estimasi_anggaran),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (item) => getStatusBadge(item.status),
    },
  ];

  const toolbar = (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
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
          <span>Filter</span>
          {selectedStatuses.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#0E7C5A] text-white text-[10px] flex items-center justify-center">
              {selectedStatuses.length}
            </span>
          )}
        </button>

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
        {totalCount} permohonan
      </span>
    </>
  );

  return (
    <AppLayout
      activeRoute="pengajuan"
      navItems={PERENCANAAN_NAV_ITEMS}
      roleInitials="PR"
      roleTitle="Perencanaan"
      roleSubtitle="Unit Perencanaan"
      profileHref="/perencanaan/profil"
      notifikasiHref="/perencanaan/notifikasi"
      readAllHref="/perencanaan/notifikasi/read-all"
    >
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="relative z-10 max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 mb-1.5">
            DAFTAR PERMOHONAN
          </p>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
            List Pengajuan
          </h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1.5 leading-relaxed">
            Pantau, cari, dan verifikasi permohonan pengadaan yang masuk dari berbagai unit kerja.
          </p>
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

      {/* Main Table Card using CrudTable */}
      <CrudTable
        title="Daftar Permohonan Pengadaan"
        subtitle="Seluruh permohonan pengadaan yang masuk untuk ditinjau"
        toolbar={toolbar}
        columns={columns}
        rows={items}
        isLoading={isLoading}
        loadingText="Memuat daftar permohonan..."
        emptyTitle="Tidak ada permohonan ditemukan."
        emptyDescription="Coba sesuaikan kata kunci pencarian atau filter status."
        actionsAlign="center"
        renderActions={(item) => (
          <RowActionMenu
            item={item}
            viewHref={`/perencanaan/pengajuan/${item.id}`}
          />
        )}
      />

      <FilterPengajuanModal
        isOpen={filterModalOpen}
        onClose={onCloseFilterModal}
        onApply={onApplyFilter}
        selectedStatuses={selectedStatuses}
      />
    </AppLayout>
  );
};

export default PerencanaanPengajuanIndexTemplate;
