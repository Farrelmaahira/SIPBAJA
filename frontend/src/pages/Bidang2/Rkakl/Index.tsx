import { useEffect, useState, type FC } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import bidang2Service from '../../../services/bidang2Service';
import Bidang2RkaklTemplate from '../../../components/templates/Bidang2RkaklTemplate';

export const RkaklIndex: FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);
    setHasError(false);

    bidang2Service
      .getRkakl(controller.signal)
      .catch((err: unknown) => {
        if (!isMounted || controller.signal.aborted) return;
        setHasError(true);
        console.error('Failed to fetch Bidang 2 RKAKL:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [refreshTrigger]);

  return (
    <Bidang2RkaklTemplate
      user={user}
      isLoading={isLoading}
      hasError={hasError}
      onRetry={() => setRefreshTrigger((prev) => prev + 1)}
    />
  );
};

export default RkaklIndex;
