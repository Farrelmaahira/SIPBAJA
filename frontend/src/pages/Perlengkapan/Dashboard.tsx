import { useEffect, useState, type FC } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import RoleDashboardTemplate from '../../components/templates/RoleDashboardTemplate';

export const PerlengkapanDashboard: FC = () => {
  const { user } = useAuth();
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api
      .get('/v1/perlengkapan/dashboard')
      .catch((err) => {
        console.error('Failed to fetch Perlengkapan dashboard:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <RoleDashboardTemplate
      roleTitle="Dashboard Perlengkapan"
      roleDescription="Pencatatan penerimaan barang, dokumentasi fisik, dan berita acara penerimaan."
      user={user}
    />
  );
};

export default PerlengkapanDashboard;
