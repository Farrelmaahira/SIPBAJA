import type { FC, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, Loader2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from './AppLayout';
import FilterPengajuanModal from '../organisms/FilterPengajuanModal';
import RowActionMenu from '../organisms/RowActionMenu';
import { PERENCANAAN_NAV_ITEMS } from '../../pages/Perencanaan/Dashboard';
import type { PermohonanTerbaruItem } from '../../types/perencanaan';

export interface PerencanaanPengajuanIndexTemplateProps {
  items: PermohonanTerbaruItem[];
  totalCount: number;
  searchQuery: string;
  selectedStatuses: string[];
  selectedBulan?: string;
  selectedTahun?: string;
  currentPage?: number;
  lastPage?: number;
  isLoading?: boolean;
  errorMessage?: string;
  filterModalOpen: boolean;
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  onBulanChange?: (bulan: string) => void;
  onTahunChange?: (tahun: string) => void;
  onPageChange?: (page: number) => void;
  onOpenFilterModal: () => void;
  onCloseFilterModal: () => void;
  onApplyFilter: (statuses: string[]) => void;
}

const BULAN_OPTIONS = [
  { value: '', label: 'Semua Bulan' },
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

export const PerencanaanPengajuanIndexTemplate: FC<PerencanaanPengajuanIndexTemplateProps> = ({
  items,
  totalCount,
  searchQuery,
  selectedStatuses,
  selectedBulan = '',
  selectedTahun = '',
  currentPage = 1,
  lastPage = 1,
  isLoading = false,
  errorMessage = '',
  filterModalOpen,
  onSearchChange,
  onSearchSubmit,
  onBulanChange,
  onTahunChange,
  onPageChange,
  onOpenFilterModal,
  onCloseFilterModal,
  onApplyFilter,
}) => {
  const currentYear = new Date().getFullYear();
  const tahunOptions = ['', String(currentYear), String(currentYear - 1), String(currentYear - 2)];

  const formatCurrency = (val?: number | string) => {
    const numVal = typeof val === 'string' ? Number(val) : val || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number.isNaN(numVal) ? 0 : numVal);
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
    if (status === 'diajukan' || status === 'menunggu_verifikasi' || status === 'menunggu_persetujuan') {
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
      flash={errorMessage ? { error: errorMessage } : undefined}
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

      {/* Main Table Card */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#14201C]">Daftar Permohonan Pengadaan</h3>
          <p className="text-xs text-[#8A9A95] mt-0.5">
            Seluruh permohonan pengadaan yang masuk untuk ditinjau
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
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
              <span>Filter Status</span>
              {selectedStatuses.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0E7C5A] text-white text-[10px] flex items-center justify-center">
                  {selectedStatuses.length}
                </span>
              )}
            </button>

            {onBulanChange && (
              <select
                value={selectedBulan}
                onChange={(e) => onBulanChange(e.target.value)}
                aria-label="Filter Bulan"
                className="px-3.5 py-2.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#14201C] bg-white focus:ring-2 focus:ring-[#0E7C5A] outline-none cursor-pointer"
              >
                {BULAN_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            )}

            {onTahunChange && (
              <select
                value={selectedTahun}
                onChange={(e) => onTahunChange(e.target.value)}
                aria-label="Filter Tahun"
                className="px-3.5 py-2.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#14201C] bg-white focus:ring-2 focus:ring-[#0E7C5A] outline-none cursor-pointer"
              >
                {tahunOptions.map((t) => (
                  <option key={t} value={t}>
                    {t ? `Tahun ${t}` : 'Semua Tahun'}
                  </option>
                ))}
              </select>
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
            {totalCount} permohonan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EEF3F0] text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider">
                <th className="py-3.5 px-4 rounded-l-xl">No Permohonan</th>
                <th className="py-3.5 px-4">Judul Pengadaan</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Nilai Pengajuan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8A9A95]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 border-2 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-[#5F6F6A]">Memuat daftar permohonan...</p>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8A9A95]">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-[#C5D2CD]" />
                    <p className="text-xs font-bold text-[#5F6F6A]">Tidak ada permohonan ditemukan.</p>
                    <p className="text-[11px] text-[#8A9A95] mt-0.5">
                      Coba sesuaikan kata kunci pencarian atau filter status.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F9FBFA] transition-colors">
                    <td className="py-4 px-4 font-bold text-[#0E7C5A] whitespace-nowrap">
                      <Link
                        to={`/perencanaan/pengajuan/${item.id}`}
                        className="hover:underline"
                      >
                        {item.nomor_surat || '-'}
                      </Link>
                    </td>
                    <td className="py-4 px-4 font-bold text-[#14201C]">
                      {item.judul || '-'}
                    </td>
                    <td className="py-4 px-4 text-[#5F6F6A] whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#14201C] whitespace-nowrap">
                      {formatCurrency(item.estimasi_anggaran)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <RowActionMenu
                        item={item}
                        viewHref={`/perencanaan/pengajuan/${item.id}`}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && onPageChange && (
          <div className="flex items-center justify-between pt-5 mt-4 border-t border-[#F0F4F2]">
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
        )}
      </div>

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
