import { useState, useEffect, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Plus, Search } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import DashboardShellTemplate from '../../../components/templates/DashboardShellTemplate';
import HeroBanner from '../../../components/organisms/HeroBanner';
import PermohonanRow from '../../../components/molecules/PermohonanRow';
import DetailPermohonanModal from '../../../components/organisms/DetailPermohonanModal';

const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/pemohon/dashboard',
  },
  {
    key: 'permohonan',
    label: 'List Permohonan',
    icon: ClipboardList,
    href: '/pemohon/permohonan',
  },
];

const COLS = ['No Permohonan', 'Judul Pengadaan', 'Tanggal', 'Nilai Pengajuan', 'Status', 'Aksi'];

const STATUS_FILTERS = [
  { key: 'semua', label: 'Semua Status' },
  { key: 'diajukan', label: 'Diajukan' },
  { key: 'menunggu_bidang2', label: 'Menunggu Persetujuan' },
  { key: 'disetujui', label: 'Disetujui' },
  { key: 'ditolak', label: 'Ditolak' },
];

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export const PermohonanIndex: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [selectedPermohonan, setSelectedPermohonan] = useState<any>(null);
  const [permohonanList, setPermohonanList] = useState<any[]>([]);
  const [paginationData, setPaginationData] = useState<{
    links?: PaginationLink[];
    from?: number;
    to?: number;
    total?: number;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermohonan = async (
    searchQuery = search,
    status = statusFilter,
    page = currentPage
  ) => {
    setIsLoading(true);
    try {
      const res = await api.get<{
        permohonanList?: {
          data?: any[];
          links?: PaginationLink[];
          from?: number;
          to?: number;
          total?: number;
        };
        data?: any[];
        links?: PaginationLink[];
        from?: number;
        to?: number;
        total?: number;
      }>('/v1/pemohon/permohonan', {
        params: { search: searchQuery, status, page },
      });

      const data = res.data;
      if (data.permohonanList) {
        setPermohonanList(data.permohonanList.data || []);
        setPaginationData({
          links: data.permohonanList.links,
          from: data.permohonanList.from,
          to: data.permohonanList.to,
          total: data.permohonanList.total,
        });
      } else if (data.data) {
        setPermohonanList(data.data);
        setPaginationData({
          links: data.links,
          from: data.from,
          to: data.to,
          total: data.total,
        });
      }
    } catch (err) {
      console.error('Failed to fetch permohonan list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermohonan(search, statusFilter, 1);
    setCurrentPage(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchPermohonan(search, statusFilter, 1);
    setCurrentPage(1);
  };

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
  };

  const sidebarProps = {
    navItems: NAV_ITEMS,
    activeRoute: 'permohonan',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'Menu',
  };

  const topbarProps = {
    user,
  };

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      <HeroBanner
        eyebrow="DAFTAR PERMOHONAN"
        title="Riwayat Permohonan Pengadaan"
        description="Pantau seluruh status dan dokumen permohonan pengadaan barang & jasa unit Anda."
        ctaLabel="Buat Permohonan"
        ctaIcon={Plus}
        onCta={() => navigate('/pemohon/permohonan/create')}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E4EBE8] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => handleFilterChange(f.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === f.key
                  ? 'bg-[#0E7C5A] text-white shadow-xs'
                  : 'bg-[#F2F4F7] text-[#667085] hover:bg-[#E4EBE8] hover:text-[#1D2939]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor atau judul..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] focus:border-[#0E7C5A]"
          />
          <Search className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-[#E4EBE8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-[#E4EBE8] bg-[#F8FAFA]">
                {COLS.map((col) => (
                  <th
                    key={col}
                    className="py-3 px-4 text-left text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider whitespace-nowrap"
                    scope="col"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={COLS.length} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-[#5F6F6A]">Memuat daftar permohonan...</p>
                    </div>
                  </td>
                </tr>
              ) : permohonanList.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} className="py-12 px-4 text-center">
                    <p className="text-sm font-semibold text-[#14201C]">
                      Tidak ada permohonan yang sesuai filter.
                    </p>
                    <p className="text-xs text-[#667085] mt-1">
                      Coba ubah kata kunci pencarian atau status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                permohonanList.map((row) => (
                  <PermohonanRow
                    key={row.id}
                    permohonan={row}
                    nomorSurat={row.nomor_surat}
                    judul={row.judul}
                    tanggal={row.created_at}
                    nilaiPengajuan={row.estimasi_anggaran}
                    status={row.status}
                    onDetail={(item) => setSelectedPermohonan(item)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Links */}
        {paginationData.links && paginationData.links.length > 3 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#E4EBE8] bg-[#F8FAFA]">
            <span className="text-xs text-[#667085]">
              Menampilkan {paginationData.from || 0} - {paginationData.to || 0} dari{' '}
              {paginationData.total || 0} permohonan
            </span>
            <div className="flex items-center gap-1">
              {paginationData.links.map((link, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={!link.url}
                  onClick={() => {
                    if (link.url) {
                      const urlParams = new URL(link.url, window.location.origin).searchParams;
                      const pageParam = parseInt(urlParams.get('page') || '1', 10);
                      setCurrentPage(pageParam);
                      fetchPermohonan(search, statusFilter, pageParam);
                    }
                  }}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                    link.active
                      ? 'bg-[#0E7C5A] text-white'
                      : link.url
                      ? 'bg-white text-[#344054] hover:bg-[#F2F4F7] border border-[#E4EBE8]'
                      : 'text-[#98A2B3] cursor-not-allowed opacity-50'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailPermohonanModal
        isOpen={Boolean(selectedPermohonan)}
        onClose={() => setSelectedPermohonan(null)}
        permohonan={selectedPermohonan}
      />
    </DashboardShellTemplate>
  );
};

export default PermohonanIndex;
