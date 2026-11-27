import type { FC, ReactNode } from 'react';
import { Plus, Pencil, ToggleRight, ToggleLeft } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import { CrudTable, type CrudActionItem, type CrudColumn } from '../../organisms/CrudTable';
import { Modal } from '../../organisms/Modal';
import { FilterStatusToolbar } from '../../molecules/FilterStatusToolbar';
import { ACTIVE_STATUS_FILTER_OPTIONS } from '../../../constants/statusFilters';
import { FormField } from '../../molecules/FormField';
import { TextInput } from '../../molecules/TextInput';
import { SelectInput } from '../../molecules/SelectInput';
import { PrimaryButton } from '../../atoms/PrimaryButton';
import { StatusPill } from '../../atoms/StatusPill';
import normalizeOptions from '../../../utils/normalizeOptions';
import { ADMIN_NAV_ITEMS } from '../../../constants/adminNav';
import { MakRowItem, PpkOptionUser } from '@/types/admin';
import HeroBanner from '@/components/organisms/HeroBanner';
import { FlashMessage } from '@/components/molecules/FlashMessage';

const columns: CrudColumn<MakRowItem>[] = [
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
  {
    key: 'status',
    header: 'Status',
    render: (row: MakRowItem) => {
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

export interface MakFormData {
  nama: string;
  kode?: string;
  ppk_id?: string | number;
  [key: string]: unknown;
}

export interface AdminMakTemplateProps {
  rows?: MakRowItem[];
  pagination?: ReactNode;
  ppkOptions?: PpkOptionUser[];
  query?: string;
  onQueryChange?: (value: string) => void;
  searchPlaceholder?: string;
  selectedStatuses?: string[];
  filterModalOpen?: boolean;
  onToggleFilterModal?: (open: boolean) => void;
  onApplyFilters?: (statuses: string[]) => void;
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
  toggleTarget?: MakRowItem | null;
  onAskToggle?: (row: MakRowItem) => void;
  onCancelToggle: () => void;
  onConfirmToggle?: () => void;
  isToggling?: boolean;
  isLoading?: boolean;
  flashType?: 'success' | 'error';
  flashMessage?: string | null;
  onDismissFlash?: () => void;
}

export const AdminMakTemplate: FC<AdminMakTemplateProps> = ({
  rows = [],
  pagination = null,
  ppkOptions = [],
  query = '',
  onQueryChange,
  searchPlaceholder = 'Cari MAK...',
  selectedStatuses = [],
  filterModalOpen = false,
  onToggleFilterModal,
  onApplyFilters,
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
  flashType = 'success',
  flashMessage = null,
  onDismissFlash,
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
      <div className="fixed top-5 right-5 z-50">
        <FlashMessage type={flashType} message={flashMessage} onClose={onDismissFlash} />
      </div>
      <div className="space-y-6">
        <HeroBanner
          title="Master MAK"
          description="Kelola Mata Anggaran Kegiatan dan pejabat PPK yang bertanggung jawab."
          ctaLabel="Tambah MAK"
          ctaIcon={Plus}
          onCta={onOpenCreate}
        />

        <CrudTable
          columns={columns}
          rows={rows}
          toolbar={
            <FilterStatusToolbar
              searchValue={query}
              onSearchChange={onQueryChange ?? (() => {})}
              searchPlaceholder={searchPlaceholder}
              options={ACTIVE_STATUS_FILTER_OPTIONS}
              selectedStatuses={selectedStatuses}
              filterOpen={filterModalOpen}
              onToggleFilter={onToggleFilterModal ?? (() => {})}
              onApplyFilters={onApplyFilters ?? (() => {})}
              statusSectionTitle="STATUS MAK"
            />
          }
          actions={(row: MakRowItem) => {
            const active = row.isActive ?? (row.status === 'aktif');
            const items: CrudActionItem<MakRowItem>[] = [
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
          emptyTitle="Belum ada data MAK"
          emptyDescription="Data MAK yang ditambahkan akan muncul di sini."
          isLoading={isLoading}
          footer={pagination}
        />

        <Modal
          open={modalMode !== null}
          onClose={onCloseModal}
          title={isEdit ? 'Edit MAK' : 'Tambah MAK'}
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
          open={toggleTarget !== null}
          onClose={onCancelToggle}
          title={
            (toggleTarget?.isActive ?? toggleTarget?.status === 'aktif')
              ? 'Nonaktifkan MAK'
              : 'Aktifkan MAK'
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
                Apakah Anda yakin ingin menonaktifkan MAK{' '}
                <span className="font-semibold text-[#14201C]">{toggleTarget?.nama}</span>?
                MAK yang dinonaktifkan tidak dapat dipilih saat membuat permohonan baru.
              </>
            ) : (
              <>
                Apakah Anda yakin ingin mengaktifkan kembali MAK{' '}
                <span className="font-semibold text-[#14201C]">{toggleTarget?.nama}</span>?
              </>
            )}
          </p>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default AdminMakTemplate;
