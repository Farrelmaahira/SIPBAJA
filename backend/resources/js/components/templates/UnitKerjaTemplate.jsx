import { Plus } from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import { adminSidebarPreset } from '../organisms/AdminSidebar';
import { adminTopbarPreset } from '../organisms/AdminTopbar';
import CrudTable from '../organisms/CrudTable';
import Modal from '../organisms/Modal';
import SearchBar from '../molecules/SearchBar';
import FormField from '../molecules/FormField';
import TextInput from '../molecules/TextInput';
import PrimaryButton from '../atoms/PrimaryButton';

const columns = [
    {
        key: 'nama',
        header: 'Nama Unit Kerja',
        render: (row) => <span className="font-semibold text-[#14201C]">{row.nama}</span>,
    },
    {
        key: 'users_count',
        header: 'Jumlah Pengguna',
        render: (row) => `${row.users_count ?? 0} akun`,
    },
];

export default function UnitKerjaTemplate({
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
}) {
    const { data, setData, errors, processing } = form;
    const isEdit = modalMode === 'edit';
    const inUse = (deleteTarget?.users_count ?? 0) > 0;

    return (
        <DashboardShellTemplate
            sidebarProps={{ ...adminSidebarPreset, activeRoute: 'admin.unit-kerja.index' }}
            topbarProps={{
                ...adminTopbarPreset,
                searchValue: query,
                onSearchChange: onQueryChange,
                searchPlaceholder,
                searchId: 'unit-kerja-search-input',
            }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#14201C]">Unit Kerja</h1>
                    <p className="text-sm text-[#5F6F6A] mt-1">
                        Kelola daftar jurusan, unit, dan bidang pemohon.
                    </p>
                </div>
                <PrimaryButton icon={Plus} onClick={onOpenCreate}>
                    Tambah Unit Kerja
                </PrimaryButton>
            </div>

            <div className="max-w-md">
                <SearchBar
                    value={query}
                    onChange={onQueryChange}
                    placeholder={searchPlaceholder}
                    id="unit-kerja-table-search"
                />
            </div>

            <CrudTable
                columns={columns}
                rows={rows}
                onEdit={onOpenEdit}
                onDelete={onAskDelete}
                emptyTitle="Belum ada unit kerja"
                emptyDescription="Unit kerja yang ditambahkan akan ditampilkan di sini."
                isLoading={isLoading}
            />

            {pagination}

            <Modal
                open={modalMode !== null}
                onClose={onCloseModal}
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
                <FormField label="Nama unit kerja" error={errors.nama} htmlFor="unit-nama">
                    <TextInput
                        id="unit-nama"
                        value={data.nama}
                        onChange={(e) => setData('nama', e.target.value)}
                        placeholder="Contoh: Teknik Informatika"
                        error={errors.nama}
                    />
                </FormField>
            </Modal>

            <Modal
                open={deleteTarget !== null}
                onClose={onCancelDelete}
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
                        Unit <span className="font-semibold text-[#14201C]">{deleteTarget?.nama}</span> dipakai{' '}
                        {deleteTarget?.users_count} pengguna dan tidak bisa dihapus.
                    </p>
                ) : (
                    <p className="text-sm text-[#5F6F6A]">
                        Hapus <span className="font-semibold text-[#14201C]">{deleteTarget?.nama}</span>?
                    </p>
                )}
            </Modal>
        </DashboardShellTemplate>
    );
}
