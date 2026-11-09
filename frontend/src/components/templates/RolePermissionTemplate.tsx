import type { FC, ReactNode } from 'react';
import AppLayout from './AppLayout';
import Modal from '../organisms/Modal';
import SelectInput from '../molecules/SelectInput';
import PrimaryButton from '../atoms/PrimaryButton';
import normalizeOptions from '../../utils/normalizeOptions';
import { ADMIN_NAV_ITEMS } from '../../constants/adminNav';

export interface RolePermissionTemplateProps {
  roles?: Array<{ id: number; nama: string }>;
  roleId?: string;
  onRoleChange: (id: string) => void;
  onSubmit: () => void;
  saving?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
  confirmOpen: boolean;
  onCancelConfirm: () => void;
  onConfirmRevokeAll: () => void;
}

export const RolePermissionTemplate: FC<RolePermissionTemplateProps> = ({
  roles = [],
  roleId = '',
  onRoleChange,
  onSubmit,
  saving = false,
  isLoading = false,
  children,
  confirmOpen,
  onCancelConfirm,
  onConfirmRevokeAll,
}) => {
  return (
    <AppLayout
      activeRoute="role-permission"
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
            <h1 className="text-xl font-bold text-[#14201C]">Hak Akses</h1>
            <p className="text-sm text-[#5F6F6A] mt-1">
              Tetapkan izin yang sudah ada ke setiap peran.
            </p>
          </div>
          <PrimaryButton onClick={onSubmit} disabled={!roleId || saving}>
            {saving ? 'Menyimpan...' : 'Simpan Izin'}
          </PrimaryButton>
        </div>

        <div className="max-w-md">
          <SelectInput
            id="rbac-role"
            value={roleId}
            onChange={(e) => onRoleChange(e.target.value)}
            options={normalizeOptions(roles)}
            placeholder="Pilih peran"
          />
        </div>

        {isLoading ? (
          <div className="bg-white border border-[#E4EBE8] rounded-[20px] py-12 px-6 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#5F6F6A]">Memuat hak akses peran...</p>
            </div>
          </div>
        ) : roleId ? (
          children
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
          onClose={onCancelConfirm}
          title="Cabut Semua Izin"
          footer={
            <>
              <button
                type="button"
                onClick={onCancelConfirm}
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl border border-[#E4EBE8] text-sm font-semibold text-[#5F6F6A] hover:bg-[#EEF5F2] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirmRevokeAll}
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
      </div>
    </AppLayout>
  );
};

export default RolePermissionTemplate;

