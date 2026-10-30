import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    User,
    Mail,
    ShieldCheck,
    Building2,
    IdCard,
    Clock,
    LogOut,
} from 'lucide-react';
import PpLayout from '../../../components/templates/PpLayout';
import LogoutModal from '../../../components/organisms/LogoutModal';

export default function Index({
    user,
    recentNotifications = [],
    unreadNotificationsCount = 0,
    basePath = '/pp',
    roleInitials = 'PP',
    roleTitle = null,
    roleSubtitle = null,
    navItems = null,
}) {
    const [logoutOpen, setLogoutOpen] = useState(false);

    const rawRole = typeof user?.role === 'string' ? user.role : (user?.role?.nama || 'PP');
    const displayName =
        roleTitle ||
        (rawRole === 'PP'
            ? 'PP'
            : rawRole === 'Perencanaan'
              ? 'Perencanaan'
              : rawRole === 'PPK'
                ? 'PPK'
                : user?.nama || 'PP');
    const defaultEmail =
        rawRole === 'Perencanaan'
            ? 'perencanaan@sipbaja.ac.id'
            : rawRole === 'PPK'
              ? 'ppk@sipbaja.ac.id'
              : 'pp@sipbaja.ac.id';
    const displayEmail = user?.email || defaultEmail;
    const displayRole = rawRole;
    const badgeLabel = rawRole === 'Perencanaan' ? 'Unit Perencanaan' : displayRole;
    const displayUnit =
        rawRole === 'Perencanaan' || rawRole === 'PPK' || rawRole === 'PP'
            ? rawRole
            : typeof user?.unit === 'string'
              ? user.unit
              : user?.unit?.nama || displayRole;

    return (
        <PpLayout
            activeRoute="dashboard"
            notifications={recentNotifications}
            unreadCount={unreadNotificationsCount}
            roleInitials={roleInitials}
            roleTitle={roleTitle}
            roleSubtitle={roleSubtitle}
            navItems={navItems}
            profileHref={`${basePath}/profil`}
            notifikasiHref={`${basePath}/notifikasi`}
            readAllHref={`${basePath}/notifikasi/read-all`}
        >
            <Head title="Profil Saya - SIPBAJA" />

            {/* Hero Banner (Figma node 656:35278 / 711:23856 / 711:24426) */}
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0A5C42] to-[#17A373] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/75 block mb-2">
                            AKUN
                        </span>
                        <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight leading-9">
                            Profil Saya
                        </h1>
                        <p className="text-sm text-white/85 mt-2">
                            Lihat informasi akun yang sedang Anda gunakan.
                        </p>
                    </div>

                    <Link
                        href={`${basePath}/dashboard`}
                        className="inline-flex items-center gap-2 px-5 py-3.5 rounded-[14px] bg-white/16 hover:bg-white/25 border border-white/35 text-white text-sm font-semibold transition-colors shrink-0 self-start sm:self-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                    </Link>
                </div>
                <div
                    className="absolute -right-10 -top-24 w-[260px] h-[260px] rounded-full bg-white/8 pointer-events-none"
                    aria-hidden="true"
                />
                <div
                    className="absolute right-24 -bottom-20 w-[170px] h-[170px] rounded-full bg-white/8 pointer-events-none"
                    aria-hidden="true"
                />
            </div>

            {/* Profile Content (Figma node 656:35286 / 711:23864 / 711:24434) */}
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
                {/* Card / Profil Ringkas (width 340px) */}
                <div className="md:w-[340px] shrink-0 bg-white rounded-[20px] p-8 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] flex flex-col items-center gap-4 text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1F9D70] to-[#0F6A49] text-white font-semibold text-[32px] flex items-center justify-center shrink-0">
                        {roleInitials}
                    </div>
                    <h3 className="text-[20px] font-bold text-[#0E1B16]">{displayName}</h3>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-semibold bg-[#EBF7F1] text-[#16825C]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16825C]" />
                        {badgeLabel}
                    </span>

                    <div className="w-full h-px bg-[#E3EAE6]" />

                    <button
                        type="button"
                        onClick={() => setLogoutOpen(true)}
                        className="w-full h-[46px] px-[22px] rounded-[14px] bg-[#FDE6E4] hover:bg-[#FCD5D2] border border-[#F6B8B5] text-sm font-semibold text-[#B42318] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                    </button>
                </div>

                {/* Card / Informasi Akun */}
                <div className="flex-1 bg-white rounded-[20px] p-6 sm:p-8 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] flex flex-col gap-6">
                    <div>
                        <h3 className="text-[18px] font-bold text-[#0E1B16] leading-[26px]">
                            Informasi Akun
                        </h3>
                        <p className="text-xs text-[#6B7A73] mt-0.5">
                            Data akun yang sedang digunakan
                        </p>
                    </div>

                    <div className="w-full h-px bg-[#E3EAE6]" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {/* Info Column / Kiri */}
                        <div className="space-y-6">
                            {/* Nama Lengkap */}
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] flex items-center justify-center text-[#0F6A49] shrink-0">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[#6B7A73] text-xs font-medium">Nama Lengkap</p>
                                    <p className="font-semibold text-[#0F6A49] text-sm mt-1">
                                        {displayName}
                                    </p>
                                </div>
                            </div>

                            {/* Jenis Aktor */}
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] flex items-center justify-center text-[#0F6A49] shrink-0">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[#6B7A73] text-xs font-medium">Jenis Aktor</p>
                                    <p className="font-semibold text-[#0E1B16] text-sm mt-1">
                                        {displayRole}
                                    </p>
                                </div>
                            </div>

                            {/* ID Pengguna */}
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] flex items-center justify-center text-[#0F6A49] shrink-0">
                                    <IdCard className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[#6B7A73] text-xs font-medium">ID Pengguna</p>
                                    <p className="font-semibold text-[#0E1B16] text-sm mt-1">
                                        PPBJ-0012
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Info Column / Kanan */}
                        <div className="space-y-6">
                            {/* Email */}
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] flex items-center justify-center text-[#0F6A49] shrink-0">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[#6B7A73] text-xs font-medium">Email</p>
                                    <p className="font-semibold text-[#0E1B16] text-sm mt-1">
                                        {displayEmail}
                                    </p>
                                </div>
                            </div>

                            {/* Unit/Bidang */}
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] flex items-center justify-center text-[#0F6A49] shrink-0">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[#6B7A73] text-xs font-medium">Unit/Bidang</p>
                                    <p className="font-semibold text-[#0E1B16] text-sm mt-1">
                                        {displayUnit}
                                    </p>
                                </div>
                            </div>

                            {/* Terakhir Masuk */}
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] flex items-center justify-center text-[#0F6A49] shrink-0">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[#6B7A73] text-xs font-medium">Terakhir Masuk</p>
                                    <p className="font-semibold text-[#0E1B16] text-sm mt-1">
                                        28 Oktober 2026, 08:15
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Modal */}
            <LogoutModal
                isOpen={logoutOpen}
                onClose={() => setLogoutOpen(false)}
            />
        </PpLayout>
    );
}
