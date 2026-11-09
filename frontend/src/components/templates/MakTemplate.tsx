import type { ChangeEvent, FC, ReactNode } from 'react';
import { Plus } from 'lucide-react';
import AppLayout from './AppLayout';
import CrudTable from '../organisms/CrudTable';
import Modal from '../organisms/Modal';
import SearchBar from '../molecules/SearchBar';
import FormField from '../molecules/FormField';
import TextInput from '../molecules/TextInput';
import SelectInput from '../molecules/SelectInput';
import PrimaryButton from '../atoms/PrimaryButton';
import normalizeOptions from '../../utils/normalizeOptions';
import { ADMIN_NAV_ITEMS } from '../../constants/adminNav';

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
    header: 'Digunakan di Permohonan',
    render: (row: MakRowItem) => `${row.permohonan_mak_count ?? 0} permohonan`,
  },
];

export interface MakFormData {
  nama: string;
  kode?: string;
  ppk_id?: string | number;
  [key: string]: unknown;
}

export interface MakTemplateProps {
  rows?: MakRowItem[];
  pagination?: ReactNode;
  ppkOptions?: PpkOptionUser[];
  query?: string;
  onQueryChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  modalMode?: 'create' | 'edit' | null;
  form: {
    data: MakFormData;
    setData: (field: string, value: any) => void;
    errors: Record<string, string>;
    processing?: boolean;
  };
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

  const selectOptions = ppkOptions.map((user) => ({
    value: user.id,
    label: `${user.nama} (${user.email})`,
  }));

  return (
    <AppLayout
      activeRoute="mak"
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
            <h1 className="text-xl font-bold text-[#14201C]">Master MAK</h1>
            <p className="text-sm text-[#5F6F6A] mt-1">
              Kelola Mata Anggaran Kegiatan dan pejabat PPK yang bertanggung jawab.
            </p>
          </div>
          <PrimaryButton icon={Plus} onClick={onOpenCreate}>
            Tambah MAK
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
                id="mak-table-search"
              />
            </div>
          }
          onEdit={onOpenEdit}
          onDelete={onAskDelete}
          emptyTitle="Belum ada data MAK"
          emptyDescription="Data MAK yang ditambahkan akan muncul di sini."
          isLoading={isLoading}
          footer={pagination}
        />

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
                placeholder="cth. Belanja Operasional Perkantoran"
                error={errors.nama}
              />
            </FormField>
            <FormField label="PPK Bertugas" error={errors.ppk_id} htmlFor="mak-ppk">
              <SelectInput
                id="mak-ppk"
                value={data.ppk_id || ''}
                onChange={(e) => setData('ppk_id', e.target.value)}
                options={normalizeOptions(selectOptions)}
                placeholder="Pilih PPK (opsional)"
                error={errors.ppk_id}
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
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl bg-[#E5484D] hover:bg-[#B42318] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Ya, Hapus
              </button>
            </>
          }
        >
          <p className="text-sm text-[#5F6F6A]">
            Hapus MAK <span className="font-semibold text-[#14201C]">{deleteTarget?.nama}</span>?
            Data ini tidak dapat dihapus jika masih terkait dengan permohonan pengadaan.
          </p>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default MakTemplate;
