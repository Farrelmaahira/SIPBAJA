import PlusIcon from '../atoms/icons/PlusIcon';

export default function HeroBanner({
    userName = 'Administrator',
    onAddUser,
    className = '',
}) {
    return (
        <section
            className={`relative overflow-hidden bg-[#0E7C5A] text-white rounded-[24px] p-6 md:p-8 min-h-[148px] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(14,124,90,0.15)] ${className}`}
            aria-labelledby="hero-title"
        >
            {/* Decorative concentric circles on the right */}
            <div
                className="absolute -right-16 -top-16 w-[260px] h-[260px] rounded-full border border-white/10 pointer-events-none hidden sm:block"
                aria-hidden="true"
            />
            <div
                className="absolute -right-6 -bottom-12 w-[170px] h-[170px] rounded-full border border-white/15 pointer-events-none hidden sm:block"
                aria-hidden="true"
            />

            {/* Left Content */}
            <div className="relative z-10 max-w-xl">
                <p className="text-[11px] font-bold text-white/75 tracking-wider uppercase mb-1">
                    Dashboard Administrator
                </p>
                <h1
                    id="hero-title"
                    className="text-xl md:text-2xl font-bold tracking-tight text-white"
                >
                    Selamat datang, {userName}
                </h1>
                <p className="text-xs md:text-sm text-white/80 mt-1 leading-relaxed">
                    Kelola akun pengguna, unit kerja, dan konfigurasi master data pengadaan.
                </p>
            </div>

            {/* Right Action CTA */}
            <div className="relative z-10 shrink-0">
                <button
                    type="button"
                    onClick={onAddUser}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-white text-[#0E7C5A] hover:bg-[#EEF5F2] active:bg-[#D6EFE4] text-sm font-semibold transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E7C5A] cursor-pointer"
                >
                    <PlusIcon className="w-5 h-5 text-[#0E7C5A]" />
                    <span>Tambah Pengguna</span>
                </button>
            </div>
        </section>
    );
}
