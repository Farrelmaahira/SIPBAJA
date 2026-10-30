import { useEffect, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import useUserSearch from '../../hooks/useUserSearch';
import AdminDashboardTemplate, {
  type AdminStatsData,
} from '../../components/templates/AdminDashboardTemplate';
import normalizeAdminStats from '../../utils/normalizeAdminStats';
import type { RecentUserItem } from '../../components/organisms/RecentUsersTable';

export const AdminDashboard: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState<AdminStatsData>({});
  const [recentUsers, setRecentUsers] = useState<RecentUserItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { query, setQuery, filteredUsers } = useUserSearch(recentUsers);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api
      .get<{
        stats?: Record<string, unknown>;
        recentUsers?: RecentUserItem[];
        users?: RecentUserItem[];
      }>('/v1/admin/dashboard')
      .then((response) => {
        if (!isMounted) return;
        const data = response.data;
        if (data.stats) {
          setStats(normalizeAdminStats(data.stats));
        }
        if (data.recentUsers) {
          setRecentUsers(data.recentUsers);
        } else if (data.users) {
          setRecentUsers(data.users);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch admin dashboard:', error);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddUser = () => {
    navigate('/admin/pengguna');
  };

  const handleViewUser = (_user: RecentUserItem) => {
    navigate('/admin/pengguna');
  };

  const handleViewAllUsers = () => {
    navigate('/admin/pengguna');
  };

  return (
    <AdminDashboardTemplate
      stats={stats}
      filteredUsers={filteredUsers}
      user={user}
      activeRoute="admin.dashboard"
      searchQuery={query}
      onSearchChange={(e) => setQuery(e.target.value)}
      isLoading={isLoading}
      onAddUser={handleAddUser}
      onViewUser={handleViewUser}
      onViewAllUsers={handleViewAllUsers}
    />
  );
};

export default AdminDashboard;
