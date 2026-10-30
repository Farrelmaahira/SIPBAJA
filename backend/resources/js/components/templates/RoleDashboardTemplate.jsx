import DashboardShellTemplate from './DashboardShellTemplate';

export default function RoleDashboardTemplate({
    roleTitle = 'Dashboard',
    roleDescription = 'Sistem Informasi Pengadaan Barang dan Jasa (SIPBAJA)',
    user = {},
    children,
}) {
    const displayName = user?.nama || user?.name || roleTitle;
    const userRole = user?.role?.nama || roleTitle;
    const unitName = user?.unit?.nama || user?.unit_kerja?.nama || null;

    return (
        <DashboardShellTemplate
            sidebarProps={{
                navItems: [],
                brandSubtitle: userRole,
            }}
            topbarProps={{
                user,
            }}
        >
            <div className="relative rounded-[24px] bg-[#0E7C5A] text-white p-7 md:py-8 md:px-9 overflow-hidden shadow-[0_10px_24px_rgba(13,51,38,0.14)]">
                <div
                    className="absolute -right-16 -top-16 w-[260px] h-[260px] rounded-full bg-white/8 pointer-events-none"
                    aria-hidden="true"
                />
                <div
                    className="absolute right-24 -bottom-20 w-[170px] h-[170px] rounded-full bg-white/7 pointer-events-none hidden sm:block"
                    aria-hidden="true"
                />

                <div className="relative z-10 max-w-2xl">
                    <p className="text-[12px] font-semibold tracking-[0.12em] text-white/75 uppercase mb-2">
                        {userRole}
                    </p>
                    <h1 className="text-2xl md:text-[26px] font-bold leading-tight tracking-tight mb-2">
                        Selamat Datang, {displayName}
                    </h1>
                    <p className="text-sm text-white/85 leading-relaxed">
                        {roleDescription}
                    </p>
                </div>
            </div>

            <section
                className="bg-white border border-[#E4EBE8] rounded-[20px] p-6 shadow-[0_4px_16px_rgba(13,51,38,0.05)]"
                aria-label="Informasi Dashboard"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4EBE8]">
                    <div>
                        <h2 className="text-lg font-bold text-[#14201C]">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="p-4 rounded-xl bg-[#F7FAF9] border border-[#E4EBE8]">
                        <p className="text-xs font-medium text-[#5F6F6A]">Peran Sistem</p>
                        <p className="text-sm font-semibold text-[#14201C] mt-1">{userRole}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#F7FAF9] border border-[#E4EBE8]">
                        <p className="text-xs font-medium text-[#5F6F6A]">Unit / Bagian</p>
                        <p className="text-sm font-semibold text-[#14201C] mt-1">
                            {unitName ?? 'Semua Unit / Kampus'}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#F7FAF9] border border-[#E4EBE8]">
                        <p className="text-xs font-medium text-[#5F6F6A]">Email Terdaftar</p>
                        <p className="text-sm font-semibold text-[#14201C] mt-1">
                            {user?.email || '-'}
                        </p>
                    </div>
                </div>

                {children && <div className="mt-6 pt-6 border-t border-[#E4EBE8]">{children}</div>}
            </section>
        </DashboardShellTemplate>
    );
}
