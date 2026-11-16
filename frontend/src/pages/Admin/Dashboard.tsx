import { useEffect, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import AdminDashboardTemplate from '../../components/templates/AdminDashboardTemplate';
import type { RecentUserItem } from '../../components/organisms/RecentUsersTable';
import type { AdminStatItem } from '../../types/admin';

export const AdminDashboard: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState<AdminStatItem[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUserItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    adminService
      .getDashboard(controller.signal)
      .then((data) => {
        setStats(data.stats || []);
        setRecentUsers(data.recentUsers || []);
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          return;
        }
        console.error('Failed to fetch admin dashboard:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
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
      recentUsers={recentUsers}
      userName={user?.nama || 'Administrator'}
      isLoading={isLoading}
      onAddUser={handleAddUser}
      onViewUser={handleViewUser}
      onViewAllUsers={handleViewAllUsers}
    />
  );
};

export default AdminDashboard;
