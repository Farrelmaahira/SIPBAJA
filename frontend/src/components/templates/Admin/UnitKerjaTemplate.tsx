import type { ChangeEvent, ReactNode } from 'react';
import { Plus } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import { CrudTable } from '../../organisms/CrudTable';
import { Modal } from '../../organisms/Modal';
import { SearchBar } from '../../molecules/SearchBar';
import { FormField } from '../../molecules/FormField';
import { TextInput } from '../../molecules/TextInput';
import { PrimaryButton } from '../../atoms/PrimaryButton';
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
  deleteTarget?: UnitKerjaItem | null;
  onAskDelete?: (row: UnitKerjaItem) => void;
  onCancelDelete?: () => void;
  onConfirmDelete?: () => void;
  isLoading?: boolean;
}

const columns = [
  {
    key: 'nama',
    header: 'Nama Unit Kerja',
    render: (row: UnitKerjaItem) => <span className="font-semibold text-[#14201C]">{row.nama}</span>,
  },
  {
    key: 'users_count',
    header: 'Jumlah Pengguna',
    render: (row: UnitKerjaItem) => `${row.users_count ?? 0} akun`,
  },
];

export const UnitKerjaTemplate = ({
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
  deleteTarget = null,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
  isLoading = false,
}: UnitKerjaTemplateProps) => {
  const { data, setData, errors, processing } = form;
  const isEdit = modalMode === 'edit';

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
          title='Unit Kerja'
          description='Kelola daftar unit kerja, jurusan, dan bagian di lingkungan kampus.'
          ctaLabel='Tambah Unit Kerja'
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
          onEdit={onOpenEdit}
          onDelete={onAskDelete}
          emptyTitle="Belum ada unit kerja"
          emptyDescription="Unit kerja yang ditambahkan akan muncul di tabel ini."
          isLoading={isLoading}
          footer={pagination}
        />

        <Modal
          open={modalMode !== null}
          onClose={onCloseModal || (() => { })}
          title={isEdit ? 'Ubah Unit Kerja' : 'Tambah Unit Kerja'}
          footer={
            <>
              <button
                type="button"
                onClick={onCloseModal}
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl border border-[#E4EBE8] text-sm font-semibold text-[#5F6F6A] hover:bg-[#EEF5F2] transition-colors cursor-pointer"
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

        <Modal
          open={deleteTarget !== null}
          onClose={onCancelDelete || (() => { })}
          title="Hapus Unit Kerja"
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
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl bg-[#E5484D] hover:bg-[#B42318] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Ya, Hapus
              </button>
            </>
          }
        >
          <p className="text-sm text-[#5F6F6A]">
            Hapus unit kerja <span className="font-semibold text-[#14201C]">{deleteTarget?.nama}</span>?
            Unit ini tidak dapat dihapus jika masih digunakan oleh akun pengguna.
          </p>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default UnitKerjaTemplate;
