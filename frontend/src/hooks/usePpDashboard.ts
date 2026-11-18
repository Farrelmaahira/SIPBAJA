import { useState, useEffect, useCallback } from 'react';
import ppService from '../services/ppService';
import type { PpDashboardResponse } from '../types/pp';

export interface UsePpDashboardResult {
  data: PpDashboardResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePpDashboard(): UsePpDashboardResult {
  const [data, setData] = useState<PpDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);

  const refetch = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    ppService
      .getDashboardData(controller.signal)
      .then((res) => {
        setData(res);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch PP dashboard data:', err);
          setError('Gagal memuat data dashboard PP.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [reloadToken]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

export default usePpDashboard;
