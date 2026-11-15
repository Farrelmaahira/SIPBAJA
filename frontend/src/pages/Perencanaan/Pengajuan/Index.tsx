import { useState, useEffect, type FC, type FormEvent } from 'react';
import PerencanaanPengajuanIndexTemplate from '../../../components/templates/PerencanaanPengajuanIndexTemplate';
import perencanaanService from '../../../services/perencanaanService';
import type { PermohonanTerbaruItem } from '../../../types/perencanaan';

export const PerencanaanPengajuanIndex: FC = () => {
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedBulan, setSelectedBulan] = useState<string>('');
  const [selectedTahun, setSelectedTahun] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [items, setItems] = useState<PermohonanTerbaruItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchPengajuan = async (
    q = searchQuery,
    statuses = selectedStatuses,
    bulan = selectedBulan,
    tahun = selectedTahun,
    page = currentPage,
    signal?: AbortSignal
  ) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await perencanaanService.getPengajuanList(
        {
          q,
          statuses,
          bulan: bulan || undefined,
          tahun: tahun || undefined,
          page,
        },
        signal
      );

      if (res.permohonan?.data) {
        setItems(res.permohonan.data);
        setTotalCount(res.permohonan.total ?? res.permohonan.data.length);
        setCurrentPage(res.permohonan.current_page ?? page);
        setLastPage(res.permohonan.last_page ?? 1);
      } else if (Array.isArray(res.data)) {
        setItems(res.data);
        setTotalCount(res.data.length);
        setCurrentPage(1);
        setLastPage(1);
      } else {
        setItems([]);
        setTotalCount(0);
      }
    } catch (err: unknown) {
      if (!signal?.aborted) {
        console.error('Failed to fetch Perencanaan pengajuan:', err);
        setErrorMessage('Gagal memuat daftar permohonan.');
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchPengajuan(
      searchQuery,
      selectedStatuses,
      selectedBulan,
      selectedTahun,
      currentPage,
      controller.signal
    );
    return () => controller.abort();
  }, [selectedStatuses, selectedBulan, selectedTahun, currentPage]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    void fetchPengajuan(searchQuery, selectedStatuses, selectedBulan, selectedTahun, 1);
  };

  const handleApplyFilter = (statuses: string[]) => {
    setCurrentPage(1);
    setSelectedStatuses(statuses);
  };

  const handleBulanChange = (bulan: string) => {
    setCurrentPage(1);
    setSelectedBulan(bulan);
  };

  const handleTahunChange = (tahun: string) => {
    setCurrentPage(1);
    setSelectedTahun(tahun);
  };

  return (
    <PerencanaanPengajuanIndexTemplate
      items={items}
      totalCount={totalCount}
      searchQuery={searchQuery}
      selectedStatuses={selectedStatuses}
      selectedBulan={selectedBulan}
      selectedTahun={selectedTahun}
      currentPage={currentPage}
      lastPage={lastPage}
      isLoading={isLoading}
      errorMessage={errorMessage}
      filterModalOpen={filterModalOpen}
      onSearchChange={setSearchQuery}
      onSearchSubmit={handleSearchSubmit}
      onBulanChange={handleBulanChange}
      onTahunChange={handleTahunChange}
      onPageChange={setCurrentPage}
      onOpenFilterModal={() => setFilterModalOpen(true)}
      onCloseFilterModal={() => setFilterModalOpen(false)}
      onApplyFilter={handleApplyFilter}
    />
  );
};

export default PerencanaanPengajuanIndex;
