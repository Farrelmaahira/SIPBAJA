import type { FC, FormEvent } from 'react';
import { Plus, Search } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import { CrudTable, type CrudColumn } from '../../organisms/CrudTable';
import JenisMakFormModal from '../../organisms/JenisMakFormModal';
import HapusJenisMakModal from '../../organisms/HapusJenisMakModal';
import TableFooter from '../../molecules/TableFooter';
import type { JenisMakRow, PpkOption } from '../../../types/perencanaan';
import { PERENCANAAN_NAV_ITEMS } from '@/constants/perencanaanNav';
import HeroBanner from '@/components/organisms/HeroBanner';

export interface PerencanaanJenisMakTemplateProps {
  rows: JenisMakRow[];
  searchQuery: string;
  currentPage?: number;
  lastPage?: number;
  isLoading?: boolean;
  processing?: boolean;
  flashSuccess?: string;
  flashError?: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  onPageChange?: (page: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (row: JenisMakRow) => void;
  onOpenDeleteModal: (row: JenisMakRow) => void;

  // Modal Form
  formModalOpen: boolean;
  isEdit: boolean;
  formKode: string;
  formNama: string;
  formPpkId: number;
  ppkOptions?: PpkOption[];
  fieldErrors?: Record<string, string>;
  formError?: string;
  onCloseFormModal: () => void;
  onFormKodeChange: (val: string) => void;
  onFormNamaChange: (val: string) => void;
  onFormPpkChange: (val: number) => void;
  onFormSubmit: (e: FormEvent) => void;

  // Modal Delete
  deleteModalOpen: boolean;
  deleteTarget?: JenisMakRow | null;
  deleteError?: string;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => void;
}

export const PerencanaanJenisMakTemplate: FC<PerencanaanJenisMakTemplateProps> = ({
  rows,
  searchQuery,
  currentPage = 1,
  lastPage = 1,
  isLoading = false,
  processing = false,
  flashSuccess = '',
  flashError = '',
  onSearchChange,
  onSearchSubmit,
  onPageChange,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,

  formModalOpen,
  isEdit,
  formKode,
  formNama,
  formPpkId,
  ppkOptions = [],
  fieldErrors = {},
  formError = '',
  onCloseFormModal,
  onFormKodeChange,
  onFormNamaChange,
  onFormPpkChange,
  onFormSubmit,

  deleteModalOpen,
  deleteTarget,
  deleteError = '',
  onCloseDeleteModal,
  onConfirmDelete,
}) => {
  const columns: CrudColumn<JenisMakRow>[] = [
    {
      key: 'kode',
      header: 'KODE MAK',
      render: (row) => <span className="font-bold text-[#0E7C5A] whitespace-nowrap">{row.kode}</span>,
    },
    {
      key: 'nama',
      header: 'NAMA MAK',
      render: (row) => <span className="font-bold text-[#14201C]">{row.nama}</span>,
    },
    {
      key: 'penanggung_jawab',
      header: 'PENANGGUNG JAWAB',
      render: (row) => <span className="text-[#5F6F6A]">{row.penanggung_jawab}</span>,
    },
    {
      key: 'digunakan',
      header: 'DIGUNAKAN',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F4F7F5] text-[#14201C]">
          {row.digunakan} pengadaan
        </span>
      ),
    },
  ];

  return (
    <AppLayout
      activeRoute="mak"
      navItems={PERENCANAAN_NAV_ITEMS}
      roleInitials="PR"
      roleTitle="Perencanaan"
      roleSubtitle="Unit Perencanaan"
      profileHref="/perencanaan/profil"
      notifikasiHref="/perencanaan/notifikasi"
      readAllHref="/perencanaan/notifikasi/read-all"
      flash={
        flashError || flashSuccess
          ? { error: flashError || undefined, success: flashSuccess || undefined }
          : undefined
      }
      breadcrumb={[
        {
          label: 'PERENCANAAN',
          href: '/perencanaan/dashboard',
        },
        {
          label: 'JENIS MAK',
          href: '/perencanaan/jenis-mak',
        },
      ]}
    >
      <div className="space-y-6">
        <HeroBanner
          title="Jenis MAK"
          description="Kelola Jenis MAK (Mata Anggaran Kegiatan) dan penanggung jawabnya."
          ctaLabel="Tambah Jenis MAK"
          ctaIcon={Plus}
          onCta={onOpenAddModal}
        />

        <CrudTable
          title="Daftar Jenis MAK"
          subtitle={`Menampilkan ${rows.length} data Jenis MAK`}
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          onEdit={onOpenEditModal}
          onDelete={onOpenDeleteModal}
          toolbar={
            <form onSubmit={onSearchSubmit} className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-[#8A9A95] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari kode atau nama MAK..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E4EBE8] bg-[#FAFCFB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E7C5A] text-[#14201C]"
              />
            </form>
          }
          emptyTitle="Belum ada data Jenis MAK"
          emptyDescription="Klik tombol &quot;Tambah Jenis MAK&quot; untuk menambahkan data baru."
          footer={
            <TableFooter
              currentPage={currentPage}
              lastPage={lastPage}
              isLoading={isLoading}
              onPageChange={onPageChange}
            />
          }
        />
      </div>

      {/* Modals */}
      <JenisMakFormModal
        isOpen={formModalOpen}
        isEdit={isEdit}
        kode={formKode}
        nama={formNama}
        ppkUserId={formPpkId}
        ppkOptions={ppkOptions}
        processing={processing}
        fieldErrors={fieldErrors}
        formError={formError}
        onClose={onCloseFormModal}
        onKodeChange={onFormKodeChange}
        onNamaChange={onFormNamaChange}
        onPpkChange={onFormPpkChange}
        onSubmit={onFormSubmit}
      />

      <HapusJenisMakModal
        isOpen={deleteModalOpen}
        targetMak={deleteTarget}
        processing={processing}
        deleteError={deleteError}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
      />
    </AppLayout>
  );
};

export default PerencanaanJenisMakTemplate;
