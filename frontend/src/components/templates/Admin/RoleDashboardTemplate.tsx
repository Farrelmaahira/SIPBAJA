import type { FC, ReactNode } from 'react';
import AppLayout, { type AppNavItem } from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import { ShieldCheck, Building2, UserCheck } from 'lucide-react';
import type { ProfilePillUser } from '../../molecules/ProfilePill';

export interface RoleDashboardUser extends ProfilePillUser {
  nama?: string;
  name?: string;
  role?: { nama?: string } | string;
  unit?: { nama?: string };
  unit_kerja?: { nama?: string };
}

export interface RoleDashboardTemplateProps {
  roleTitle?: string;
  roleDescription?: string;
  user?: RoleDashboardUser | null;
  isLoading?: boolean;
  navItems?: AppNavItem[];
  children?: ReactNode;
}

export const RoleDashboardTemplate: FC<RoleDashboardTemplateProps> = ({
  roleTitle = 'Dashboard',
  roleDescription = 'Sistem Informasi Pengadaan Barang dan Jasa (SIPBAJA)',
  user = {},
  isLoading = false,
  navItems = [],
  children,
}) => {
  const displayName = user?.nama || user?.name || roleTitle;
  const userRole = typeof user?.role === 'string' ? user.role : user?.role?.nama || roleTitle;
  const unitName = user?.unit?.nama || user?.unit_kerja?.nama || null;

  const roleInitials = userRole
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SB';

  return (
    <AppLayout
      activeRoute="dashboard"
      navItems={navItems}
      roleInitials={roleInitials}
      roleTitle={userRole}
      roleSubtitle={unitName || 'Sistem Pengadaan'}
      profileHref="/shared/profil"
      notifikasiHref="/shared/notifikasi"
      user={user}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow={userRole.toUpperCase()}
          title={`Selamat Datang, ${displayName}`}
          description={roleDescription}
        />

        <section
          className="bg-white border border-[#E4EBE8] rounded-[20px] p-6 shadow-[0_4px_16px_rgba(13,51,38,0.04)]"
          aria-label="Informasi Dashboard"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4EBE8]">
            <div>
              <h2 className="text-base font-bold text-[#14201C]">
                Informasi Akun &amp; Wewenang
              </h2>
              <p className="text-xs text-[#5F6F6A] mt-0.5">
                Status hak akses untuk alur pengadaan
              </p>
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E] self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[#12A06B]" aria-hidden="true" />
              Akun Aktif
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-3 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#5F6F6A]">Memuat informasi dashboard...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-[#F7FAF9] border border-[#E4EBE8] flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#E4F6EC] text-[#0E7C5A] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#5F6F6A]">Peran Sistem</p>
                  <p className="text-sm font-semibold text-[#14201C] mt-0.5">{userRole}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#F7FAF9] border border-[#E4EBE8] flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#E8F0FF] text-[#1F55C7] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#5F6F6A]">Unit / Bagian</p>
                  <p className="text-sm font-semibold text-[#14201C] mt-0.5">
                    {unitName ?? 'Semua Unit / Kampus'}
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#F7FAF9] border border-[#E4EBE8] flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FEF3E2] text-[#B45309] flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#5F6F6A]">Akses Modul</p>
                  <p className="text-sm font-semibold text-[#14201C] mt-0.5">Operasional Penuh</p>
                </div>
              </div>
            </div>
          )}

          {children && <div className="mt-6 pt-6 border-t border-[#E4EBE8]">{children}</div>}
        </section>
      </div>
    </AppLayout>
  );
};

export default RoleDashboardTemplate;
