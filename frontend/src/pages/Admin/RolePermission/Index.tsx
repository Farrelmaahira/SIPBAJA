import { useState, useEffect, type FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { adminService } from '../../../services/adminService';
import RolePermissionTemplate from '../../../components/templates/RolePermissionTemplate';
import PermissionMatrix, {
  type GroupedPermissions,
} from '../../../components/organisms/PermissionMatrix';

export const RolePermissionIndex: FC = () => {
  const [searchParams] = useSearchParams();
  const queryRoleId = searchParams.get('role_id');

  const [roles, setRoles] = useState<Array<{ id: number; nama: string }>>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({});
  const [assignments, setAssignments] = useState<Record<string, number[]>>({});
  const [roleId, setRoleId] = useState<string>(queryRoleId || '');
  const [checked, setChecked] = useState<number[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    adminService
      .getRolePermissions(queryRoleId ? Number(queryRoleId) : undefined, controller.signal)
      .then((data) => {
        if (data.roles) setRoles(data.roles);
        if (data.groupedPermissions) setGroupedPermissions(data.groupedPermissions as unknown as GroupedPermissions);
        if (data.assignments) {
          const stringified: Record<string, number[]> = {};
          for (const [k, v] of Object.entries(data.assignments)) {
            stringified[String(k)] = v;
          }
          setAssignments(stringified);
        }

        const initialRole = queryRoleId || (data.selectedRoleId ? String(data.selectedRoleId) : '');
        if (initialRole) {
          setRoleId(initialRole);
          setChecked(data.assignments?.[Number(initialRole)] || []);
        }
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        console.error('Failed to fetch role permissions:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
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
      await adminService.updateRolePermissions(roleId, checked);
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
    <RolePermissionTemplate
      roles={roles}
      roleId={roleId}
      onRoleChange={pickRole}
      onSubmit={submit}
      saving={saving}
      isLoading={isLoading}
      confirmOpen={confirmOpen}
      onCancelConfirm={() => setConfirmOpen(false)}
      onConfirmRevokeAll={save}
    >
      <PermissionMatrix
        groupedPermissions={groupedPermissions}
        checked={checked}
        onToggle={toggle}
      />
    </RolePermissionTemplate>
  );
};

export default RolePermissionIndex;
