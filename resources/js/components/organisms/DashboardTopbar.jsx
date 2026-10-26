import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, CheckCircle2 } from 'lucide-react';
import SearchBar from '../molecules/SearchBar';
import ProfilePill from '../molecules/ProfilePill';

export default function DashboardTopbar({
    onMenuClick,
    user,
    searchValue = '',
    onSearchChange,
    searchPlaceholder = '',
    searchId = 'dashboard-search-input',
    notificationAriaLabel = 'Notifikasi',
    showNotification = true,
    hasUnread = false,
    onNotificationClick,
    profileFallbackName,
    profileFallbackRole,
    profileFallbackEmail,
}) {
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        }
        function handleKeyDown(e) {
            if (e.key === 'Escape') setNotifOpen(false);
        }
        if (notifOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [notifOpen]);

    const handleBellClick = (e) => {
        if (onNotificationClick) {
            onNotificationClick(e);
        } else {
            setNotifOpen((prev) => !prev);
        }
    };

    return (
        <header className="flex items-center justify-between gap-4 pb-6">
            <div className="flex items-center gap-3 flex-1">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="md:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#EEF5F2] hover:text-[#14201C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                    aria-label="Buka menu navigasi"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="flex-1 max-w-md">
                    <SearchBar
                        value={searchValue}
                        onChange={onSearchChange}
                        placeholder={searchPlaceholder}
                        id={searchId}
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {showNotification && (
                    <div className="relative" ref={notifRef}>
                        <button
                            type="button"
                            onClick={handleBellClick}
                            className="relative inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#EEF5F2] hover:text-[#14201C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                            aria-label={notificationAriaLabel}
                            aria-expanded={notifOpen}
                        >
                            <Bell className="w-5 h-5" />
                            {hasUnread && (
                                <span
                                    className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#E5484D] border-2 border-white ring-1 ring-white"
                                    aria-hidden="true"
                                />
                            )}
                        </button>

                        {notifOpen && (
                            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#E4EBE8] shadow-xl py-3 z-50">
                                <div className="flex items-center justify-between px-4 pb-2.5 border-b border-[#F2F4F7]">
                                    <h4 className="text-sm font-bold text-[#1D2939]">Notifikasi</h4>
                                    <span className="text-[11px] text-[#0E7C5A] font-semibold">Tandai sudah dibaca</span>
                                </div>
                                <div className="p-4 text-center">
                                    <div className="w-10 h-10 rounded-full bg-[#E4F6EC] text-[#0E7C5A] flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-[#1D2939]">Semua Beres!</p>
                                    <p className="text-[11px] text-[#667085] mt-0.5">
                                        Tidak ada notifikasi atau pembaruan status baru saat ini.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <ProfilePill
                    user={user}
                    fallbackName={profileFallbackName}
                    fallbackRole={profileFallbackRole}
                    fallbackEmail={profileFallbackEmail}
                />
            </div>
        </header>
    );
}
