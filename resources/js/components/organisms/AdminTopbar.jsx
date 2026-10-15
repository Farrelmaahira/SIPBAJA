import DashboardTopbar from './DashboardTopbar';

export const adminTopbarPreset = {
    searchPlaceholder: 'Cari data pengguna atau unit kerja...',
    searchId: 'admin-search-input',
    notificationAriaLabel: 'Notifikasi sistem',
    profileFallbackName: 'Administrator',
    profileFallbackRole: 'Administrator Utama',
    profileFallbackEmail: 'admin@pnj.ac.id',
};

export default function AdminTopbar({
    onMenuClick,
    user,
    searchValue = '',
    onSearchChange,
}) {
    return (
        <DashboardTopbar
            onMenuClick={onMenuClick}
            user={user}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            {...adminTopbarPreset}
        />
    );
}
