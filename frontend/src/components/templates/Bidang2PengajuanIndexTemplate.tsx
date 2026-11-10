import type { FC, FormEvent } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Search,
  Download,
  Eye,
  AlertCircle,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import StatusPill from '../atoms/StatusPill';
import { formatRupiah, formatTanggal, labelStatusPermohonan } from '../../utils/formatPermohonan';
import type { Bidang2PengajuanListItem } from '../../types/bidang2';
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

const STATUS_TABS = [
  { key: 'semua', label: 'Semua Status' },
  { key: 'diajukan', label: 'Diajukan' },
  { key: 'menunggu_bidang2', label: 'Menunggu Persetujuan' },
  { key: 'disetujui', label: 'Disetujui' },
  { key: 'ditolak', label: 'Ditolak' },
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
  selectedStatus: string;
  onStatusChange: (status: string) => void;
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
  hasError,
  errorMessage,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedStatus,
  onStatusChange,
  pagination,
  onPageChange,
  onViewDetail,
  onDownloadDokumen,
  onRetry,
}) => {
  const sidebarProps = {
    navItems: NAV_ITEMS,
    activeRoute: 'pengajuan',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'Menu',
  };

  const topbarProps = {
    user,
  };

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#14201C] tracking-tight">
            Daftar Pengajuan Permohonan
          </h1>
          <p className="text-sm text-[#5F6F6A] mt-1">
            Daftar pengajuan permohonan pengadaan barang dan jasa dari seluruh unit kampus.
          </p>
        </div>

        <div className="bg-white border border-[#E4EBE8] rounded-[18px] p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter status pengajuan">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onStatusChange(tab.key)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    selectedStatus === tab.key
                      ? 'bg-[#0E7C5A] text-white shadow-xs'
                      : 'bg-[#F2F6F4] text-[#5F6F6A] hover:bg-[#E4ECE8] hover:text-[#14201C]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={onSearchSubmit} className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-[#8A9A95] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari nomor atau judul..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E4EBE8] bg-[#FAFCFB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] text-[#14201C]"
              />
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-[#E4EBE8] text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider bg-[#F9FBFA]">
                  <th className="py-3 px-4">No Permohonan</th>
                  <th className="py-3 px-4">Judul Pengadaan</th>
                  <th className="py-3 px-4">Unit Asal</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nilai Anggaran</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EBE8]">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-[#5F6F6A]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-[#5F6F6A]">Memuat data pengajuan...</p>
                      </div>
                    </td>
                  </tr>
                ) : hasError ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#FDECEC] text-[#B42318] flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-[#14201C]">
                        Gagal memuat data pengajuan
                      </p>
                      <p className="text-xs text-[#5F6F6A] mt-1 mb-4">
                        {errorMessage || 'Terjadi gangguan koneksi ke server.'}
                      </p>
                      {onRetry && (
                        <button
                          type="button"
                          onClick={onRetry}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#0E7C5A] text-white text-xs font-semibold hover:bg-[#0A6348] transition-colors cursor-pointer"
                        >
                          Coba Lagi
                        </button>
                      )}
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-[#5F6F6A]">
                      <div className="w-12 h-12 rounded-2xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center mx-auto mb-3">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-[#14201C]">
                        Tidak ada pengajuan ditemukan
                      </p>
                      <p className="text-xs text-[#5F6F6A] mt-1">
                        Tidak ada pengajuan yang sesuai dengan filter atau kata kunci pencarian.
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((row) => {
                    const { label, variant } = labelStatusPermohonan(row.status);
                    const hasDokumen = Boolean(row.dokumen || (row as any).file_dokumen);

                    return (
                      <tr key={row.id} className="hover:bg-[#F9FBFA] transition-colors">
                        <td className="py-3.5 px-4 text-xs font-semibold text-[#0E7C5A]">
                          {row.nomor_surat || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-[#14201C] max-w-xs truncate">
                          {row.judul || 'Tanpa Judul'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#5F6F6A]">
                          {row.unit_nama || (row as any).unit?.nama || 'Unit Kampus'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#5F6F6A] whitespace-nowrap">
                          {formatTanggal(row.created_at || row.tanggal_pengajuan)}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-[#14201C] whitespace-nowrap">
                          {formatRupiah(row.estimasi_anggaran)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusPill status={variant} label={label} />
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onViewDetail(row.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0E7C5A] bg-[#E8F5F1] hover:bg-[#D4EFE6] rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Permohonan"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>
                          {hasDokumen && onDownloadDokumen && (
                            <button
                              type="button"
                              onClick={() => onDownloadDokumen(row.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#5F6F6A] bg-[#F2F6F4] hover:bg-[#E4ECE8] rounded-lg transition-colors cursor-pointer"
                              title="Unduh Berkas Surat"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && !hasError && pagination.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E4EBE8]">
              <p className="text-xs text-[#5F6F6A]">
                Menampilkan{' '}
                <span className="font-semibold text-[#14201C]">{pagination.from}</span> sampai{' '}
                <span className="font-semibold text-[#14201C]">{pagination.to}</span> dari{' '}
                <span className="font-semibold text-[#14201C]">{pagination.total}</span> pengajuan
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#E4EBE8] text-[#14201C] hover:bg-[#F3F6F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 text-xs font-semibold text-[#14201C]">
                  Halaman {pagination.currentPage} dari {pagination.lastPage}
                </span>

                <button
                  type="button"
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.lastPage}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#E4EBE8] text-[#14201C] hover:bg-[#F3F6F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShellTemplate>
  );
};

export default Bidang2PengajuanIndexTemplate;

