import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

function getInitials(name = '') {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ProfilePill({ user = {}, className = '' }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    const displayName = user?.name || user?.nama || 'Administrator';
    const displayRole = user?.role || 'Administrator Utama';
    const initials = getInitials(displayName);

    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        function handleKeyDown(e) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-white/80 active:bg-white border border-transparent hover:border-[#E4EBE8] transition-all cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A]"
                aria-expanded={open}
                aria-haspopup="true"
            >
                <div
                    className="w-10 h-10 rounded-full bg-[#D6EFE4] text-[#0E7C5A] font-bold text-sm flex items-center justify-center shrink-0 select-none"
                    aria-hidden="true"
                >
                    {initials}
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-[#14201C] leading-tight truncate max-w-[140px]">
                        {displayName}
                    </p>
                    <p className="text-[11px] text-[#8A9A95] leading-tight truncate">
                        {displayRole}
                    </p>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-[#8A9A95] transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-[#E4EBE8] shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#E4EBE8]">
                        <p className="text-xs font-semibold text-[#14201C] truncate">
                            {displayName}
                        </p>
                        <p className="text-[11px] text-[#8A9A95] truncate">
                            {user?.email || 'admin@pnj.ac.id'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#B42318] hover:bg-[#FDECEC] transition-colors cursor-pointer"
                    >
                        Keluar dari akun
                    </button>
                </div>
            )}
        </div>
    );
}
