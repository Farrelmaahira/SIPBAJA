import type { FC, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import FilterPermohonanModal from '../../molecules/FilterPermohonanModal';
import TableToolbar from '../../molecules/TableToolbar';
import TableFooter from '../../molecules/TableFooter';
import CrudTable, { type CrudActionItem, type CrudColumn } from '../../organisms/CrudTable';
import Modal from '../../organisms/Modal';
import StatusPill from '../../atoms/StatusPill';
import { PEMOHON_NAV_ITEMS } from '../../../constants/pemohonNav';
import { formatRupiah, formatTanggal } from '../../../utils/formatPermohonan';
import type { PermohonanItem } from '../../../types/permohonan';
import type { ProfilePillUser } from '../../molecules/ProfilePill';

export interface PemohonPermohonanIndexTemplateProps {
  user?: ProfilePillUser | null;
  items: PermohonanItem[];
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  onClearSearch: () => void;
  filterModalOpen: boolean;
  onToggleFilterModal: (open: boolean) => void;
  selectedStatuses: string[];
  onApplyFilters: (statuses: string[]) => void;
  onResetFilters: () => void;
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
    from: number;
    to: number;
  };
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onCreatePermohonan: () => void;
  onView: (item: PermohonanItem) => void;
  onEdit: (item: PermohonanItem) => void;
  onDelete: (item: PermohonanItem) => void;
  deleteTarget: PermohonanItem | null;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  isDeleting?: boolean;
}

export const PemohonPermohonanIndexTemplate: FC<
  PemohonPermohonanIndexTemplateProps
> = ({
  items,
  isLoading,
  hasError,
  errorMessage,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  filterModalOpen,
  onToggleFilterModal,
  selectedStatuses,
  onApplyFilters,
  onResetFilters,
  pagination,
  onPageChange,
  onRetry,
  onCreatePermohonan,
  onView,
  onEdit,
  onDelete,
  deleteTarget,
  onCancelDelete,
  onConfirmDelete,
  isDeleting = false,
}) => {
    const isFilterActive = selectedStatuses.length > 0;

    const columns: CrudColumn<PermohonanItem>[] = [
      {
        key: 'nomor_surat',
        header: 'No Permohonan',
        className: 'font-bold text-[#0E7C5A] whitespace-nowrap',
        render: (item) => (
          <Link
            to={`/pemohon/permohonan/${item.id}`}
            className="hover:underline"
          >
            {item.nomor_surat || '-'}
          </Link>
        ),
      },
      {
        key: 'judul',
        header: 'Judul Permohonan',
        className: 'font-bold text-[#14201C]',
        render: (item) => item.judul || 'Tanpa Judul',
      },
      {
        key: 'created_at',
        header: 'Tanggal',
        className: 'text-[#5F6F6A] whitespace-nowrap',
        render: (item) => formatTanggal(item.created_at),
      },
      {
        key: 'estimasi_anggaran',
        header: 'Nilai Pengajuan',
        className: 'font-bold text-[#14201C] whitespace-nowrap',
        render: (item) => formatRupiah(item.estimasi_anggaran),
      },
      {
        key: 'status',
        header: 'Status',
        className: 'whitespace-nowrap',
        render: (item) => <StatusPill status={item.status} />,
      },
    ];

    const toolbar = (
      <TableToolbar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        searchPlaceholder="Cari nomor atau judul..."
        filterStatusLabel="Filter"
        filterStatusCount={isFilterActive ? 1 : 0}
        onFilterStatusClick={() => onToggleFilterModal(true)}
        total={isLoading ? 'Memuat data...' : `${pagination.total} permohonan`}
      />
    );

    return (
      <AppLayout
        activeRoute="permohonan"
        navItems={PEMOHON_NAV_ITEMS}
        roleInitials="PM"
        roleTitle="Pemohon"
        roleSubtitle="Unit Pemohon"
        profileHref="/pemohon/dashboard"
        notifikasiHref="/pemohon/dashboard"
      >
        <div className="space-y-6">
          <HeroBanner
            eyebrow="DAFTAR PERMOHONAN"
            title="List Permohonan"
            description="Pantau, cari, dan kelola seluruh permohonan pengadaan Anda."
            ctaLabel="Buat Permohonan"
            ctaIcon={Plus}
            onCta={onCreatePermohonan}
          />

          {hasError ? (
            <div className="bg-white rounded-[22px] p-8 border border-[#E4EBE8] text-center">
              <p className="text-sm font-semibold text-[#14201C]">Gagal memuat data permohonan</p>
              <p className="text-xs text-[#5F6F6A] mt-1 mb-4">
                {errorMessage || 'Terjadi gangguan koneksi ke server. Silakan coba kembali.'}
              </p>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center justify-center min-h-[40px] px-4 py-2 rounded-xl bg-[#0E7C5A] text-white text-xs font-semibold hover:bg-[#0A6348] transition-colors cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <CrudTable<PermohonanItem>
              title="Daftar Permohonan"
              subtitle="Seluruh permohonan pengadaan yang Anda ajukan"
              toolbar={toolbar}
              columns={columns}
              rows={items}
              isLoading={isLoading}
              loadingText="Memuat data permohonan..."
              emptyTitle="Tidak ada permohonan ditemukan"
              emptyDescription={
                isFilterActive || searchQuery
                  ? 'Coba sesuaikan kata kunci pencarian atau filter yang dipilih.'
                  : 'Belum ada permohonan yang diajukan oleh unit Anda.'
              }
              actionsAlign="right"
              actions={(item) => {
                const list: CrudActionItem<PermohonanItem>[] = [
                  {
                    key: 'view',
                    label: 'Lihat',
                    icon: Eye,
                    onClick: (r) => onView(r),
                  },
                ];

                if (item.status === 'ditolak') {
                  list.push({
                    key: 'edit',
                    label: 'Revisi',
                    icon: Pencil,
                    onClick: (r) => onEdit(r),
                  });
                }

                const s = (item.status || '').toLowerCase();
                const nonDeletable = [
                  'menunggu_persetujuan',
                  'disetujui',
                  'diproses_ppbj',
                  'pengadaan',
                  'siap_spk',
                  'kontrak_terbit',
                  'berjalan',
                  'barang_diterima',
                  'selesai',
                ];
                if (!nonDeletable.includes(s)) {
                  list.push({
                    key: 'delete',
                    label: 'Batalkan / Hapus',
                    icon: Trash2,
                    variant: 'danger',
                    onClick: (r) => onDelete(r),
                  });
                }

                return list;
              }}
              footer={
                <TableFooter
                  currentPage={pagination.currentPage}
                  lastPage={pagination.lastPage}
                  isLoading={isLoading}
                  onPageChange={onPageChange}
                />
              }
            />
          )}
        </div>

        <FilterPermohonanModal
          isOpen={filterModalOpen}
          onClose={() => onToggleFilterModal(false)}
          selectedStatuses={selectedStatuses}
          onApply={onApplyFilters}
          onReset={onResetFilters}
        />

        <Modal
          open={deleteTarget !== null}
          onClose={onCancelDelete}
          title="Hapus Permohonan"
          footer={
            <>
              <button
                type="button"
                onClick={onCancelDelete}
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl border border-[#E4EBE8] text-sm font-semibold text-[#5F6F6A] hover:bg-[#EEF5F2] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl bg-[#E5484D] hover:bg-[#B42318] text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </>
          }
        >
          <p className="text-sm text-[#5F6F6A]">
            Apakah Anda yakin ingin menghapus permohonan{' '}
            <span className="font-semibold text-[#14201C]">{deleteTarget?.nomor_surat || deleteTarget?.judul}</span>?
            Data dan berkas pendukung yang telah dihapus tidak dapat dipulihkan.
          </p>
        </Modal>
      </AppLayout>
    );
  };

export default PemohonPermohonanIndexTemplate;
