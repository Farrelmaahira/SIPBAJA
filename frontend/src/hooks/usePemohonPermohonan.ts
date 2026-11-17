import { useState, useEffect, useCallback, type FormEvent } from 'react';
import pemohonService from '../services/pemohonService';
import type { PermohonanItem } from '../types/permohonan';

export interface UsePemohonPermohonanPagination {
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}

export interface UsePemohonPermohonanReturn {
  items: PermohonanItem[];
  pagination: UsePemohonPermohonanPagination;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  filterModalOpen: boolean;
  setFilterModalOpen: (open: boolean) => void;
  handlePageChange: (page: number) => void;
  handleSearchSubmit: (e?: FormEvent) => void;
  handleApplyFilter: (status: string) => void;
  handleResetFilter: () => void;
  refetch: () => void;
}

export function usePemohonPermohonan(): UsePemohonPermohonanReturn {
  const [items, setItems] = useState<PermohonanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('semua');
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const [pagination, setPagination] = useState<UsePemohonPermohonanPagination>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  const fetchList = useCallback(
    async (
      page = 1,
      status = selectedStatus,
      search = appliedSearch,
      signal?: AbortSignal
    ) => {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');

      try {
        const res = await pemohonService.getPermohonanList(
          {
            page,
            status,
            search,
          },
          signal
        );

        if (res.permohonanList) {
          const listData = res.permohonanList.data || [];
          setItems(listData);
          setPagination({
            currentPage: res.permohonanList.current_page || page,
            lastPage: res.permohonanList.last_page || 1,
            total: res.permohonanList.total || listData.length,
            from: res.permohonanList.from || (listData.length > 0 ? 1 : 0),
            to: res.permohonanList.to || listData.length,
          });
        }
      } catch (err: unknown) {
        if (signal?.aborted) return;
        setHasError(true);
        const errMsg =
          err instanceof Error
            ? err.message
            : 'Gagal memuat daftar permohonan. Silakan coba kembali.';
        setErrorMessage(errMsg);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [selectedStatus, appliedSearch]
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchList(pagination.currentPage, selectedStatus, appliedSearch, controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchList, pagination.currentPage, selectedStatus, appliedSearch]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.lastPage && page !== pagination.currentPage) {
        setPagination((prev) => ({ ...prev, currentPage: page }));
      }
    },
    [pagination.lastPage, pagination.currentPage]
  );

  const handleSearchSubmit = useCallback(
    (e?: FormEvent) => {
      if (e) e.preventDefault();
      setAppliedSearch(searchQuery.trim());
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    },
    [searchQuery]
  );

  const handleApplyFilter = useCallback((status: string) => {
    setSelectedStatus(status);
    setFilterModalOpen(false);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleResetFilter = useCallback(() => {
    setSelectedStatus('semua');
    setFilterModalOpen(false);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const refetch = useCallback(() => {
    void fetchList(pagination.currentPage, selectedStatus, appliedSearch);
  }, [fetchList, pagination.currentPage, selectedStatus, appliedSearch]);

  return {
    items,
    pagination,
    isLoading,
    hasError,
    errorMessage,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    filterModalOpen,
    setFilterModalOpen,
    handlePageChange,
    handleSearchSubmit,
    handleApplyFilter,
    handleResetFilter,
    refetch,
  };
}

export default usePemohonPermohonan;

