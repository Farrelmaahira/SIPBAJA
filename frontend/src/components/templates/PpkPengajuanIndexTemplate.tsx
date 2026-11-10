import { type FC, type FormEvent } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
} from 'lucide-react';
import PpLayout, { type PpNavItem } from './PpLayout';
import FilterPengajuanModal, { type FilterOption } from '../organisms/FilterPengajuanModal';
import RowActionMenu from '../organisms/RowActionMenu';
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

export interface PpkPengajuanIndexTemplateProps {
  navItems: PpNavItem[];
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
  const getDetailHref = (row: PpkTableRow): string => {
    if (row.sourceType === 'permohonan' || activeTab === 'permohonan') {
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

  const renderStatusBadge = (status: string) => {
    if (
      status === 'menunggu_persetujuan' ||
      status === 'menunggu_review' ||
      (activeTab === 'permohonan' && status === 'diteruskan')
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3DC] text-[#9A5B00]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
          Menunggu Persetujuan
        </span>
      );
    }
    if (status === 'review_pembayaran' || status === 'diteruskan') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
          Review Pembayaran
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
    if (status === 'selesai') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#12A06B]" />
          Selesai
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#12A06B]" />
        Disetujui
      </span>
    );
  };

  const activeFilterCount =
    selectedStatuses.length + (bulan ? 1 : 0) + (tahun ? 1 : 0);

  return (
    <PpLayout
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
    >
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 mb-1.5">
              PENGAJUAN PENGADAAN
            </p>
            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
              List Pengajuan
            </h1>
            <p className="text-xs sm:text-sm text-white/85 mt-1.5 leading-relaxed">
              Daftar seluruh pengajuan permohonan, pengadaan, dan pembayaran yang masuk untuk PPK.
            </p>
          </div>

          {activeRkakl && (
            <button
              type="button"
              onClick={() => onPreviewRkakl(activeRkakl)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Lihat RKAKL ({activeRkakl.tahun_anggaran || '2026'})</span>
            </button>
          )}
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
        {/* Mode Switcher Tabs: Dokumen Pengadaan vs Persetujuan Awal Permohonan */}
        <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-[#F0F4F2]">
          <button
            type="button"
            onClick={() => onTabChange('pengadaan')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'pengadaan'
                ? 'bg-[#0E7C5A] text-white shadow-xs'
                : 'bg-[#F4F7F5] text-[#5F6F6A] hover:bg-[#E4F6EC] hover:text-[#0E7C5A]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dokumen Pengadaan & Pembayaran</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('permohonan')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'permohonan'
                ? 'bg-[#0E7C5A] text-white shadow-xs'
                : 'bg-[#F4F7F5] text-[#5F6F6A] hover:bg-[#E4F6EC] hover:text-[#0E7C5A]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Persetujuan Awal Permohonan (Dokumen Turunan)</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0F4F2]">
          <div>
            <h2 className="text-base font-bold text-[#14201C]">
              {activeTab === 'permohonan'
                ? 'Daftar Permohonan Menunggu Persetujuan Awal PPK'
                : 'Daftar Pengajuan Masuk'}
            </h2>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              Menampilkan {rows.length} data pengajuan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={bulan}
              onChange={(e) => onBulanChange(e.target.value)}
              aria-label="Filter Bulan"
              className="px-3 py-2 rounded-xl border border-[#E4EBE8] text-xs font-medium text-[#5F6F6A] bg-[#FAFDFB] focus:outline-none focus:ring-1 focus:ring-[#0E7C5A]"
            >
              <option value="">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>

            <select
              value={tahun}
              onChange={(e) => onTahunChange(e.target.value)}
              aria-label="Filter Tahun"
              className="px-3 py-2 rounded-xl border border-[#E4EBE8] text-xs font-medium text-[#5F6F6A] bg-[#FAFDFB] focus:outline-none focus:ring-1 focus:ring-[#0E7C5A]"
            >
              <option value="">Semua Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>

            <button
              type="button"
              onClick={onOpenFilter}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                activeFilterCount > 0
                  ? 'border-[#0E7C5A] bg-[#E4F6EC] text-[#0E7C5A]'
                  : 'border-[#E4EBE8] hover:bg-[#F4F7F5] text-[#5F6F6A]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter Status</span>
              {selectedStatuses.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0E7C5A] text-white text-[10px] flex items-center justify-center">
                  {selectedStatuses.length}
                </span>
              )}
            </button>

            <form onSubmit={onSearchSubmit} className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-[#8A9A95] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari nomor atau judul..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E4EBE8] text-xs bg-[#FAFDFB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E7C5A]"
              />
            </form>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EEF3F0] border-b border-[#E2EAE6] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                <th className="py-3.5 px-6">NOMOR SURAT</th>
                <th className="py-3.5 px-4">JUDUL PENGADAAN</th>
                <th className="py-3.5 px-4">UNIT PEMOHON</th>
                <th className="py-3.5 px-4">TANGGAL</th>
                <th className="py-3.5 px-4">NOMINAL</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-6 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8A9A95]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-[#5F6F6A]">Memuat data pengajuan PPK...</p>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8A9A95]">
                    Tidak ada pengajuan ditemukan.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={`${row.sourceType ?? activeTab}-${row.id}`} className="hover:bg-[#FAFDFB] transition">
                    <td className="py-4 px-6 font-bold text-[#0E7C5A]">{row.nomor_surat}</td>
                    <td className="py-4 px-4 font-bold text-[#14201C]">{row.judul}</td>
                    <td className="py-4 px-4 text-[#5F6F6A]">{row.unit}</td>
                    <td className="py-4 px-4 text-[#5F6F6A]">{formatTanggal(row.tanggal)}</td>
                    <td className="py-4 px-4 font-bold text-[#14201C]">{formatRupiah(row.nominal)}</td>
                    <td className="py-4 px-4">{renderStatusBadge(row.status)}</td>
                    <td className="py-4 px-6 text-center">
                      <RowActionMenu viewHref={getDetailHref(row)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between pt-5 mt-4 border-t border-[#F0F4F2] text-xs text-[#5F6F6A]">
            <span>
              Halaman <strong>{meta.current_page}</strong> dari <strong>{meta.last_page}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={meta.current_page <= 1}
                onClick={() => onPageChange(meta.current_page - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E4EBE8] hover:bg-[#F4F7F5] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
              <button
                type="button"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => onPageChange(meta.current_page + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E4EBE8] hover:bg-[#F4F7F5] disabled:opacity-40 cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <FilterPengajuanModal
        isOpen={filterOpen}
        onClose={onCloseFilter}
        selectedStatuses={selectedStatuses}
        onApplyFilter={onApplyFilter}
        options={PPK_FILTER_OPTIONS}
      />
    </PpLayout>
  );
};

export default PpkPengajuanIndexTemplate;
