import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DashboardShellTemplate from '../../../components/templates/DashboardShellTemplate';
import { adminSidebarPreset } from '../../../components/organisms/AdminSidebar';
import { adminTopbarPreset } from '../../../components/organisms/AdminTopbar';
import PermissionMatrix from '../../../components/organisms/PermissionMatrix';
import Modal from '../../../components/organisms/Modal';
import SelectInput from '../../../components/molecules/SelectInput';
import PrimaryButton from '../../../components/atoms/PrimaryButton';
import normalizeOptions from '../../../utils/normalizeOptions';

export default function Index() {
    const { roles, groupedPermissions, assignments, selectedRoleId } = usePage().props;

    const [roleId, setRoleId] = useState(selectedRoleId ? String(selectedRoleId) : '');
    const [checked, setChecked] = useState(
        selectedRoleId ? (assignments?.[selectedRoleId] ?? []) : []
    );
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const pickRole = (id) => {
        setRoleId(id);
        setChecked(id ? (assignments?.[id] ?? []) : []);
    };

    const toggle = (permissionId) => {
        setChecked((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const save = () => {
        if (!roleId) return;
        setSaving(true);
        router.put(
            `/admin/role-permission/${roleId}`,
            { permission_ids: checked },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSaving(false);
                    setConfirmOpen(false);
                },
            }
        );
    };

    const submit = () => {
        if (checked.length === 0) {
            setConfirmOpen(true);
            return;
        }
        save();
    };

    return (
        <>
            <Head title="Hak Akses - SIPBAJA" />
            <DashboardShellTemplate
                sidebarProps={{ ...adminSidebarPreset, activeRoute: 'admin.role-permission.index' }}
                topbarProps={{
                    ...adminTopbarPreset,
                    searchPlaceholder: 'Cari data peran atau izin...',
                    searchId: 'rbac-search-input',
                }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-[#14201C]">Hak Akses</h1>
                        <p className="text-sm text-[#5F6F6A] mt-1">
                            Tetapkan izin yang sudah ada ke setiap peran.
                        </p>
                    </div>
                    <PrimaryButton onClick={submit} disabled={!roleId || saving}>
                        {saving ? 'Menyimpan...' : 'Simpan Izin'}
                    </PrimaryButton>
                </div>

                <div className="max-w-md">
                    <SelectInput
                        id="rbac-role"
                        value={roleId}
                        onChange={(e) => pickRole(e.target.value)}
                        options={normalizeOptions(roles)}
                        placeholder="Pilih peran"
                    />
                </div>

                {roleId ? (
                    <PermissionMatrix
                        groupedPermissions={groupedPermissions}
                        checked={checked}
                        onToggle={toggle}
                    />
                ) : (
                    <div className="bg-white border border-[#E4EBE8] rounded-[20px] py-12 px-6 text-center">
                        <p className="text-sm font-semibold text-[#14201C]">Pilih peran dulu</p>
                        <p className="text-xs text-[#5F6F6A] mt-1">
                            Daftar izin muncul setelah peran dipilih.
                        </p>
                    </div>
                )}

                <Modal
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    title="Cabut Semua Izin"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setConfirmOpen(false)}
                                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl border border-[#E4EBE8] text-sm font-semibold text-[#5F6F6A] hover:bg-[#EEF5F2] transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={save}
                                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl bg-[#E5484D] hover:bg-[#B42318] text-white text-sm font-semibold transition-colors cursor-pointer"
                            >
                                Ya, Cabut Semua
                            </button>
                        </>
                    }
                >
                    <p className="text-sm text-[#5F6F6A]">
                        Tidak ada izin dicentang. Cabut semua izin dari peran ini?
                    </p>
                </Modal>
            </DashboardShellTemplate>
        </>
    );
}
