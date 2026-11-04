import type { FC } from 'react';
import { User, Mail, ShieldCheck, Building2, IdCard, LogOut, Loader2 } from 'lucide-react';

export interface UserProfileData {
  id?: number | string;
  nama?: string;
  email?: string;
  role?: string | { nama?: string; [key: string]: unknown };
  Role?: { nama?: string; [key: string]: unknown };
  unit?: string | { nama?: string; [key: string]: unknown };
  Unit?: { nama?: string; [key: string]: unknown };
  [key: string]: unknown;
}

export interface UserProfileSectionProps {
  user?: UserProfileData | null;
  roleInitials?: string;
  roleTitle?: string | null;
  roleSubtitle?: string | null;
  badgeLabel?: string | null;
  onLogoutClick?: () => void;
  isLoading?: boolean;
}

export const UserProfileSection: FC<UserProfileSectionProps> = ({
  user,
  roleInitials = 'U',
  roleTitle = null,
  roleSubtitle = null,
  badgeLabel = null,
  onLogoutClick,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] p-12 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#0E7C5A] animate-spin" />
        <p className="text-xs text-[#5F6F6A] font-medium">Memuat data profil pengguna...</p>
      </div>
    );
  }

  const rawRole =
    typeof user?.role === 'string'
      ? user.role
      : user?.Role?.nama || user?.role?.nama || roleTitle || 'Pengguna';

  const displayName =
    user?.nama ||
    roleTitle ||
    rawRole;

  const displayEmail = user?.email || '-';
  const displayRole = rawRole;
  const resolvedBadge = badgeLabel || roleSubtitle || displayRole;

  const displayUnit =
    typeof user?.unit === 'string'
      ? user.unit
      : user?.Unit?.nama || user?.unit?.nama || rawRole;

  const displayId = user?.id ? `USR-${String(user.id).padStart(4, '0')}` : 'USR-0001';

  return (
    <div className="flex flex-col md:flex-row gap-6 items-stretch">
      {/* Left Card: Avatar & Summary */}
      <div className="md:w-[340px] shrink-0 bg-white rounded-[22px] p-8 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col items-center gap-4 text-center">
        <div className="w-24 h-24 rounded-full bg-[#0E7C5A] text-white font-extrabold text-[32px] flex items-center justify-center shrink-0 shadow-sm">
          {roleInitials}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-[#14201C] truncate" title={displayName}>
            {displayName}
          </h3>
          <p className="text-xs text-[#8A9A95] mt-0.5 truncate">{displayEmail}</p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#EAF6F1] text-[#0E7C5A]">
          <span className="w-2 h-2 rounded-full bg-[#12A06B]" aria-hidden="true" />
          {resolvedBadge}
        </span>

        <p className="text-xs text-[#5F6F6A] leading-relaxed">
          Sistem Informasi Pengadaan Barang &amp; Jasa Politeknik Negeri Jakarta
        </p>

        {onLogoutClick && (
          <button
            type="button"
            onClick={onLogoutClick}
            className="w-full mt-2 py-2.5 px-4 rounded-xl border border-[#FDE6E4] bg-[#FFF5F4] text-[#D92D20] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#FEE4E2] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        )}
      </div>

      {/* Right Card: Detailed Information */}
      <div className="flex-1 bg-white rounded-[22px] p-8 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
        <h4 className="text-base font-bold text-[#14201C] mb-6 pb-4 border-b border-[#F0F4F2]">
          Informasi Detail Akun
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] flex items-center justify-center text-[#0E7C5A] shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[#8A9A95] text-xs font-medium">Nama Lengkap</p>
                <p className="font-bold text-[#0E7C5A] text-sm mt-0.5 truncate">{displayName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] flex items-center justify-center text-[#0E7C5A] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[#8A9A95] text-xs font-medium">Peran / Aktor</p>
                <p className="font-bold text-[#14201C] text-sm mt-0.5">{displayRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] flex items-center justify-center text-[#0E7C5A] shrink-0">
                <IdCard className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[#8A9A95] text-xs font-medium">ID Pengguna</p>
                <p className="font-bold text-[#14201C] text-sm mt-0.5">{displayId}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] flex items-center justify-center text-[#0E7C5A] shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[#8A9A95] text-xs font-medium">Alamat Email</p>
                <p className="font-bold text-[#14201C] text-sm mt-0.5 truncate">{displayEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] flex items-center justify-center text-[#0E7C5A] shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[#8A9A95] text-xs font-medium">Unit / Bidang Kerja</p>
                <p className="font-bold text-[#14201C] text-sm mt-0.5">{displayUnit}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSection;

