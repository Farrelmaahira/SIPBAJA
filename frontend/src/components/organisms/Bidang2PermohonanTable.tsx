import type { FC, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusPill from '../atoms/StatusPill';
import RowActionMenu from './RowActionMenu';
import { formatRupiah } from '../../utils/formatters';

export interface Bidang2TableItem {
  id: number | string;
  nomor_surat?: string | null;
  nomor_pengadaan?: string | null;
  nomor_permohonan?: string | null;
  judul?: string | null;
  unit_nama?: string | null;
  unit?: { id?: number; nama?: string } | null;
  estimasi_anggaran?: number | string | null;
  nominal?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface Bidang2PaginationInfo {
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}

export interface Bidang2PermohonanTableProps {
  variant?: 'permohonan' | 'pengadaan';
  isFullList?: boolean;
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  rows?: Bidang2TableItem[];
  isLoading?: boolean;
  isError?: boolean;
  onDetail?: (item: Bidang2TableItem) => void;
  // Toolbar props for full list mode
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: (e?: FormEvent) => void;
  onOpenFilter?: () => void;
  activeFilterCount?: number;
  totalCount?: number;
  // Pagination props for full list mode
  pagination?: Bidang2PaginationInfo;
  onPageChange?: (page: number) => void;
}

function SkeletonRow({ isPengadaan }: { isPengadaan: boolean }) {
  return (
    <tr className="border-b border-[#F0F4F2] animate-pulse" aria-hidden="true">
      <td className="py-4 px-4">
        <div className="h-4 w-28 bg-[#EEF5F2] rounded mb-1" />
        {isPengadaan && <div className="h-3 w-20 bg-[#EEF5F2] rounded" />}
      </td>
      <td className="py-4 px-4">
        <div className="h-4 w-48 bg-[#EEF5F2] rounded" />
      </td>
      <td className="py-4 px-4">
        <div className="h-4 w-32 bg-[#EEF5F2] rounded" />
      </td>
      <td className="py-4 px-4">
        <div className="h-4 w-28 bg-[#EEF5F2] rounded" />
      </td>
      <td className="py-4 px-4">
        <div className="h-6 w-28 bg-[#EEF5F2] rounded-full" />
      </td>
      <td className="py-4 px-4 text-center">
        <div className="h-8 w-8 bg-[#EEF5F2] rounded-lg mx-auto" />
      </td>
    </tr>
  );
}

function generatePaginationPages(currentPage: number, lastPage: number): (number | 'ellipsis')[] {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis', lastPage];
  }

  if (currentPage >= lastPage - 2) {
    return [1, 'ellipsis', lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', lastPage];
}

export const Bidang2PermohonanTable: FC<Bidang2PermohonanTableProps> = ({
  variant = 'permohonan',
  isFullList = false,
  title,
  subtitle,
  viewAllHref,
  rows = [],
  isLoading = false,
  isError = false,
  onDetail,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onOpenFilter,
  activeFilterCount = 0,
  totalCount,
  pagination,
  onPageChange,
}) => {
  const isPengadaan = variant === 'pengadaan';

  const defaultTitle = isPengadaan
    ? 'Riwayat Pengadaan Terbaru'
    : isFullList
    ? 'Daftar Permohonan'
    : 'Riwayat Permohonan Terbaru';

  const defaultSubtitle = isPengadaan
    ? '4 pengadaan terakhir yang telah diproses'
    : isFullList
    ? 'Permohonan dan pengajuan yang perlu direview Bidang 2'
    : '4 permohonan terakhir yang telah diproses';

  const defaultHref = isPengadaan ? '/bidang-2/pengadaan' : '/bidang-2/pengajuan';

  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;
  const targetHref = viewAllHref || defaultHref;

  const colFirst = isPengadaan ? 'NO PENGADAAN' : 'NO PERMOHONAN';
  const cols = [colFirst, 'JUDUL PENGADAAN', 'DIAJUKAN OLEH', 'NILAI PENGAJUAN', 'STATUS', 'AKSI'];

  const displayedRows = isFullList ? rows : rows.slice(0, 4);
  const displayTotal = totalCount !== undefined ? totalCount : rows.length;

  const renderStatus = (status?: string | null) => {
    if (isPengadaan) {
      return <StatusPill status="review_pengajuan" label="Review Pengajuan" />;
    }
    const s = String(status || '').toLowerCase();
    if (s === 'disetujui' || s === 'selesai') {
      return <StatusPill status="disetujui" label="Disetujui" />;
    }
    if (s === 'ditolak' || s === 'batal') {
      return <StatusPill status="ditolak" label="Ditolak" />;
    }
    return <StatusPill status="review_permohonan" label="Review Permohonan" />;
  };

  return (
    <section
      className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] overflow-hidden"
      aria-label={displayTitle}
      aria-busy={isLoading || undefined}
    >
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5">
        <div>
          <h2 className="text-base font-bold text-[#14201C] tracking-tight">
            {displayTitle}
          </h2>
          <p className="text-xs text-[#8A9A95] mt-0.5">
            {displaySubtitle}
          </p>
        </div>

        {!isFullList && (
          <Link
            to={targetHref}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E7C5A] hover:underline cursor-pointer self-start sm:self-auto"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Toolbar for Full List mode */}
      {isFullList && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5">
          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenFilter && (
              <button
                type="button"
                onClick={onOpenFilter}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  activeFilterCount > 0
                    ? 'bg-[#E8F5EF] text-[#0E7C5A] border-[#0E7C5A]'
                    : 'bg-white text-[#14201C] border-[#E4EBE8] hover:bg-[#F4F7F5]'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#0E7C5A] text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            {onSearchChange && (
              <form onSubmit={onSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-[#8A9A95] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Cari nomor atau judul..."
                  className="w-64 sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:ring-2 focus:ring-[#0E7C5A] focus:border-transparent outline-none bg-white placeholder-[#8A9A95]"
                />
              </form>
            )}
          </div>

          <span className="text-xs text-[#8A9A95] font-medium self-end sm:self-center">
            {displayTotal} pengajuan
          </span>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#F4F7F5] text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider">
              {cols.map((col, idx) => (
                <th
                  key={col}
                  scope="col"
                  className={`py-3.5 px-4 ${idx === 0 ? 'rounded-l-xl' : ''} ${
                    idx === cols.length - 1 ? 'rounded-r-xl text-center' : ''
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F2] text-xs">
            {isLoading ? (
              Array.from({ length: isFullList ? 6 : 4 }).map((_, i) => (
                <SkeletonRow key={i} isPengadaan={isPengadaan} />
              ))
            ) : isError ? (
              <tr>
                <td colSpan={cols.length} className="py-12 text-center text-[#B42318]">
                  <p className="font-semibold text-sm">Gagal memuat data {isPengadaan ? 'pengadaan' : 'permohonan'}.</p>
                  <p className="text-xs text-[#8A9A95] mt-1">Silakan coba muat ulang halaman.</p>
                </td>
              </tr>
            ) : displayedRows.length === 0 ? (
              <tr>
                <td colSpan={cols.length} className="py-10 text-center text-[#8A9A95]">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F7F5] text-[#8A9A95] flex items-center justify-center mx-auto mb-2">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-xs text-[#14201C]">
                    Belum ada {isPengadaan ? 'pengadaan' : 'permohonan'} ditemukan.
                  </p>
                  {isFullList && (
                    <p className="text-[11px] text-[#8A9A95] mt-0.5">
                      Coba sesuaikan kata kunci pencarian atau filter status.
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              displayedRows.map((row) => {
                const itemHref = isPengadaan
                  ? `/bidang-2/pengadaan/${row.id}`
                  : `/bidang-2/pengajuan/${row.id}`;

                const unitNama =
                  row.unit_nama ||
                  row.unit?.nama ||
                  'Unit Kampus';

                const nominal =
                  row.nominal !== undefined && row.nominal !== null
                    ? Number(row.nominal)
                    : Number(row.estimasi_anggaran || 0);

                const nomorDisplay =
                  row.nomor_surat ||
                  row.nomor_permohonan ||
                  row.nomor_pengadaan ||
                  `0101${row.id}-FF-11`;

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-[#F9FBFA] transition-colors"
                  >
                    {/* Kolom 1: No Pengadaan / No Permohonan */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {isPengadaan ? (
                        <div>
                          <p className="font-bold text-[#14201C]">
                            {row.nomor_pengadaan || `PGD-${String(row.id).padStart(4, '0')}`}
                          </p>
                          <p className="text-[11px] text-[#8A9A95] mt-0.5">
                            {row.nomor_permohonan || `Permohonan #${row.id}`}
                          </p>
                        </div>
                      ) : onDetail ? (
                        <button
                          type="button"
                          onClick={() => onDetail(row)}
                          className="font-bold text-[#0E7C5A] hover:underline cursor-pointer text-left"
                        >
                          {nomorDisplay}
                        </button>
                      ) : (
                        <Link
                          to={itemHref}
                          className="font-bold text-[#0E7C5A] hover:underline"
                        >
                          {nomorDisplay}
                        </Link>
                      )}
                    </td>

                    {/* Kolom 2: Judul Pengadaan */}
                    <td className="py-4 px-4 font-bold text-[#14201C] max-w-xs truncate" title={row.judul || undefined}>
                      {row.judul || 'Tanpa Judul Pengadaan'}
                    </td>

                    {/* Kolom 3: Diajukan Oleh */}
                    <td className="py-4 px-4 text-[#14201C] whitespace-nowrap">
                      {unitNama}
                    </td>

                    {/* Kolom 4: Nilai Pengajuan */}
                    <td className="py-4 px-4 font-bold text-[#14201C] whitespace-nowrap">
                      {formatRupiah(nominal)}
                    </td>

                    {/* Kolom 5: Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {renderStatus(row.status)}
                    </td>

                    {/* Kolom 6: Aksi */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <RowActionMenu
                        item={{ ...row, status: row.status ?? undefined }}
                        viewHref={itemHref}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section for Full List Mode */}
      {isFullList && pagination && !isLoading && !isError && pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-2 border-t border-[#F0F4F2]">
          <p className="text-xs text-[#8A9A95]">
            Menampilkan {pagination.from}–{pagination.to} dari {pagination.total} permohonan
          </p>

          <div className="flex items-center gap-1.5" role="navigation" aria-label="Navigasi Halaman">
            {/* Tombol Sebelumnya */}
            <button
              type="button"
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5F6F6A] hover:bg-[#F4F7F5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Nomor Halaman */}
            {generatePaginationPages(pagination.currentPage, pagination.lastPage).map((p, idx) => {
              if (p === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-8 h-8 flex items-center justify-center text-xs text-[#8A9A95] select-none"
                  >
                    ...
                  </span>
                );
              }
              const isActive = p === pagination.currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange?.(p)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#0E7C5A] text-white shadow-xs'
                      : 'text-[#5F6F6A] hover:bg-[#F4F7F5] hover:text-[#14201C]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {p}
                </button>
              );
            })}

            {/* Tombol Berikutnya */}
            <button
              type="button"
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.lastPage}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5F6F6A] hover:bg-[#F4F7F5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Bidang2PermohonanTable;
