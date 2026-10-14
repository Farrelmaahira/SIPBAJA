import { useEffect } from 'react';
import DashboardIcon from '../atoms/icons/DashboardIcon';
import UsersIcon from '../atoms/icons/UsersIcon';
import BuildingIcon from '../atoms/icons/BuildingIcon';
import LayersIcon from '../atoms/icons/LayersIcon';
import XIcon from '../atoms/icons/XIcon';
import SidebarNavItem from '../molecules/SidebarNavItem';
import HelpCard from '../molecules/HelpCard';

export default function AdminSidebar({
    mobileOpen = false,
    onClose,
    activeRoute = 'admin.dashboard',
}) {
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape' && mobileOpen && onClose) {
                onClose();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [mobileOpen, onClose]);

    const navItems = [
        {
            key: 'admin.dashboard',
            label: 'Dashboard',
            icon: DashboardIcon,
            href: '/admin/dashboard',
            active: activeRoute === 'admin.dashboard',
        },
        {
            key: 'admin.users',
            label: 'Pengguna',
            icon: UsersIcon,
            href: '#pengguna',
            active: activeRoute === 'admin.users',
        },
        {
            key: 'admin.units',
            label: 'Unit Kerja',
            icon: BuildingIcon,
            href: '#unit-kerja',
            active: activeRoute === 'admin.units',
        },
        {
            key: 'admin.mak',
            label: 'Master MAK',
            icon: LayersIcon,
            href: '#master-mak',
            active: activeRoute === 'admin.mak',
        },
    ];

    const sidebarContent = (
        <div className="flex flex-col h-full justify-between">
            <div>
                {/* Brand Header */}
                <div className="flex items-center justify-between pb-6 border-b border-[#E4EBE8]">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-[10px] bg-[#0E7C5A] flex items-center justify-center shrink-0 shadow-sm"
                            aria-hidden="true"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#FFFFFF"
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
                            <div className="flex items-baseline tracking-tight font-bold text-lg leading-none">
                                <span className="text-[#14201C]">SIP</span>
                                <span className="text-[#0E7C5A]">BAJA</span>
                            </div>
                            <p className="text-[10px] font-medium text-[#5F6F6A] mt-1 tracking-tight leading-none">
                                Panel Administrator
                            </p>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl text-[#5F6F6A] hover:bg-[#EEF5F2] hover:text-[#14201C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A]"
                            aria-label="Tutup menu navigasi"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Section Navigation */}
                <div className="pt-6">
                    <p className="px-4 text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider mb-3">
                        Manajemen Sistem
                    </p>
                    <nav className="space-y-1.5" aria-label="Navigasi admin">
                        {navItems.map((item) => (
                            <SidebarNavItem
                                key={item.key}
                                icon={item.icon}
                                label={item.label}
                                href={item.href}
                                active={item.active}
                                onClick={onClose}
                            />
                        ))}
                    </nav>
                </div>
            </div>

            {/* Bottom Help Card */}
            <div className="pt-6">
                <HelpCard />
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Fixed Sidebar */}
            <aside className="hidden md:flex flex-col w-[272px] shrink-0 min-h-screen bg-white border-r border-[#E4EBE8] p-6 sticky top-0 h-screen overflow-y-auto">
                {sidebarContent}
            </aside>

            {/* Mobile Off-canvas Drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-[#14201C]/40 backdrop-blur-xs transition-opacity"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Drawer Panel */}
                    <aside
                        className="fixed inset-y-0 left-0 w-[280px] max-w-[85vw] bg-white p-6 shadow-2xl flex flex-col z-50 overflow-y-auto"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu navigasi admin"
                    >
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
}
