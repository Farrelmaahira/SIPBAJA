import type { FC, ChangeEvent } from 'react';
import DashboardTopbar, { type DashboardTopbarProps } from './DashboardTopbar';
import type { ProfilePillUser } from '../molecules/ProfilePill';

export const adminTopbarPreset: Partial<DashboardTopbarProps> = {
  searchPlaceholder: 'Cari data pengguna atau unit kerja...',
  searchId: 'admin-search-input',
  notificationAriaLabel: 'Notifikasi sistem',
  profileFallbackName: 'Administrator',
  profileFallbackRole: 'Administrator Utama',
  profileFallbackEmail: 'admin@pnj.ac.id',
};

export interface AdminTopbarProps {
  onMenuClick?: () => void;
  user?: ProfilePillUser | null;
  searchValue?: string;
  onSearchChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const AdminTopbar: FC<AdminTopbarProps> = ({
  onMenuClick,
  user,
  searchValue = '',
  onSearchChange,
}) => {
  return (
    <DashboardTopbar
      onMenuClick={onMenuClick}
      user={user}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      {...adminTopbarPreset}
    />
  );
};

export default AdminTopbar;
