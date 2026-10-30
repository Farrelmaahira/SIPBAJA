import { useState, useEffect, type FC, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import api from '../../../services/api';
import PpLayout from '../../../components/templates/PpLayout';
import FilterPengajuanModal from '../../../components/organisms/FilterPengajuanModal';
import RowActionMenu from '../../../components/organisms/RowActionMenu';

export interface PpPengajuanItem {
  id: number;
  nominal?: number;
  created_at?: string;
  status?: string;
  permohonan?: {
    nomor_surat?: string;
    judul?: string;
    unit?: { nama?: string };
  };
  [key: string]: unknown;
}

export const PpPengajuanIndex: FC = () => {
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [items, setItems] = useState<PpPengajuanItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [, setIsLoading] = useState(true);

  const fetchPengajuan = async (q = searchQuery, statuses = selectedStatuses) => {
    setIsLoading(true);
    try {
      const res = await api.get<{
        pengajuan?: {
          data?: PpPengajuanItem[];
          total?: number;
        };
        data?: PpPengajuanItem[];
        recentNotifications?: any[];
        unreadNotificationsCount?: number;
      }>('/v1/pp/pengajuan', {
        params: { q, statuses },
      });

      const data = res.data;
      if (data.pengajuan?.data) {
        setItems(data.pengajuan.data);
        setTotalCount(data.pengajuan.total || data.pengajuan.data.length);
      } else if (Array.isArray(data.data)) {
        setItems(data.data);
        setTotalCount(data.data.length);
      }

      if (data.recentNotifications) setRecentNotifications(data.recentNotifications);
      if (data.unreadNotificationsCount !== undefined) {
        setUnreadNotificationsCount(data.unreadNotificationsCount);
      }
    } catch (err) {
      console.error('Failed to fetch PP pengajuan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPengajuan(searchQuery, selectedStatuses);
  }, [selectedStatuses]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchPengajuan(searchQuery, selectedStatuses);
  };

  const handleApplyFilter = (statuses: string[]) => {
    setSelectedStatuses(statuses);
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'menunggu_persetujuan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F0FF] text-[#2F68D6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F68D6]" />
            Menunggu Persetujuan
          </span>
        );
      case 'diteruskan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3DC] text-[#9A5B00]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9A5B00]" />
            Diteruskan
          </span>
        );
      case 'disetujui':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#12A06B]" />
            Disetujui
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#12A06B]" />
            Selesai
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDECEC] text-[#D92D20]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4F7F5] text-[#5F6F6A]">
            {status || '-'}
          </span>
        );
    }
  };

  return (
    <PpLayout
      activeRoute="pengajuan"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
    >
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="relative z-10 max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 mb-1.5">
            DAFTAR PENGAJUAN
          </p>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
            List Pengajuan
          </h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1.5 leading-relaxed">
            Pantau dan kelola pengajuan pengadaan yang perlu disetujui dan diteruskan oleh PP.
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
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#14201C]">Daftar Pengajuan</h3>
          <p className="text-xs text-[#8A9A95] mt-0.5">
            Pengajuan pengadaan yang ditangani PP ({totalCount} data)
          </p>
        </div>

        {/* Filter & Search Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setFilterModalOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                selectedStatuses.length > 0
                  ? 'bg-[#E8F5EF] text-[#0E7C5A] border-[#0E7C5A]'
                  : 'bg-white text-[#14201C] border-[#E4EBE8] hover:bg-[#F4F7F5]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
              {selectedStatuses.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0E7C5A] text-white text-[10px] flex items-center justify-center">
                  {selectedStatuses.length}
                </span>
              )}
            </button>

            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-[#8A9A95] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor atau judul..."
                className="w-64 sm:w-72 pl-10 pr-4 py-2.5 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:ring-2 focus:ring-[#0E7C5A] focus:border-transparent outline-none bg-white placeholder-[#8A9A95]"
              />
            </form>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EEF3F0] text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider">
                <th className="py-3.5 px-4 rounded-l-xl">No Permohonan</th>
                <th className="py-3.5 px-4">Judul Pengadaan</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Nilai Pengadaan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2] text-xs">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8A9A95]">
                    Tidak ada pengajuan ditemukan.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F9FBFA] transition-colors">
                    <td className="py-4 px-4 font-bold text-[#0E7C5A]">
                      <Link
                        to={
                          item.status === 'menunggu_persetujuan'
                            ? `/pp/pengajuan/${item.id}/review`
                            : `/pp/pengajuan/${item.id}`
                        }
                        className="hover:underline"
                      >
                        {item.permohonan?.nomor_surat || '-'}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-[#14201C]">
                        {item.permohonan?.judul || '-'}
                      </p>
                      <p className="text-[11px] text-[#8A9A95] mt-0.5">
                        {item.permohonan?.unit?.nama || '-'}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-[#5F6F6A]">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#14201C]">
                      {formatCurrency(item.nominal)}
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-4 px-4 text-center">
                      <RowActionMenu item={item} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FilterPengajuanModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        selectedStatuses={selectedStatuses}
        onApplyFilter={handleApplyFilter}
      />
    </PpLayout>
  );
};

export default PpPengajuanIndex;
