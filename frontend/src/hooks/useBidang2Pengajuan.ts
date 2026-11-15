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
  selectedStatuses: string[];
  filterModalOpen: boolean;
  setFilterModalOpen: (open: boolean) => void;
  handleSearchSubmit: (e?: FormEvent) => void;
  handleStatusChange: (status: string) => void;
  handleApplyFilter: (statuses: string[]) => void;
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
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [pagination, setPagination] = useState<UseBidang2PengajuanPagination>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    bidang2Service
      .getPengajuanList(
        {
          search: appliedSearch,
          status: selectedStatus,
          page: currentPage,
        },
        controller.signal
      )
      .then((res) => {
        if (!isMounted) return;
        const listPayload = res.permohonanList;
        if (listPayload) {
          const dataItems = listPayload.data || [];
          setItems(dataItems);
          setPagination({
            currentPage: listPayload.current_page || currentPage,
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
      })
      .catch((err: unknown) => {
        if (!isMounted || controller.signal.aborted) return;
        setHasError(true);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Gagal memuat daftar pengajuan. Silakan coba kembali.'
        );
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
  }, [appliedSearch, selectedStatus, currentPage, refreshTrigger]);

  const handleSearchSubmit = useCallback(
    (e?: FormEvent) => {
      if (e) e.preventDefault();
      setAppliedSearch(searchQuery.trim());
      setCurrentPage(1);
    },
    [searchQuery]
  );

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
    setSelectedStatuses(status === 'semua' ? [] : [status]);
    setCurrentPage(1);
  }, []);

  const handleApplyFilter = useCallback((statuses: string[]) => {
    setSelectedStatuses(statuses);
    if (statuses.length === 0) {
      setSelectedStatus('semua');
    } else {
      setSelectedStatus(statuses.join(','));
    }
    setFilterModalOpen(false);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.lastPage && page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [pagination.lastPage, currentPage]
  );

  const refetch = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

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
    selectedStatuses,
    filterModalOpen,
    setFilterModalOpen,
    handleSearchSubmit,
    handleStatusChange,
    handleApplyFilter,
    handlePageChange,
    refetch,
  };
}

export default useBidang2Pengajuan;

