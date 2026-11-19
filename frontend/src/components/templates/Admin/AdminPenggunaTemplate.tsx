import type { ChangeEvent, FC, ReactNode } from 'react';
import { Plus, Pencil, ToggleRight, ToggleLeft } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import { CrudTable, type CrudActionItem, type CrudColumn } from '../../organisms/CrudTable';
import Modal from '../../organisms/Modal';
import SearchBar from '../../molecules/SearchBar';
import PrimaryButton from '../../atoms/PrimaryButton';
import StatusPill from '../../atoms/StatusPill';
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
  isActive?: boolean;
  status?: 'aktif' | 'nonaktif' | string;
  [key: string]: unknown;
}

export interface AdminPenggunaTemplateForm {
  data: PenggunaFormData;
  setData: (field: string, value: any) => void;
  errors: Record<string, string>;
  processing?: boolean;
}

const columns: CrudColumn<UserRowItem>[] = [
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
    render: (row: UserRowItem) => (
      <span className="text-xs text-[#5F6F6A] font-medium">{row.role?.nama ?? '-'}</span>
    ),
  },
  {
    key: 'unit',
    header: 'Unit Kerja',
    render: (row: UserRowItem) => (
      <span className="text-xs text-[#5F6F6A] font-medium">{row.unit?.nama ?? '-'}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row: UserRowItem) => {
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
  toggleTarget?: UserRowItem | null;
  onAskToggle?: (row: UserRowItem) => void;
  onCancelToggle?: () => void;
  onConfirmToggle?: () => void;
  isToggling?: boolean;
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
  toggleTarget = null,
  onAskToggle,
  onCancelToggle,
  onConfirmToggle,
  isToggling = false,
  isLoading = false,
}) => {
  const { data, setData, errors, processing = false } = form;
  const isEdit = modalMode === 'edit';

  const tableActions = (row: UserRowItem): CrudActionItem<UserRowItem>[] => {
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
          ctaLabel="Tambah Pengguna"
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
          actions={tableActions}
          emptyTitle="Belum ada pengguna"
          emptyDescription="Pengguna yang ditambahkan akan ditampilkan di sini."
          isLoading={isLoading}
          footer={footer}
        />

        <Modal
          open={modalMode !== null}
          onClose={onCloseModal}
          title={isEdit ? 'Edit Pengguna' : 'Tambah Pengguna'}
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

        {/* Modal Konfirmasi Nonaktifkan / Aktifkan */}
        <Modal
          open={toggleTarget !== null}
          onClose={onCancelToggle || (() => {})}
          title={
            (toggleTarget?.isActive ?? toggleTarget?.status === 'aktif')
              ? 'Nonaktifkan Pengguna'
              : 'Aktifkan Pengguna'
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
                Apakah Anda yakin ingin menonaktifkan pengguna{' '}
                <span className="font-semibold text-[#14201C]">{toggleTarget?.nama}</span>?
                Pengguna yang dinonaktifkan tidak akan dapat login ke dalam sistem SIPBAJA.
              </>
            ) : (
              <>
                Apakah Anda yakin ingin mengaktifkan kembali pengguna{' '}
                <span className="font-semibold text-[#14201C]">{toggleTarget?.nama}</span>?
                Pengguna akan dapat kembali login dan mengakses sistem sesuai perannya.
              </>
            )}
          </p>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default AdminPenggunaTemplate;
