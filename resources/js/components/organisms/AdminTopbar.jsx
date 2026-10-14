import MenuIcon from '../atoms/icons/MenuIcon';
import BellIcon from '../atoms/icons/BellIcon';
import SearchBar from '../molecules/SearchBar';
import ProfilePill from '../molecules/ProfilePill';

export default function AdminTopbar({
    onMenuClick,
    user,
    searchValue = '',
    onSearchChange,
}) {
    return (
        <header className="flex items-center justify-between gap-4 pb-6">
            <div className="flex items-center gap-3 flex-1">
                {/* Mobile Menu Toggle Button */}
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="md:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#EEF5F2] hover:text-[#14201C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                    aria-label="Buka menu navigasi"
                >
                    <MenuIcon className="w-5 h-5" />
                </button>

                {/* Search Bar */}
                <div className="flex-1 max-w-md">
                    <SearchBar
                        value={searchValue}
                        onChange={onSearchChange}
                        placeholder="Cari data pengguna atau unit kerja..."
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Notification Button with Dot */}
                <button
                    type="button"
                    className="relative inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#EEF5F2] hover:text-[#14201C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                    aria-label="Notifikasi sistem"
                >
                    <BellIcon className="w-5 h-5" />
                    <span
                        className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#E5484D] border-2 border-white ring-1 ring-white"
                        aria-hidden="true"
                    />
                </button>

                {/* Admin Profile Pill */}
                <ProfilePill user={user} />
            </div>
        </header>
    );
}
