import { useEffect, useState, useCallback, type FC } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import bidang2Service from '../../../services/bidang2Service';
import Bidang2RkaklTemplate from '../../../components/templates/Bidang2RkaklTemplate';

export const RkaklIndex: FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchRkakl = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setHasError(false);

    try {
      await bidang2Service.getRkakl(signal);
    } catch (err: unknown) {
      if (!signal?.aborted) {
        setHasError(true);
        console.error('Failed to fetch Bidang 2 RKAKL:', err);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchRkakl(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchRkakl]);

  return (
    <Bidang2RkaklTemplate
      user={user}
      isLoading={isLoading}
      hasError={hasError}
      onRetry={() => void fetchRkakl()}
    />
  );
};

export default RkaklIndex;
