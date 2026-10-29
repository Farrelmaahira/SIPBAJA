import { LayoutGrid, FileText, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function PpSidebar({
    activeRoute = 'dashboard',
    mobileOpen = false,
    onClose,
    pendingCount = 4,
    navItems: customNavItems = null,
}) {
    const defaultNavItems = [
        {
            key: 'dashboard',
            label: 'Dashboard',
            icon: LayoutGrid,
            href: '/pp/dashboard',
            badge: null,
        },
        {
            key: 'pengajuan',
            label: 'List Pengajuan',
            icon: FileText,
            href: '/pp/pengajuan',
            badge: pendingCount,
        },
    ];

    const navItems = customNavItems || defaultNavItems;

    const sidebarContent = (
        <aside className="w-[248px] bg-white border-r border-[#E4EBE8] flex flex-col h-screen sticky top-0 px-4 py-6 select-none">
            {/* Brand */}
            <div className="flex items-center justify-between px-2 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0E7C5A] flex items-center justify-center shrink-0 shadow-xs text-white">
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-baseline tracking-tight font-extrabold text-[18px] leading-none">
                            <span className="text-[#14201C]">SIP</span>
                            <span className="text-[#0E7C5A]">BAJA</span>
                        </div>
                        <p className="text-[11px] text-[#8A9A95] font-medium mt-1 leading-none">
                            Pengadaan Barang &amp; Jasa
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="md:hidden p-1.5 rounded-lg text-[#5F6F6A] hover:bg-[#EEF5F2]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Nav section */}
            <div className="pt-2">
                <p className="px-3 text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider mb-2.5">
                    MENU
                </p>
                <nav className="space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = activeRoute === item.key;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-150 ${
                                    isActive
                                        ? 'bg-[#E8F5EF] text-[#0E7C5A] font-bold'
                                        : 'text-[#5F6F6A] font-medium hover:bg-[#F4F7F5] hover:text-[#14201C]'
                                }`}
                            >
                                {isActive && (
                                    <span
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0E7C5A] rounded-r-full"
                                        aria-hidden="true"
                                    />
                                )}
                                <div className="flex items-center gap-3">
                                    <Icon
                                        className={`w-[18px] h-[18px] ${
                                            isActive ? 'text-[#0E7C5A]' : 'text-[#5F6F6A]'
                                        }`}
                                    />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge !== null && item.badge !== undefined && (
                                    <span
                                        className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                                            isActive
                                                ? 'bg-[#0E7C5A] text-white'
                                                : 'bg-[#EEF2F0] text-[#5F6F6A]'
                                        }`}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop */}
            <div className="hidden md:block shrink-0">{sidebarContent}</div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-xs flex">
                    <div className="w-[248px] max-w-xs">{sidebarContent}</div>
                    <div className="flex-1" onClick={onClose} />
                </div>
            )}
        </>
    );
}
