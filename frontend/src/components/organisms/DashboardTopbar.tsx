import { useState, useRef, useEffect, type FC, type ChangeEvent, type MouseEvent } from 'react';
import { Menu, Bell } from 'lucide-react';
import SearchBar from '../molecules/SearchBar';
import ProfilePill, { type ProfilePillUser } from '../molecules/ProfilePill';
import NotificationDropdown from './NotificationDropdown';
import api from '../../services/api';

export interface DashboardTopbarProps {
  onMenuClick?: () => void;
  user?: ProfilePillUser | null;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  searchId?: string;
  notificationAriaLabel?: string;
  showNotification?: boolean;
  hasUnread?: boolean;
  onNotificationClick?: (e: MouseEvent) => void;
  profileFallbackName?: string;
  profileFallbackRole?: string;
  profileFallbackEmail?: string;
}

export const DashboardTopbar: FC<DashboardTopbarProps> = ({
  onMenuClick,
  user,
  showSearch,
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
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    api
      .get<{ unreadCount?: number }>('/v1/notifications/unread-count')
      .then((res) => {
        if (isMounted && res.data.unreadCount !== undefined) {
          setUnreadCount(res.data.unreadCount);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [notifOpen]);

  useEffect(() => {
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
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

  const handleBellClick = (e: MouseEvent) => {
    if (onNotificationClick) {
      onNotificationClick(e);
    } else {
      setNotifOpen((prev) => !prev);
    }
  };

  const shouldShowSearch = showSearch !== undefined ? showSearch : Boolean(onSearchChange);

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

        {shouldShowSearch && (
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              id={searchId}
            />
          </div>
        )}
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
              {(hasUnread || unreadCount > 0) && (
                <span
                  className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#E5484D] border-2 border-white ring-1 ring-white"
                  aria-hidden="true"
                />
              )}
            </button>

            <NotificationDropdown
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
              unreadCount={unreadCount}
              onMarkAllRead={() => setUnreadCount(0)}
              notifikasiHref="/notifikasi"
            />
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
};

export default DashboardTopbar;
