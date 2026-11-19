import type { ChangeEvent, FC, ReactNode } from 'react';
import { Plus } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import CrudTable from '../../organisms/CrudTable';
import Modal from '../../organisms/Modal';
import SearchBar from '../../molecules/SearchBar';
import PrimaryButton from '../../atoms/PrimaryButton';
import { ADMIN_NAV_ITEMS } from '../../../constants/adminNav';
import HeroBanner from '@/components/organisms/HeroBanner';
import TableFooter from '@/components/molecules/TableFooter';
import { PaginationMeta } from '@/components/molecules/Pagination';
import { PenggunaFormData } from '@/types/admin';
import { PenggunaForm } from '@/components/organisms/AddPenggunaForm';

export interface UserRowItem {
  id: number;
  nama: string;
  email: string;
  role?: { nama?: string };
  unit?: { nama?: string };
  [key: string]: unknown;
}


export interface AdminPenggunaTemplateForm {
  data: PenggunaFormData;
  setData: (field: string, value: any) => void;
  errors: Record<string, string>;
  processing?: boolean;
}


const columns = [
  {
    key: 'nama',
    header: 'Nama & Email',
    render: (row: UserRowItem) => (
      <div>
        <p className="font-semibold text-[#14201C]">{row.nama}</p>
        <p className="text-xs text-[#8A9A95]">{row.email}</p>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Peran',
    render: (row: UserRowItem) => row.role?.nama ?? '-',
  },
  {
    key: 'unit',
    header: 'Unit Kerja',
    render: (row: UserRowItem) => row.unit?.nama ?? '-',
  },
];

export interface AdminPenggunaTemplateProps {
  rows?: UserRowItem[];
  pagination?: ReactNode;
  roles?: any[];
  units?: any[];
  query?: string;
  paginationMeta: PaginationMeta;
  onPageChange?: (page: number) => void;
  onQueryChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  modalMode?: 'create' | 'edit' | null;
  form: AdminPenggunaTemplateForm;
  onOpenCreate?: () => void;
  onOpenEdit?: (row: UserRowItem) => void;
  onCloseModal: () => void;
  onSubmitForm?: () => void;
  deleteTarget?: UserRowItem | null;
  onAskDelete?: (row: UserRowItem) => void;
  onCancelDelete: () => void;
  onConfirmDelete?: () => void;
  isLoading?: boolean;
}

export const AdminPenggunaTemplate: FC<AdminPenggunaTemplateProps> = ({
  rows = [],
  roles = [],
  units = [],
  query = '',
  paginationMeta,
  onPageChange,
  onQueryChange,
  searchPlaceholder = 'Cari nama atau email...',
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

  const footer = paginationMeta ? (
    <TableFooter
      currentPage={paginationMeta.current_page}
      lastPage={paginationMeta.last_page}
      isLoading={isLoading}
      onPageChange={onPageChange}
    />
  ) : null;
  return (
    <AppLayout
      activeRoute="pengguna"
      navItems={ADMIN_NAV_ITEMS}
      roleInitials="AD"
      roleTitle="Administrator"
      roleSubtitle="Panel Admin"
      profileHref="/admin/pengguna"
      notifikasiHref="/admin/dashboard"
    >
      <div className="space-y-6">
        <HeroBanner
          title="Pengguna"
          description="Kelola akun pengguna dan peran mereka di SIPBAJA."
          ctaLabel="Buat Permohonan"
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
                id="pengguna-table-search"
              />
            </div>
          }
          onEdit={onOpenEdit}
          onDelete={onAskDelete}
          emptyTitle="Belum ada pengguna"
          emptyDescription="Pengguna yang ditambahkan akan ditampilkan di sini."
          isLoading={isLoading}
          footer={footer}
        />

        <Modal
          open={modalMode !== null}
          onClose={onCloseModal}
          title={isEdit ? 'Ubah Pengguna' : 'Tambah Pengguna'}
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
                {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna'}
              </PrimaryButton>
            </>
          }
        >
          <PenggunaForm
            data={data}
            setData={setData}
            errors={errors}
            roles={roles}
            units={units}
            isEdit={isEdit}
          />
        </Modal>

        <Modal
          open={deleteTarget !== null}
          onClose={onCancelDelete}
          title="Hapus Pengguna"
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
            Hapus <span className="font-semibold text-[#14201C]">{deleteTarget?.nama}</span>?
            Riwayat persetujuan dan unggahan yang dibuat akun ini tetap tersimpan.
          </p>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default AdminPenggunaTemplate;
