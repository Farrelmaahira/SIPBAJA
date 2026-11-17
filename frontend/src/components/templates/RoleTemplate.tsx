import type { ChangeEvent, FC, ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppLayout from './AppLayout';
import CrudTable from '../organisms/CrudTable';
import Modal from '../organisms/Modal';
import SearchBar from '../molecules/SearchBar';
import FormField from '../molecules/FormField';
import TextInput from '../molecules/TextInput';
import PrimaryButton from '../atoms/PrimaryButton';
import { ADMIN_NAV_ITEMS } from '../../constants/adminNav';

export interface RoleRowItem {
  id: number;
  nama: string;
  permissions_count?: number;
  users_count?: number;
  [key: string]: unknown;
}

const columns = [
  {
    key: 'nama',
    header: 'Nama Peran',
    render: (row: RoleRowItem) => <span className="font-semibold text-[#14201C]">{row.nama}</span>,
  },
  {
    key: 'permissions_count',
    header: 'Jumlah Izin',
    render: (row: RoleRowItem) => `${row.permissions_count ?? 0} izin`,
  },
  {
    key: 'users_count',
    header: 'Jumlah Pengguna',
    render: (row: RoleRowItem) => `${row.users_count ?? 0} akun`,
  },
  {
    key: 'hak_akses',
    header: 'Hak Akses',
    render: (row: RoleRowItem) => (
      <Link
        to={`/admin/role-permission?role_id=${row.id}`}
        className="inline-flex items-center min-h-[44px] text-xs font-semibold text-[#0E7C5A] hover:text-[#0A5C43] hover:underline transition-colors"
      >
        Atur Izin &rarr;
      </Link>
    ),
  },
];

export interface RoleFormData {
  nama: string;
  [key: string]: unknown;
}

export interface RoleTemplateProps {
  rows?: RoleRowItem[];
  pagination?: ReactNode;
  query?: string;
  onQueryChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  modalMode?: 'create' | 'edit' | null;
  form: {
    data: RoleFormData;
    setData: (field: string, value: any) => void;
    errors: Record<string, string>;
    processing?: boolean;
  };
  onOpenCreate?: () => void;
  onOpenEdit?: (row: RoleRowItem) => void;
  onCloseModal: () => void;
  onSubmitForm?: () => void;
  deleteTarget?: RoleRowItem | null;
  onAskDelete?: (row: RoleRowItem) => void;
  onCancelDelete: () => void;
  onConfirmDelete?: () => void;
  isLoading?: boolean;
}

export const RoleTemplate: FC<RoleTemplateProps> = ({
  rows = [],
  pagination = null,
  query = '',
  onQueryChange,
  searchPlaceholder = 'Cari peran...',
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
}) => {
  const { data, setData, errors, processing = false } = form;
  const isEdit = modalMode === 'edit';

  return (
    <AppLayout
      activeRoute="role"
      navItems={ADMIN_NAV_ITEMS}
      roleInitials="AD"
      roleTitle="Administrator"
      roleSubtitle="Panel Admin"
      profileHref="/admin/pengguna"
      notifikasiHref="/admin/dashboard"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#14201C]">Peran</h1>
            <p className="text-sm text-[#5F6F6A] mt-1">
              Kelola peran pengguna dan pembagian wewenang dalam sistem.
            </p>
          </div>
          <PrimaryButton icon={Plus} onClick={onOpenCreate}>
            Tambah Peran
          </PrimaryButton>
        </div>

        <CrudTable
          columns={columns}
          rows={rows}
          toolbar={
            <div className="max-w-md w-full">
              <SearchBar
                value={query}
                onChange={onQueryChange}
                placeholder={searchPlaceholder}
                id="role-table-search"
              />
            </div>
          }
          onEdit={onOpenEdit}
          onDelete={onAskDelete}
          emptyTitle="Belum ada peran"
          emptyDescription="Peran yang ditambahkan akan muncul di sini."
          isLoading={isLoading}
          footer={pagination}
        />

        <Modal
          open={modalMode !== null}
          onClose={onCloseModal}
          title={isEdit ? 'Ubah Peran' : 'Tambah Peran'}
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
                {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Peran'}
              </PrimaryButton>
            </>
          }
        >
          <div className="space-y-4">
            <FormField label="Nama peran" error={errors.nama} htmlFor="role-nama">
              <TextInput
                id="role-nama"
                value={data.nama || ''}
                onChange={(e) => setData('nama', e.target.value)}
                placeholder="cth. Auditor Internal"
                error={errors.nama}
              />
            </FormField>
          </div>
        </Modal>

        <Modal
          open={deleteTarget !== null}
          onClose={onCancelDelete}
          title="Hapus Peran"
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
            Hapus peran <span className="font-semibold text-[#14201C]">{deleteTarget?.nama}</span>?
            Peran tidak dapat dihapus jika masih ada pengguna yang terdaftar dengan peran ini.
          </p>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default RoleTemplate;
