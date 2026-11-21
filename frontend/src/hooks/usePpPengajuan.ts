import { useState, useEffect, useCallback, type FormEvent } from 'react';
import ppService from '../services/ppService';
import type {
  PpPengadaanItem,
  PpPengajuanFilterParams,
  PpPengajuanListResponse,
} from '../types/pp';

export interface UsePpPengajuanResult {
  items: PpPengadaanItem[];
  totalCount: number;
  currentPage: number;
  lastPage: number;
  searchQuery: string;
  selectedStatuses: string[];
  selectedBulan: string;
  selectedTahun: string;
  filterModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
  setSearchQuery: (query: string) => void;
  setSelectedBulan: (bulan: string) => void;
  setSelectedTahun: (tahun: string) => void;
  setCurrentPage: (page: number) => void;
  setFilterModalOpen: (open: boolean) => void;
  handleSearchSubmit: (e: FormEvent) => void;
  handleApplyFilter: (statuses: string[]) => void;
  refetch: () => void;
}

export function usePpPengajuan(basePath = '/pp'): UsePpPengajuanResult {
  const [data, setData] = useState<PpPengajuanListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [submittedSearch, setSubmittedSearch] = useState<string>('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedBulan, setSelectedBulan] = useState<string>('');
  const [selectedTahun, setSelectedTahun] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [reloadToken, setReloadToken] = useState<number>(0);

  const refetch = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

  const handleSearchSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSubmittedSearch(searchQuery);
  }, [searchQuery]);

  const handleApplyFilter = useCallback((statuses: string[]) => {
    setSelectedStatuses(statuses);
    setCurrentPage(1);
    setFilterModalOpen(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const params: PpPengajuanFilterParams = {
      q: submittedSearch || undefined,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      bulan: selectedBulan || undefined,
      tahun: selectedTahun || undefined,
      page: currentPage,
    };

    ppService
      .getPengajuanList(params, controller.signal, basePath)
      .then((res) => {
        setData(res);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch PP pengajuan list:', err);
          setError('Gagal memuat daftar pengajuan PP.');
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
  }, [submittedSearch, selectedStatuses, selectedBulan, selectedTahun, currentPage, reloadToken]);

  const items = data?.pengajuan?.data || [];
  const totalCount = data?.pengajuan?.total || 0;
  const lastPage = data?.pengajuan?.last_page || 1;

  return {
    items,
    totalCount,
    currentPage,
    lastPage,
    searchQuery,
    selectedStatuses,
    selectedBulan,
    selectedTahun,
    filterModalOpen,
    isLoading,
    error,
    setSearchQuery,
    setSelectedBulan,
    setSelectedTahun,
    setCurrentPage,
    setFilterModalOpen,
    handleSearchSubmit,
    handleApplyFilter,
    refetch,
  };
}

export default usePpPengajuan;
