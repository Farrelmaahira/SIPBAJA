import { useEffect, useState, type FC } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import PermohonanIndexTemplate from '../../../components/templates/PermohonanIndexTemplate';

export const PpbjPermohonanIndex: FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api
      .get<{
        permohonanList?: any[];
        data?: any[];
      }>('/v1/ppbj/permohonan')
      .then((res) => {
        if (!isMounted) return;
        const data = res.data;
        if (data.permohonanList) {
          setItems(data.permohonanList);
        } else if (Array.isArray(data.data)) {
          setItems(data.data);
        } else if (Array.isArray(data)) {
          setItems(data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch PPBJ permohonan:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return <PermohonanIndexTemplate user={user} items={items} />;
};

export default PpbjPermohonanIndex;
