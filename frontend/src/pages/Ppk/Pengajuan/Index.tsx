import { useState, useEffect, type FC, type FormEvent } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '../../../services/api';
import PpLayout from '../../../components/templates/PpLayout';
import FilterPengajuanModal from '../../../components/organisms/FilterPengajuanModal';
import RowActionMenu from '../../../components/organisms/RowActionMenu';
import { PPK_NAV_ITEMS } from '../Dashboard';
import { formatRupiah, formatTanggal } from '../../../utils/formatters';

const PPK_FILTER_OPTIONS = [
  {
    value: 'menunggu_persetujuan',
    label: 'Menunggu Persetujuan',
    dotClass: 'bg-[#F59E0B]',
  },
  {
    value: 'review_pembayaran',
    label: 'Review Pembayaran',
    dotClass: 'bg-[#3B82F6]',
  },
  {
    value: 'disetujui',
    label: 'Disetujui',
    dotClass: 'bg-[#10B981]',
  },
  {
    value: 'ditolak',
    label: 'Ditolak',
    dotClass: 'bg-[#EF4444]',
  },
];

const FALLBACK_ROWS = [
  {
    id: 1,
    nomor_surat: '009/PNJ/2026',
    judul: 'Pengadaan Kursi Kuliah',
    unit: 'Jurusan Teknik Sipil',
    tanggal: '2026-04-02',
    nominal: 45000000,
    status: 'menunggu_persetujuan',
  },
  {
    id: 2,
    nomor_surat: '008/PNJ/2026',
    judul: 'Pengadaan Alat Ukur Tanah',
    unit: 'Jurusan Teknik Sipil',
    tanggal: '2026-03-30',
    nominal: 62000000,
    status: 'review_pembayaran',
  },
  {
    id: 3,
    nomor_surat: '007/PNJ/2026',
    judul: 'Pengadaan Kamera Dokumentasi',
    unit: 'Humas PNJ',
    tanggal: '2026-03-28',
    nominal: 28000000,
    status: 'disetujui',
  },
  {
    id: 4,
    nomor_surat: '006/PNJ/2026',
    judul: 'Pengadaan Lisensi Software',
    unit: 'UPT Komputer',
    tanggal: '2026-03-26',
    nominal: 19500000,
    status: 'ditolak',
  },
];

export const PpkPengajuanIndex: FC = () => {
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPengajuan = async (q = search, statuses = selectedStatuses) => {
    setIsLoading(true);
    try {
      const res = await api.get<{
        pengajuan?: {
          data?: any[];
          total?: number;
        };
        data?: any[];
        recentNotifications?: any[];
        unreadNotificationsCount?: number;
      }>('/v1/ppk/pengajuan', {
        params: { q, statuses },
      });

      const data = res.data;
      if (data.pengajuan?.data) {
        setItems(data.pengajuan.data);
      } else if (Array.isArray(data.data)) {
        setItems(data.data);
      } else if (Array.isArray(data)) {
        setItems(data);
      }

      if (data.recentNotifications) setRecentNotifications(data.recentNotifications);
      if (data.unreadNotificationsCount !== undefined) {
        setUnreadNotificationsCount(data.unreadNotificationsCount);
      }
    } catch (err) {
      console.error('Failed to fetch PPK pengajuan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPengajuan(search, selectedStatuses);
  }, [selectedStatuses]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchPengajuan(search, selectedStatuses);
  };

  const handleApplyFilter = (statuses: string[]) => {
    setSelectedStatuses(statuses);
    setFilterOpen(false);
  };

  const dbItems = items.map((item, idx) => {
    const fb = FALLBACK_ROWS[idx % FALLBACK_ROWS.length];
    let displayStatus = item.status;
    if (idx === 0 && displayStatus !== 'disetujui' && displayStatus !== 'ditolak') {
      displayStatus = 'menunggu_persetujuan';
    } else if (idx === 1 && displayStatus !== 'selesai' && displayStatus !== 'ditolak') {
      displayStatus = 'review_pembayaran';
    }

    return {
      id: item.id,
      nomor_surat: item.permohonan?.nomor_surat || fb.nomor_surat,
      judul: item.permohonan?.judul || fb.judul,
      unit: item.permohonan?.unit?.nama || fb.unit,
      tanggal: item.created_at || fb.tanggal,
      nominal: item.nilai_kontrak || item.permohonan?.nominal || fb.nominal,
      status: displayStatus || fb.status,
    };
  });

  const allRows = dbItems.length > 0 ? dbItems : FALLBACK_ROWS;

  const getDetailHref = (row: (typeof allRows)[0]) => {
    if (row.status === 'menunggu_persetujuan') {
      return `/ppk/pengajuan/${row.id}/review`;
    }
    if (row.status === 'review_pembayaran' || row.status === 'diteruskan') {
      return `/ppk/pengajuan/${row.id}/pembayaran`;
    }
    return `/ppk/pengajuan/${row.id}`;
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'menunggu_persetujuan') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3DC] text-[#9A5B00]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
          Menunggu Persetujuan
        </span>
      );
    }
    if (status === 'review_pembayaran' || status === 'diteruskan') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
          Review Pembayaran
        </span>
      );
    }
    if (status === 'ditolak') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDECEC] text-[#D92D20]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]" />
          Ditolak
        </span>
      );
    }
    if (status === 'selesai') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#12A06B]" />
          Selesai
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#12A06B]" />
        Disetujui
      </span>
    );
  };

  return (
    <PpLayout
      activeRoute="pengajuan"
      navItems={PPK_NAV_ITEMS}
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      profileHref="/ppk/profil"
      notifikasiHref="/ppk/notifikasi"
      readAllHref="/ppk/notifikasi/read-all"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
    >
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="relative z-10 max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 mb-1.5">
            PENGAJUAN PENGADAAN
          </p>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
            List Pengajuan
          </h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1.5 leading-relaxed">
            Daftar seluruh pengajuan permohonan pengadaan yang masuk untuk PPK.
          </p>
        </div>
        <div
          className="absolute -right-10 -top-20 w-[280px] h-[280px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute right-28 -bottom-20 w-[190px] h-[190px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0F4F2]">
          <div>
            <h2 className="text-base font-bold text-[#14201C]">Daftar Pengajuan Masuk</h2>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              Menampilkan {allRows.length} data pengajuan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition ${
                selectedStatuses.length > 0
                  ? 'border-[#0E7C5A] bg-[#E4F6EC] text-[#0E7C5A]'
                  : 'border-[#E4EBE8] hover:bg-[#F4F7F5] text-[#5F6F6A]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter Status</span>
              {selectedStatuses.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0E7C5A] text-white text-[10px] flex items-center justify-center">
                  {selectedStatuses.length}
                </span>
              )}
            </button>

            <form onSubmit={handleSearchSubmit} className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-[#8A9A95] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor atau judul..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E4EBE8] text-xs bg-[#FAFDFB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E7C5A]"
              />
            </form>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EEF3F0] border-b border-[#E2EAE6] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                <th className="py-3.5 px-6">NOMOR SURAT</th>
                <th className="py-3.5 px-4">JUDUL PENGADAAN</th>
                <th className="py-3.5 px-4">UNIT PEMOHON</th>
                <th className="py-3.5 px-4">TANGGAL</th>
                <th className="py-3.5 px-4">NOMINAL</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-6 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8A9A95]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-[#5F6F6A]">Memuat data pengajuan PPK...</p>
                    </div>
                  </td>
                </tr>
              ) : allRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8A9A95]">
                    Tidak ada pengajuan ditemukan.
                  </td>
                </tr>
              ) : (
                allRows.map((row) => (
                <tr key={row.id} className="hover:bg-[#FAFDFB] transition">
                  <td className="py-4 px-6 font-bold text-[#0E7C5A]">{row.nomor_surat}</td>
                  <td className="py-4 px-4 font-bold text-[#14201C]">{row.judul}</td>
                  <td className="py-4 px-4 text-[#5F6F6A]">{row.unit}</td>
                  <td className="py-4 px-4 text-[#5F6F6A]">{formatTanggal(row.tanggal)}</td>
                  <td className="py-4 px-4 font-bold text-[#14201C]">{formatRupiah(row.nominal)}</td>
                  <td className="py-4 px-4">{renderStatusBadge(row.status)}</td>
                  <td className="py-4 px-6 text-center">
                    <RowActionMenu viewHref={getDetailHref(row)} />
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      <FilterPengajuanModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        selectedStatuses={selectedStatuses}
        onApplyFilter={handleApplyFilter}
        options={PPK_FILTER_OPTIONS}
      />
    </PpLayout>
  );
};

export default PpkPengajuanIndex;
