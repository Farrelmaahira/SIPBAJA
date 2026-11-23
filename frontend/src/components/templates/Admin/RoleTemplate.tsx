import type { ChangeEvent, FC, ReactNode } from 'react';
import { Plus, Pencil, ToggleRight, ToggleLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppLayout from '../General/AppLayout';
import { CrudTable, type CrudActionItem, type CrudColumn } from '../../organisms/CrudTable';
import { Modal } from '../../organisms/Modal';
import { SearchBar } from '../../molecules/SearchBar';
import { FormField } from '../../molecules/FormField';
import { TextInput } from '../../molecules/TextInput';
import { PrimaryButton } from '../../atoms/PrimaryButton';
import { StatusPill } from '../../atoms/StatusPill';
import { ADMIN_NAV_ITEMS } from '../../../constants/adminNav';
import { RoleRowItem } from '@/types/admin';
import HeroBanner from '@/components/organisms/HeroBanner';

const columns: CrudColumn<RoleRowItem>[] = [
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
    key: 'status',
    header: 'Status',
    render: (row: RoleRowItem) => {
      const active = row.isActive ?? (row.status === 'aktif');
      return (
        <StatusPill
          status={active ? 'aktif' : 'nonaktif'}
          label={active ? 'Aktif' : 'Nonaktif'}
        />
      );
    },
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
  toggleTarget?: RoleRowItem | null;
  onAskToggle?: (row: RoleRowItem) => void;
  onCancelToggle: () => void;
  onConfirmToggle?: () => void;
  isToggling?: boolean;
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
  toggleTarget = null,
  onAskToggle,
  onCancelToggle,
  onConfirmToggle,
  isToggling = false,
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
        <HeroBanner
          title="Peran"
          description="Kelola peran pengguna dan pembagian wewenang dalam sistem."
          ctaLabel="Tambah Peran"
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
                id="role-table-search"
              />
            </div>
          }
          actions={(row: RoleRowItem) => {
            const active = row.isActive ?? (row.status === 'aktif');
            const items: CrudActionItem<RoleRowItem>[] = [
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
                onClick: () => onAskToggle?.(row),
                variant: active ? 'danger' : 'default',
              },
            ];
            return items;
          }}
          emptyTitle="Belum ada peran"
          emptyDescription="Peran yang ditambahkan akan muncul di sini."
          isLoading={isLoading}
          footer={pagination}
        />

        <Modal
          open={modalMode !== null}
          onClose={onCloseModal}
          title={isEdit ? 'Edit Peran' : 'Tambah Peran'}
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
          open={toggleTarget !== null}
          onClose={onCancelToggle}
          title={
            (toggleTarget?.isActive ?? toggleTarget?.status === 'aktif')
              ? 'Nonaktifkan Peran'
              : 'Aktifkan Peran'
          }
          footer={
            <>
              <button
                type="button"
                onClick={onCancelToggle}
                disabled={isToggling}
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl border border-[#E4EBE8] text-sm font-semibold text-[#5F6F6A] hover:bg-[#EEF5F2] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirmToggle}
                disabled={isToggling}
                className={`inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl text-white text-sm font-semibold transition-colors cursor-pointer ${
                  (toggleTarget?.isActive ?? toggleTarget?.status === 'aktif')
                    ? 'bg-[#E5484D] hover:bg-[#B42318]'
                    : 'bg-[#0B7A4E] hover:bg-[#09633F]'
                }`}
              >
                {isToggling
                  ? 'Memproses...'
                  : (toggleTarget?.isActive ?? toggleTarget?.status === 'aktif')
                  ? 'Ya, Nonaktifkan'
                  : 'Ya, Aktifkan'}
              </button>
            </>
          }
        >
          <p className="text-sm text-[#5F6F6A]">
            {(toggleTarget?.isActive ?? toggleTarget?.status === 'aktif') ? (
              <>
                Apakah Anda yakin ingin menonaktifkan peran{' '}
                <span className="font-semibold text-[#14201C]">{toggleTarget?.nama}</span>?
                Pengguna dengan peran ini mungkin dibatasi aksesnya.
              </>
            ) : (
              <>
                Apakah Anda yakin ingin mengaktifkan kembali peran{' '}
                <span className="font-semibold text-[#14201C]">{toggleTarget?.nama}</span>?
              </>
            )}
          </p>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default RoleTemplate;
