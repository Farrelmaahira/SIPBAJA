import type { ChangeEvent, FC, ReactNode } from 'react';
import { Plus, Pencil, ToggleRight, ToggleLeft } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import { CrudTable, type CrudActionItem, type CrudColumn } from '../../organisms/CrudTable';
import { Modal } from '../../organisms/Modal';
import { SearchBar } from '../../molecules/SearchBar';
import { FormField } from '../../molecules/FormField';
import { TextInput } from '../../molecules/TextInput';
import { PrimaryButton } from '../../atoms/PrimaryButton';
import { StatusPill } from '../../atoms/StatusPill';
import { ADMIN_NAV_ITEMS } from '../../../constants/adminNav';
import { UnitKerjaFormState, UnitKerjaItem } from '@/types/admin';
import HeroBanner from '@/components/organisms/HeroBanner';

export interface UnitKerjaTemplateProps {
  rows?: UnitKerjaItem[];
  pagination?: ReactNode;
  query?: string;
  onQueryChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  modalMode?: 'create' | 'edit' | null;
  form: UnitKerjaFormState;
  onOpenCreate?: () => void;
  onOpenEdit?: (row: UnitKerjaItem) => void;
  onCloseModal?: () => void;
  onSubmitForm?: () => void;
  toggleTarget?: UnitKerjaItem | null;
  onAskToggle?: (row: UnitKerjaItem) => void;
  onCancelToggle?: () => void;
  onConfirmToggle?: () => void;
  isToggling?: boolean;
  isLoading?: boolean;
}

const columns: CrudColumn<UnitKerjaItem>[] = [
  {
    key: 'nama',
    header: 'Nama Unit Kerja',
    render: (row: UnitKerjaItem) => <span className="font-semibold text-[#14201C]">{row.nama}</span>,
  },
  {
    key: 'users_count',
    header: 'Jumlah Pengguna',
    render: (row: UnitKerjaItem) => (
      <span className="text-xs text-[#5F6F6A] font-medium">{row.users_count ?? 0} akun</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row: UnitKerjaItem) => {
      const active = row.isActive ?? (row.status === 'aktif');
      return (
        <StatusPill
          status={active ? 'aktif' : 'nonaktif'}
          label={active ? 'Aktif' : 'Nonaktif'}
        />
      );
    },
  },
];

export const UnitKerjaTemplate: FC<UnitKerjaTemplateProps> = ({
  rows = [],
  pagination = null,
  query = '',
  onQueryChange,
  searchPlaceholder = 'Cari unit kerja...',
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

  const tableActions = (row: UnitKerjaItem): CrudActionItem<UnitKerjaItem>[] => {
    const active = row.isActive ?? (row.status === 'aktif');
    return [
      {
        key: 'edit',
        label: 'Edit',
        icon: Pencil,
        onClick: () => onOpenEdit?.(row),
      },
      {
        key: 'toggle-status',
        label: active ? 'Nonaktifkan' : 'Aktifkan',
        icon: active ? ToggleRight : ToggleLeft,
        variant: active ? 'danger' : 'default',
        onClick: () => onAskToggle?.(row),
      },
    ];
  };

  return (
    <AppLayout
      activeRoute="unit-kerja"
      navItems={ADMIN_NAV_ITEMS}
      roleInitials="AD"
      roleTitle="Administrator"
      roleSubtitle="Panel Admin"
      profileHref="/admin/pengguna"
      notifikasiHref="/admin/dashboard"
    >
      <div className="space-y-6">
        <HeroBanner
          title="Unit Kerja"
          description="Kelola daftar unit kerja, jurusan, dan bagian di lingkungan kampus."
          ctaLabel="Tambah Unit Kerja"
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
                id="unit-kerja-table-search"
              />
            </div>
          }
          actions={tableActions}
          emptyTitle="Belum ada unit kerja"
          emptyDescription="Unit kerja yang ditambahkan akan muncul di tabel ini."
          isLoading={isLoading}
          footer={pagination}
        />

        <Modal
          open={modalMode !== null}
          onClose={onCloseModal || (() => {})}
          title={isEdit ? 'Edit Unit Kerja' : 'Tambah Unit Kerja'}
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
                {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Unit Kerja'}
              </PrimaryButton>
            </>
          }
        >
          <div className="space-y-4">
            <FormField label="Nama unit kerja" error={errors.nama} htmlFor="unit-kerja-nama">
              <TextInput
                id="unit-kerja-nama"
                value={data.nama || ''}
                onChange={(e) => setData('nama', e.target.value)}
                placeholder="cth. Bagian Keuangan"
                error={errors.nama}
              />
            </FormField>
          </div>
        </Modal>

        {/* Modal Konfirmasi Nonaktifkan / Aktifkan */}
        <Modal
          open={toggleTarget !== null}
          onClose={onCancelToggle || (() => {})}
          title={
            (toggleTarget?.isActive ?? toggleTarget?.status === 'aktif')
              ? 'Nonaktifkan Unit Kerja'
              : 'Aktifkan Unit Kerja'
          }
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
              {(toggleTarget?.isActive ?? toggleTarget?.status === 'aktif') ? (
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
            {(toggleTarget?.isActive ?? toggleTarget?.status === 'aktif') ? (
              <>
                Apakah Anda yakin ingin menonaktifkan unit kerja{' '}
                <span className="font-semibold text-[#14201C]">{toggleTarget?.nama}</span>?
                Unit kerja yang dinonaktifkan tidak akan dapat dipilih untuk pengajuan atau pendaftaran pengguna baru.
              </>
            ) : (
              <>
                Apakah Anda yakin ingin mengaktifkan kembali unit kerja{' '}
                <span className="font-semibold text-[#14201C]">{toggleTarget?.nama}</span>?
                Unit kerja akan kembali aktif dan dapat dipilih di sistem.
              </>
            )}
          </p>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default UnitKerjaTemplate;
