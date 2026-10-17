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
        header: 'Nama Peran',
        render: (row) => <span className="font-semibold text-[#14201C]">{row.nama}</span>,
    },
    {
        key: 'permissions_count',
        header: 'Jumlah Izin',
        render: (row) => `${row.permissions_count ?? 0} izin`,
    },
    {
        key: 'users_count',
        header: 'Jumlah Pengguna',
        render: (row) => `${row.users_count ?? 0} akun`,
    },
    {
        key: 'hak_akses',
        header: 'Hak Akses',
        render: (row) => (
            <a
                href={`/admin/role-permission?role_id=${row.id}`}
                className="inline-flex items-center min-h-[44px] text-xs font-semibold text-[#0E7C5A] hover:text-[#0A5C43] hover:underline transition-colors"
            >
                Atur Izin &rarr;
            </a>
        ),
    },
];

export default function RoleTemplate({
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
}) {
    const { data, setData, errors, processing } = form;
    const isEdit = modalMode === 'edit';
    const inUse = (deleteTarget?.users_count ?? 0) > 0;

    return (
        <DashboardShellTemplate
            sidebarProps={{ ...adminSidebarPreset, activeRoute: 'admin.role.index' }}
            topbarProps={{
                ...adminTopbarPreset,
                searchValue: query,
                onSearchChange: onQueryChange,
                searchPlaceholder,
                searchId: 'role-search-input',
            }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#14201C]">Peran</h1>
                    <p className="text-sm text-[#5F6F6A] mt-1">
                        Kelola peran pengguna beserta hak aksesnya.
                    </p>
                </div>
                <PrimaryButton icon={Plus} onClick={onOpenCreate}>
                    Tambah Peran
                </PrimaryButton>
            </div>

            <div className="max-w-md">
                <SearchBar
                    value={query}
                    onChange={onQueryChange}
                    placeholder={searchPlaceholder}
                    id="role-table-search"
                />
            </div>

            <CrudTable
                columns={columns}
                rows={rows}
                onEdit={onOpenEdit}
                onDelete={onAskDelete}
                emptyTitle="Belum ada peran"
                emptyDescription="Peran yang ditambahkan akan ditampilkan di sini."
                isLoading={isLoading}
            />

            {pagination}

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
                <FormField label="Nama peran" error={errors.nama} htmlFor="role-nama">
                    <TextInput
                        id="role-nama"
                        value={data.nama}
                        onChange={(e) => setData('nama', e.target.value)}
                        placeholder="Contoh: Auditor"
                        error={errors.nama}
                    />
                </FormField>
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
                        Peran <span className="font-semibold text-[#14201C]">{deleteTarget?.nama}</span> dipakai{' '}
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
