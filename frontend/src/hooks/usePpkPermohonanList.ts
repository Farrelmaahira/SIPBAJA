import { useCallback, useEffect, useState, type FormEvent } from 'react';
import ppkService from '../services/ppkService';
import { mapPpkPermohonanRows } from '../utils/ppkPermohonan';
import type { PpPaginationMeta, PpkTableRow } from '../types/ppk';

const PER_PAGE = 10;

export interface UsePpkPermohonanListResult {
  data: PpkTableRow[];
  meta: PpPaginationMeta;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  search: string;
  setSearch: (search: string) => void;
  handleSearchSubmit: (e: FormEvent) => void;
  selectedStatuses: string[];
  bulan: string;
  tahun: string;
  setBulan: (bulan: string) => void;
  setTahun: (tahun: string) => void;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  handleApplyFilter: (statuses: string[]) => void;
  page: number;
  setPage: (page: number) => void;
}

export function usePpkPermohonanList(): UsePpkPermohonanListResult {
  const [search, setSearch] = useState<string>('');
  const [submittedSearch, setSubmittedSearch] = useState<string>('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [bulan, setBulan] = useState<string>('');
  const [tahun, setTahun] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const [data, setData] = useState<PpkTableRow[]>([]);
  const [meta, setMeta] = useState<PpPaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: PER_PAGE,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);

  const refetch = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

  const handleSearchSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setPage(1);
      setSubmittedSearch(search);
    },
    [search]
  );

  const handleApplyFilter = useCallback((statuses: string[]) => {
    setSelectedStatuses(statuses);
    setPage(1);
    setFilterOpen(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    ppkService
      .getPermohonanList(
        {
          q: submittedSearch || undefined,
          statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
          bulan: bulan || undefined,
          tahun: tahun || undefined,
          page,
          per_page: PER_PAGE,
        },
        controller.signal
      )
      .then((res) => {
        const items = res.data ?? [];
        setData(mapPpkPermohonanRows(items));
        setMeta({
          current_page: res.meta?.current_page ?? 1,
          last_page: res.meta?.last_page ?? 1,
          per_page: res.meta?.per_page ?? PER_PAGE,
          total: res.meta?.total ?? items.length,
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        console.error('Gagal memuat daftar permohonan PPK:', err);
        setError('Gagal memuat daftar permohonan PPK.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [submittedSearch, selectedStatuses, bulan, tahun, page, reloadToken]);

  return {
    data,
    meta,
    isLoading,
    error,
    refetch,
    search,
    setSearch,
    handleSearchSubmit,
    selectedStatuses,
    bulan,
    tahun,
    setBulan,
    setTahun,
    filterOpen,
    setFilterOpen,
    handleApplyFilter,
    page,
    setPage,
  };
}

export default usePpkPermohonanList;
