import { useState, useEffect, useMemo, type FC, type FormEvent } from 'react';
import keuanganService from '../../../services/keuanganService';
import KeuanganPengadaanTemplate from '../../../components/templates/Keuangan/KeuanganPengadaanTemplate';
import type { KeuanganPengadaanItem } from '../../../types/keuangan';

export const KeuanganPengadaanIndex: FC = () => {
  const [items, setItems] = useState<KeuanganPengadaanItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPengadaan = async (
    page: number,
    search: string,
    statuses: string[],
    signal?: AbortSignal
  ) => {
    setIsLoading(true);
    try {
      const response = await keuanganService.getPengadaanList(
        {
          page,
          per_page: 10,
          search,
          status: statuses,
        },
        signal
      );

      setItems(response.data || []);
      setTotal(response.total || 0);
      setCurrentPage(response.current_page || 1);
      setLastPage(response.last_page || 1);
      setFrom(response.from || 0);
      setTo(response.to || 0);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      console.error('Failed to fetch Keuangan pengadaan list:', err);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchPengadaan(currentPage, activeSearch, selectedStatuses, controller.signal);
    return () => controller.abort();
  }, [currentPage, activeSearch, selectedStatuses]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearch(searchInput.trim());
  };

  const handleApplyFilter = (statuses: string[]) => {
    setCurrentPage(1);
    setSelectedStatuses(statuses);
  };

  const pageNumbers = useMemo(() => {
    if (lastPage <= 7) {
      return Array.from({ length: lastPage }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', lastPage];
    }

    if (currentPage >= lastPage - 3) {
      return [1, '...', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage];
  }, [currentPage, lastPage]);

  return (
    <KeuanganPengadaanTemplate
      items={items}
      isLoading={isLoading}
      total={total}
      currentPage={currentPage}
      lastPage={lastPage}
      from={from}
      to={to}
      pageNumbers={pageNumbers}
      onPageChange={(p) => setCurrentPage(p)}
      searchInput={searchInput}
      onSearchInputChange={setSearchInput}
      onSearchSubmit={handleSearchSubmit}
      selectedStatuses={selectedStatuses}
      filterModalOpen={filterModalOpen}
      onOpenFilterModal={() => setFilterModalOpen(true)}
      onCloseFilterModal={() => setFilterModalOpen(false)}
      onApplyFilter={handleApplyFilter}
    />
  );
};

export default KeuanganPengadaanIndex;
