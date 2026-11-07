import type { ChangeEvent, FC, ReactNode } from 'react';
import { Plus } from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import { adminSidebarPreset } from '../organisms/AdminSidebar';
import { adminTopbarPreset } from '../organisms/AdminTopbar';
import CrudTable from '../organisms/CrudTable';
import Modal from '../organisms/Modal';
import SearchBar from '../molecules/SearchBar';
import FormField from '../molecules/FormField';
import TextInput from '../molecules/TextInput';
import SelectInput from '../molecules/SelectInput';
import PrimaryButton from '../atoms/PrimaryButton';
import normalizeOptions from '../../utils/normalizeOptions';

export interface MakRowItem {
  id: number;
  nama: string;
  kode?: string;
  ppk?: {
    id?: number;
    nama?: string;
    email?: string;
  };
  permohonan_mak_count?: number;
  [key: string]: unknown;
}

export interface PpkOptionUser {
  id: number;
  nama: string;
  email: string;
  [key: string]: unknown;
}

const columns = [
  {
    key: 'nama',
    header: 'Nama MAK',
    render: (row: MakRowItem) => <span className="font-semibold text-[#14201C]">{row.nama}</span>,
  },
  {
    key: 'ppk',
    header: 'PPK Bertugas',
    render: (row: MakRowItem) => (
      <div>
        <p className="font-medium text-[#14201C]">{row.ppk?.nama ?? '-'}</p>
        {row.ppk?.email && <p className="text-xs text-[#8A9A95]">{row.ppk.email}</p>}
      </div>
    ),
  },
  {
    key: 'permohonan_mak_count',
    header: 'Dipakai Permohonan',
    render: (row: MakRowItem) => `${row.permohonan_mak_count ?? 0} permohonan`,
  },
];

export interface MakFormData {
  nama?: string;
  ppk_user_id?: string | number;
  [key: string]: unknown;
}

export interface MakTemplateForm {
  data: MakFormData;
  setData: (field: string, value: any) => void;
  errors: Record<string, string>;
  processing?: boolean;
}

export interface MakTemplateProps {
  rows?: MakRowItem[];
  pagination?: ReactNode;
  ppkOptions?: PpkOptionUser[];
  query?: string;
  onQueryChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  modalMode?: 'create' | 'edit' | null;
  form: MakTemplateForm;
  onOpenCreate?: () => void;
  onOpenEdit?: (row: MakRowItem) => void;
  onCloseModal: () => void;
  onSubmitForm?: () => void;
  deleteTarget?: MakRowItem | null;
  onAskDelete?: (row: MakRowItem) => void;
  onCancelDelete: () => void;
  onConfirmDelete?: () => void;
  isLoading?: boolean;
}

export const MakTemplate: FC<MakTemplateProps> = ({
  rows = [],
  pagination = null,
  ppkOptions = [],
  query = '',
  onQueryChange,
  searchPlaceholder = 'Cari MAK...',
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
  const inUse = (deleteTarget?.permohonan_mak_count ?? 0) > 0;

  return (
    <DashboardShellTemplate
      sidebarProps={{ ...adminSidebarPreset, activeRoute: 'admin.mak.index' }}
      topbarProps={{
        ...adminTopbarPreset,
        searchValue: query,
        onSearchChange: onQueryChange,
        searchPlaceholder,
        searchId: 'mak-search-input',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#14201C]">Master MAK</h1>
          <p className="text-sm text-[#5F6F6A] mt-1">
            Kelola mata anggaran dan PPK yang bertugas.
          </p>
        </div>
        <PrimaryButton icon={Plus} onClick={onOpenCreate}>
          Tambah MAK
        </PrimaryButton>
      </div>

      <div className="max-w-md">
        <SearchBar
          value={query}
          onChange={onQueryChange}
          placeholder={searchPlaceholder}
          id="mak-table-search"
        />
      </div>

      <CrudTable
        columns={columns}
        rows={rows}
        onEdit={onOpenEdit}
        onDelete={onAskDelete}
        emptyTitle="Belum ada MAK"
        emptyDescription="MAK yang ditambahkan akan ditampilkan di sini."
        isLoading={isLoading}
      />

      {pagination}

      <Modal
        open={modalMode !== null}
        onClose={onCloseModal}
        title={isEdit ? 'Ubah MAK' : 'Tambah MAK'}
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
              {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah MAK'}
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Nama MAK" error={errors.nama} htmlFor="mak-nama">
            <TextInput
              id="mak-nama"
              value={data.nama || ''}
              onChange={(e) => setData('nama', e.target.value)}
              placeholder="Contoh: BLU Fisik"
              error={errors.nama}
            />
          </FormField>
          <FormField label="PPK yang bertugas" error={errors.ppk_user_id} htmlFor="mak-ppk">
            <SelectInput
              id="mak-ppk"
              value={data.ppk_user_id || ''}
              onChange={(e) => setData('ppk_user_id', e.target.value)}
              options={normalizeOptions(ppkOptions, {
                format: (u: any) => `${u.nama} (${u.email})`,
              })}
              placeholder="Pilih PPK"
              error={errors.ppk_user_id}
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={onCancelDelete}
        title="Hapus MAK"
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
              disabled={inUse}
              className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl bg-[#E5484D] hover:bg-[#B42318] text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              Ya, Hapus
            </button>
          </>
        }
      >
        {inUse ? (
          <p className="text-sm text-[#5F6F6A]">
            MAK <span className="font-semibold text-[#14201C]">{deleteTarget?.nama}</span> dipakai{' '}
            {deleteTarget?.permohonan_mak_count} permohonan dan tidak bisa dihapus.
          </p>
        ) : (
          <p className="text-sm text-[#5F6F6A]">
            Hapus <span className="font-semibold text-[#14201C]">{deleteTarget?.nama}</span>?
          </p>
        )}
      </Modal>
    </DashboardShellTemplate>
  );
};

export default MakTemplate;
