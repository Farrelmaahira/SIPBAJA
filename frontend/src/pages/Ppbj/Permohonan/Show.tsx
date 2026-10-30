import { useEffect, useState, type FC } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import PermohonanShowTemplate from '../../../components/templates/PermohonanShowTemplate';

export const PpbjPermohonanShow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [permohonan, setPermohonan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoading(true);

    api
      .get<{
        permohonan?: any;
        data?: any;
      }>(`/v1/ppbj/permohonan/${id}`)
      .then((res) => {
        if (!isMounted) return;
        const data = res.data;
        setPermohonan(data.permohonan || data.data || data);
      })
      .catch((err) => {
        console.error('Failed to fetch PPBJ permohonan detail:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return <PermohonanShowTemplate user={user} permohonan={permohonan} isLoading={isLoading} />;
};

export default PpbjPermohonanShow;
