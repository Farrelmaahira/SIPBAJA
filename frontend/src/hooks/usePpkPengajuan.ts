import { useState, useEffect, useCallback, type FormEvent } from 'react';
import ppkService from '../services/ppkService';
import type { NotificationItem } from '../types/notification';
import type {
  PpPaginationMeta,
  PpkPermohonanItem,
  PpkRkaklDoc,
  PpkTableRow,
} from '../types/ppk';

export interface UsePpkPengajuanResult {
  rows: PpkTableRow[];
  meta: PpPaginationMeta;
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
  activeRkakl: PpkRkaklDoc | null;
  isLoading: boolean;
  error: string | null;
  recentNotifications: NotificationItem[];
  unreadNotificationsCount: number;
  refetch: () => void;
}

export function usePpkPengajuan(): UsePpkPengajuanResult {
  const [search, setSearch] = useState<string>('');
  const [submittedSearch, setSubmittedSearch] = useState<string>('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [bulan, setBulan] = useState<string>('');
  const [tahun, setTahun] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const [permohonanItems, setPermohonanItems] = useState<PpkPermohonanItem[]>([]);
  const [meta, setMeta] = useState<PpPaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const [activeRkakl, setActiveRkakl] = useState<PpkRkaklDoc | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
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

  // Fetch RKAKL info
  useEffect(() => {
    const controller = new AbortController();
    ppkService
      .getRkakl(undefined, controller.signal)
      .then((res) => {
        setActiveRkakl(res.activeDoc ?? res.data?.active_doc ?? null);
      })
      .catch(() => {
        // RKAKL failure is non-fatal for pengajuan listing
      });

    return () => {
      controller.abort();
    };
  }, []);

  // Fetch Permohonan list (Dokumen Turunan MAK)
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const filterPayload = {
      q: submittedSearch || undefined,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      bulan: bulan || undefined,
      tahun: tahun || undefined,
      page,
    };

    ppkService
      .getPermohonanList(filterPayload, controller.signal)
      .then((res) => {
        const list = res.data ?? res.permohonan?.data ?? [];
        setPermohonanItems(list);
        setMeta({
          current_page: res.meta?.current_page ?? res.permohonan?.current_page ?? 1,
          last_page: res.meta?.last_page ?? res.permohonan?.last_page ?? 1,
          per_page: res.meta?.per_page ?? res.permohonan?.per_page ?? 10,
          total: res.meta?.total ?? res.permohonan?.total ?? list.length,
        });
        if (res.recentNotifications) setRecentNotifications(res.recentNotifications);
        if (res.unreadNotificationsCount !== undefined) {
          setUnreadNotificationsCount(res.unreadNotificationsCount);
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch PPK permohonan list:', err);
          setError('Gagal memuat daftar permohonan PPK.');
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
  }, [submittedSearch, selectedStatuses, bulan, tahun, page, reloadToken]);

  // Clean data mapping without fake/dummy fallback
  const rows: PpkTableRow[] = permohonanItems.map((item) => {
    const unitObj = item.unit || item.Unit;
    const nominalVal =
      typeof item.estimasi_anggaran === 'number'
        ? item.estimasi_anggaran
        : typeof item.nominal === 'number'
          ? item.nominal
          : typeof item.estimasi_anggaran === 'string'
            ? Number(item.estimasi_anggaran) || 0
            : 0;

    return {
      id: item.id,
      nomor_surat: item.nomor_surat || '-',
      judul: item.judul || '-',
      unit: unitObj?.nama || '-',
      tanggal: item.created_at || '-',
      nominal: nominalVal,
      status: item.status || 'menunggu_persetujuan',
      sourceType: 'permohonan',
    };
  });

  return {
    rows,
    meta,
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
    activeRkakl,
    isLoading,
    error,
    recentNotifications,
    unreadNotificationsCount,
    refetch,
  };
}

export default usePpkPengajuan;
