import type { ChangeEvent, FC, ReactNode } from 'react';
import { Plus, Pencil, ToggleRight, ToggleLeft } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import { CrudTable, type CrudColumn, type CrudActionItem } from '../../organisms/CrudTable';
import { Modal } from '../../organisms/Modal';
import { SearchBar } from '../../molecules/SearchBar';
import { FormField } from '../../molecules/FormField';
import { TextInput } from '../../molecules/TextInput';
import { PrimaryButton } from '../../atoms/PrimaryButton';
import { StatusPill } from '../../atoms/StatusPill';
import { HeroBanner } from '../../organisms/HeroBanner';
import { ADMIN_NAV_ITEMS } from '../../../constants/adminNav';
import type { AdminMetodePengadaanItem, MetodePengadaanFormData } from '../../../types/admin';

export interface AdminMetodePengadaanTemplateProps {
  rows?: AdminMetodePengadaanItem[];
  pagination?: ReactNode;
  query?: string;
  onQueryChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  modalMode?: 'create' | 'edit' | null;
  form: {
    data: MetodePengadaanFormData;
    setData: (field: string, value: any) => void;
    errors: Record<string, string | undefined>;
    processing?: boolean;
  };
  onOpenCreate?: () => void;
  onOpenEdit?: (row: AdminMetodePengadaanItem) => void;
  onCloseModal?: () => void;
  onSubmitForm?: () => void;
  toggleTarget?: AdminMetodePengadaanItem | null;
  onAskToggle?: (row: AdminMetodePengadaanItem) => void;
  onCancelToggle?: () => void;
  onConfirmToggle?: () => void;
  isToggling?: boolean;
  isLoading?: boolean;
}

const columns: CrudColumn<AdminMetodePengadaanItem>[] = [
  {
    key: 'nama',
    header: 'Nama Metode Pengadaan',
    render: (row) => (
      <div>
        <span className="font-semibold text-[#14201C] block">{row.nama}</span>
        <span className="text-[11px] text-[#8A9A95]">ID #{row.id}</span>
      </div>
    ),
  },
  {
    key: 'pengadaan_count',
    header: 'Penggunaan',
    render: (row) => (
      <span className="text-xs text-[#5F6F6A] font-medium">
        {row.pengadaan_count ?? 0} paket pengadaan
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <StatusPill
        status={row.isActive ? 'aktif' : 'nonaktif'}
        label={row.isActive ? 'Aktif' : 'Nonaktif'}
      />
    ),
  },
];

export const AdminMetodePengadaanTemplate: FC<AdminMetodePengadaanTemplateProps> = ({
  rows = [],
  pagination = null,
  query = '',
  onQueryChange,
  searchPlaceholder = 'Cari metode pengadaan...',
  modalMode = null,
  form,
  onOpenCreate,
  onOpenEdit,
  onCloseModal,
  onSubmitForm,
  toggleTarget = null,
  onAskToggle,
  onCancelToggle,
  onConfirmToggle,
  isToggling = false,
  isLoading = false,
}) => {
  const { data, setData, errors, processing } = form;
  const isEdit = modalMode === 'edit';

  const tableActions = (row: AdminMetodePengadaanItem): CrudActionItem<AdminMetodePengadaanItem>[] => [
    {
      key: 'edit',
      label: 'Edit',
      icon: Pencil,
      onClick: () => onOpenEdit?.(row),
    },
    {
      key: 'toggle-status',
      label: row.isActive ? 'Nonaktifkan' : 'Aktifkan',
      icon: row.isActive ? ToggleRight : ToggleLeft,
      variant: row.isActive ? 'danger' : 'default',
      onClick: () => onAskToggle?.(row),
    },
  ];

  return (
    <AppLayout
      activeRoute="metode-pengadaan"
      navItems={ADMIN_NAV_ITEMS}
      roleInitials="AD"
      roleTitle="Administrator"
      roleSubtitle="Panel Admin"
      profileHref="/admin/pengguna"
      notifikasiHref="/admin/dashboard"
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="MASTER DATA"
          title="Metode Pengadaan"
          description="Kelola metode pengadaan barang dan jasa yang dapat dipilih oleh PPBJ."
          ctaLabel="Tambah Metode"
          ctaIcon={Plus}
          onCta={onOpenCreate}
        />

        <CrudTable
          columns={columns}
          rows={rows}
          toolbar={
            <div className="max-w-md w-full">
              <SearchBar
                value={query}
                onChange={onQueryChange}
                placeholder={searchPlaceholder}
                id="metode-pengadaan-table-search"
              />
            </div>
          }
          actions={tableActions}
          emptyTitle="Belum ada metode pengadaan"
          emptyDescription="Metode pengadaan yang ditambahkan akan muncul di tabel ini."
          isLoading={isLoading}
          footer={pagination}
        />

        {/* Modal Form Tambah / Edit */}
        <Modal
          open={modalMode !== null}
          onClose={onCloseModal || (() => {})}
          title={isEdit ? 'Edit Metode Pengadaan' : 'Tambah Metode Pengadaan'}
          footer={
            <>
              <button
                type="button"
                onClick={onCloseModal}
                disabled={processing}
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl border border-[#E4EBE8] text-sm font-semibold text-[#5F6F6A] hover:bg-[#EEF5F2] transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <PrimaryButton onClick={onSubmitForm} disabled={processing}>
                {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Metode'}
              </PrimaryButton>
            </>
          }
        >
          <div className="space-y-4">
            <FormField label="Nama Metode Pengadaan" error={errors.nama} htmlFor="metode-pengadaan-nama">
              <TextInput
                id="metode-pengadaan-nama"
                value={data.nama || ''}
                onChange={(e) => setData('nama', e.target.value)}
                placeholder="cth. E-Purchasing, Tender, Pengadaan Langsung"
                error={errors.nama}
              />
            </FormField>
          </div>
        </Modal>

        {/* Modal Konfirmasi Nonaktifkan / Aktifkan */}
        <Modal
          open={toggleTarget !== null}
          onClose={onCancelToggle || (() => {})}
          title={toggleTarget?.isActive ? 'Nonaktifkan Metode Pengadaan' : 'Aktifkan Metode Pengadaan'}
          footer={
            <>
              <button
                type="button"
                onClick={onCancelToggle}
                disabled={isToggling}
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl border border-[#E4EBE8] text-sm font-semibold text-[#5F6F6A] hover:bg-[#EEF5F2] transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              {toggleTarget?.isActive ? (
                <button
                  type="button"
                  onClick={onConfirmToggle}
                  disabled={isToggling}
                  className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl bg-[#E5484D] hover:bg-[#B42318] text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isToggling ? 'Menonaktifkan...' : 'Ya, Nonaktifkan'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onConfirmToggle}
                  disabled={isToggling}
                  className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl bg-[#0E7C5A] hover:bg-[#09573E] text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isToggling ? 'Mengaktifkan...' : 'Ya, Aktifkan'}
                </button>
              )}
            </>
          }
        >
          <p className="text-sm text-[#5F6F6A] leading-relaxed">
            {toggleTarget?.isActive ? (
              <>
                Apakah Anda yakin ingin menonaktifkan metode pengadaan{' '}
                <span className="font-semibold text-[#14201C]">{toggleTarget?.nama}</span>?
                Metode yang dinonaktifkan tidak akan muncul pada daftar pilihan saat PPBJ menyusun paket pengadaan.
              </>
            ) : (
              <>
                Apakah Anda yakin ingin mengaktifkan kembali metode pengadaan{' '}
                <span className="font-semibold text-[#14201C]">{toggleTarget?.nama}</span>?
                Metode ini akan kembali tersedia dalam pilihan penyusunan pengadaan oleh PPBJ.
              </>
            )}
          </p>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default AdminMetodePengadaanTemplate;
