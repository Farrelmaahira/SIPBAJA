import { useState, useEffect, useCallback } from 'react';
import ppkService from '../services/ppkService';
import type { PpkDashboardResponse } from '../types/ppk';

export interface UsePpkDashboardResult {
  data: PpkDashboardResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePpkDashboard(): UsePpkDashboardResult {
  const [data, setData] = useState<PpkDashboardResponse | null>(null);
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

    ppkService
      .getDashboard(controller.signal)
      .then((res) => {
        setData(res);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch PPK dashboard data:', err);
          setError('Gagal memuat data dashboard PPK.');
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

export default usePpkDashboard;
