import { useState, useEffect, useCallback, type FormEvent } from 'react';
import bidang2Service from '../services/bidang2Service';
import type { Bidang2PengajuanListItem } from '../types/bidang2';

export interface UseBidang2PengajuanPagination {
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}

export interface UseBidang2PengajuanReturn {
  items: Bidang2PengajuanListItem[];
  pagination: UseBidang2PengajuanPagination;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  handleSearchSubmit: (e?: FormEvent) => void;
  handleStatusChange: (status: string) => void;
  handlePageChange: (page: number) => void;
  refetch: () => void;
}

export function useBidang2Pengajuan(): UseBidang2PengajuanReturn {
  const [items, setItems] = useState<Bidang2PengajuanListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('semua');

  const [pagination, setPagination] = useState<UseBidang2PengajuanPagination>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  const fetchPengajuanList = useCallback(
    async (
      search = appliedSearch,
      status = selectedStatus,
      page = pagination.currentPage,
      signal?: AbortSignal
    ) => {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');

      try {
        const res = await bidang2Service.getPengajuanList(
          {
            search,
            status,
            page,
          },
          signal
        );

        const listPayload = res.permohonanList;
        if (listPayload) {
          const dataItems = listPayload.data || [];
          setItems(dataItems);
          setPagination({
            currentPage: listPayload.current_page || page,
            lastPage: listPayload.last_page || 1,
            total: listPayload.total || dataItems.length,
            from: listPayload.from || (dataItems.length > 0 ? 1 : 0),
            to: listPayload.to || dataItems.length,
          });
        } else {
          setItems([]);
          setPagination({
            currentPage: 1,
            lastPage: 1,
            total: 0,
            from: 0,
            to: 0,
          });
        }
      } catch (err: unknown) {
        if (signal?.aborted) return;
        setHasError(true);
        const errMsg =
          err instanceof Error
            ? err.message
            : 'Gagal memuat daftar pengajuan. Silakan coba kembali.';
        setErrorMessage(errMsg);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [appliedSearch, selectedStatus, pagination.currentPage]
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchPengajuanList(
      appliedSearch,
      selectedStatus,
      pagination.currentPage,
      controller.signal
    );

    return () => {
      controller.abort();
    };
  }, [fetchPengajuanList, appliedSearch, selectedStatus, pagination.currentPage]);

  const handleSearchSubmit = useCallback(
    (e?: FormEvent) => {
      if (e) e.preventDefault();
      setAppliedSearch(searchQuery.trim());
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    },
    [searchQuery]
  );

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.lastPage && page !== pagination.currentPage) {
        setPagination((prev) => ({ ...prev, currentPage: page }));
      }
    },
    [pagination.lastPage, pagination.currentPage]
  );

  const refetch = useCallback(() => {
    void fetchPengajuanList(appliedSearch, selectedStatus, pagination.currentPage);
  }, [fetchPengajuanList, appliedSearch, selectedStatus, pagination.currentPage]);

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
    handleSearchSubmit,
    handleStatusChange,
    handlePageChange,
    refetch,
  };
}

export default useBidang2Pengajuan;

