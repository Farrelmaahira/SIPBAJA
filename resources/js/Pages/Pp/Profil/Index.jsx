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
    const displayName = roleTitle || (rawRole === 'PP' ? 'PP' : rawRole === 'Perencanaan' ? 'Perencanaan' : rawRole === 'PPK' ? 'PPK' : (user?.nama || 'PP'));
    const displayEmail = user?.email || 'pp@sipbaja.ac.id';
    const displayRole = rawRole;
    const displayUnit = typeof user?.unit === 'string' ? user.unit : (user?.unit?.nama || displayRole);

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

            {/* Hero Top Banner */}
            <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-7 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
                            AKUN
                        </span>
                        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight">
                            Profil Saya
                        </h1>
                        <p className="text-xs text-white/85 mt-1.5">
                            Lihat informasi akun yang sedang Anda gunakan.
                        </p>
                    </div>

                    <Link
                        href={`${basePath}/dashboard`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold transition-colors shrink-0 self-start sm:self-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                    </Link>
                </div>
                <div
                    className="absolute -right-10 -top-20 w-[260px] h-[260px] rounded-full bg-white/8 pointer-events-none"
                    aria-hidden="true"
                />
                <div
                    className="absolute right-28 -bottom-20 w-[180px] h-[180px] rounded-full bg-white/8 pointer-events-none"
                    aria-hidden="true"
                />
            </div>

            {/* Profile Grid (Left avatar card, Right info card) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Card: Avatar & Logout */}
                <div className="bg-white rounded-[22px] p-7 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 rounded-full bg-[#0E7C5A] text-white font-bold text-3xl flex items-center justify-center shadow-sm mb-4">
                        {roleInitials}
                    </div>
                    <h3 className="text-lg font-bold text-[#14201C]">{displayName}</h3>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E] mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#12A06B]" />
                        {displayRole}
                    </span>

                    <div className="w-full border-t border-[#F0F4F2] my-5" />

                    <button
                        type="button"
                        onClick={() => setLogoutOpen(true)}
                        className="w-full py-3 px-4 rounded-xl bg-[#FEE4E2]/70 hover:bg-[#FEE4E2] border border-[#FECDCA] text-xs font-bold text-[#D92D20] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                    </button>
                </div>

                {/* Right Card: Informasi Akun */}
                <div className="md:col-span-2 bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                    <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
                        <h3 className="text-base font-bold text-[#14201C]">Informasi Akun</h3>
                        <p className="text-xs text-[#8A9A95] mt-0.5">
                            Data akun yang sedang digunakan
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-xs">
                        {/* Nama */}
                        <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
                            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[#8A9A95] text-[11px]">Nama Lengkap</p>
                                <p className="font-bold text-[#0E7C5A] text-[13px] mt-0.5">
                                    {displayName}
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
                            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[#8A9A95] text-[11px]">Email</p>
                                <p className="font-bold text-[#14201C] text-[13px] mt-0.5">
                                    {displayEmail}
                                </p>
                            </div>
                        </div>

                        {/* Jenis Aktor */}
                        <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
                            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[#8A9A95] text-[11px]">Jenis Aktor</p>
                                <p className="font-bold text-[#14201C] text-[13px] mt-0.5">
                                    {displayRole}
                                </p>
                            </div>
                        </div>

                        {/* Unit / Bidang */}
                        <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
                            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[#8A9A95] text-[11px]">Unit/Bidang</p>
                                <p className="font-bold text-[#14201C] text-[13px] mt-0.5">
                                    {displayUnit}
                                </p>
                            </div>
                        </div>

                        {/* ID Pengguna */}
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                                <IdCard className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[#8A9A95] text-[11px]">ID Pengguna</p>
                                <p className="font-bold text-[#14201C] text-[13px] mt-0.5">
                                    PPBJ-0012
                                </p>
                            </div>
                        </div>

                        {/* Terakhir Masuk */}
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[#8A9A95] text-[11px]">Terakhir Masuk</p>
                                <p className="font-bold text-[#14201C] text-[13px] mt-0.5">
                                    28 Oktober 2026, 08:15
                                </p>
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
