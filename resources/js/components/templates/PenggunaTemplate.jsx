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

function PenggunaForm({ data, setData, errors, roles, units, isEdit }) {
    return (
        <div className="space-y-4">
            <FormField label="Nama lengkap" error={errors.nama} htmlFor="pengguna-nama">
                <TextInput
                    id="pengguna-nama"
                    value={data.nama}
                    onChange={(e) => setData('nama', e.target.value)}
                    placeholder="Nama lengkap pengguna"
                    error={errors.nama}
                />
            </FormField>
            <FormField label="Email" error={errors.email} htmlFor="pengguna-email">
                <TextInput
                    id="pengguna-email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="nama@pnj.ac.id"
                    error={errors.email}
                />
            </FormField>
            <FormField
                label={isEdit ? 'Password baru (kosongkan jika tidak diubah)' : 'Password'}
                error={errors.password}
                htmlFor="pengguna-password"
            >
                <TextInput
                    id="pengguna-password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Minimal 8 karakter"
                    error={errors.password}
                />
            </FormField>
            <FormField label="Peran" error={errors.role_id} htmlFor="pengguna-role">
                <SelectInput
                    id="pengguna-role"
                    value={data.role_id}
                    onChange={(e) => setData('role_id', e.target.value)}
                    options={normalizeOptions(roles)}
                    placeholder="Pilih peran"
                    error={errors.role_id}
                />
            </FormField>
            <FormField label="Unit kerja" error={errors.unit_id} htmlFor="pengguna-unit">
                <SelectInput
                    id="pengguna-unit"
                    value={data.unit_id}
                    onChange={(e) => setData('unit_id', e.target.value)}
                    options={normalizeOptions(units)}
                    placeholder="Pilih unit kerja (opsional)"
                    error={errors.unit_id}
                />
            </FormField>
        </div>
    );
}

const columns = [
    {
        key: 'nama',
        header: 'Nama & Email',
        render: (row) => (
            <div>
                <p className="font-semibold text-[#14201C]">{row.nama}</p>
                <p className="text-xs text-[#8A9A95]">{row.email}</p>
            </div>
        ),
    },
    {
        key: 'role',
        header: 'Peran',
        render: (row) => row.role?.nama ?? '-',
    },
    {
        key: 'unit',
        header: 'Unit Kerja',
        render: (row) => row.unit?.nama ?? '-',
    },
];

export default function PenggunaTemplate({
    rows = [],
    pagination = null,
    roles = [],
    units = [],
    query = '',
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
}) {
    const { data, setData, errors, processing } = form;
    const isEdit = modalMode === 'edit';

    return (
        <DashboardShellTemplate
            sidebarProps={{ ...adminSidebarPreset, activeRoute: 'admin.pengguna.index' }}
            topbarProps={{
                ...adminTopbarPreset,
                searchValue: query,
                onSearchChange: onQueryChange,
                searchPlaceholder,
                searchId: 'pengguna-search-input',
            }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#14201C]">Pengguna</h1>
                    <p className="text-sm text-[#5F6F6A] mt-1">
                        Kelola akun pengguna dan peran mereka di SIPBAJA.
                    </p>
                </div>
                <PrimaryButton icon={Plus} onClick={onOpenCreate}>
                    Tambah Pengguna
                </PrimaryButton>
            </div>

            <div className="max-w-md">
                <SearchBar
                    value={query}
                    onChange={onQueryChange}
                    placeholder={searchPlaceholder}
                    id="pengguna-table-search"
                />
            </div>

            <CrudTable
                columns={columns}
                rows={rows}
                onEdit={onOpenEdit}
                onDelete={onAskDelete}
                emptyTitle="Belum ada pengguna"
                emptyDescription="Pengguna yang ditambahkan akan ditampilkan di sini."
                isLoading={isLoading}
            />

            {pagination}

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
        </DashboardShellTemplate>
    );
}
