import { useState, useEffect, type FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../services/api';
import DashboardShellTemplate from '../../../components/templates/DashboardShellTemplate';
import { adminSidebarPreset } from '../../../components/organisms/AdminSidebar';
import { adminTopbarPreset } from '../../../components/organisms/AdminTopbar';
import PermissionMatrix, {
  type GroupedPermissions,
} from '../../../components/organisms/PermissionMatrix';
import Modal from '../../../components/organisms/Modal';
import SelectInput from '../../../components/molecules/SelectInput';
import PrimaryButton from '../../../components/atoms/PrimaryButton';
import normalizeOptions from '../../../utils/normalizeOptions';

export const RolePermissionIndex: FC = () => {
  const [searchParams] = useSearchParams();
  const queryRoleId = searchParams.get('role_id');

  const [roles, setRoles] = useState<any[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({});
  const [assignments, setAssignments] = useState<Record<string, number[]>>({});
  const [roleId, setRoleId] = useState<string>(queryRoleId || '');
  const [checked, setChecked] = useState<number[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api
      .get<{
        roles?: any[];
        groupedPermissions?: GroupedPermissions;
        assignments?: Record<string, number[]>;
        selectedRoleId?: number | string;
      }>('/v1/admin/role-permission')
      .then((res) => {
        if (!isMounted) return;
        const data = res.data;
        if (data.roles) setRoles(data.roles);
        if (data.groupedPermissions) setGroupedPermissions(data.groupedPermissions);
        if (data.assignments) setAssignments(data.assignments);

        const initialRole = queryRoleId || (data.selectedRoleId ? String(data.selectedRoleId) : '');
        if (initialRole) {
          setRoleId(initialRole);
          setChecked(data.assignments?.[initialRole] || []);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch role permissions:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [queryRoleId]);

  const pickRole = (id: string) => {
    setRoleId(id);
    setChecked(id ? assignments[id] || [] : []);
  };

  const toggle = (permissionId: number) => {
    setChecked((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const save = async () => {
    if (!roleId) return;
    setSaving(true);
    try {
      await api.put(`/v1/admin/role-permission/${roleId}`, {
        permission_ids: checked,
      });
      setAssignments((prev) => ({
        ...prev,
        [roleId]: checked,
      }));
      setConfirmOpen(false);
    } catch (err) {
      console.error('Failed to save permissions:', err);
    } finally {
      setSaving(false);
    }
  };

  const submit = () => {
    if (checked.length === 0) {
      setConfirmOpen(true);
      return;
    }
    save();
  };

  return (
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
  );
};

export default RolePermissionIndex;
