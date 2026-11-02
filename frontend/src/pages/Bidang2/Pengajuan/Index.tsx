import { useState, useEffect, type FC, type FormEvent } from 'react';
import { LayoutDashboard, ClipboardList, FileText, Search, Download, Eye } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import DashboardShellTemplate from '../../../components/templates/DashboardShellTemplate';
import StatusPill from '../../../components/atoms/StatusPill';
import DetailPermohonanModal from '../../../components/organisms/DetailPermohonanModal';
import { formatRupiah, formatTanggal, labelStatusPermohonan } from '../../../utils/formatPermohonan';

const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/bidang-2/dashboard',
  },
  {
    key: 'pengajuan',
    label: 'List Pengajuan',
    icon: ClipboardList,
    href: '/bidang-2/pengajuan',
  },
  {
    key: 'rkakl',
    label: 'Dokumen RKAKL',
    icon: FileText,
    href: '/bidang-2/rkakl',
  },
];

export const PengajuanIndex: FC = () => {
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('semua');
  const [detailPermohonan, setDetailPermohonan] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPengajuan = async (searchQuery = search, status = selectedStatus) => {
    setIsLoading(true);
    try {
      const res = await api.get<{
        permohonanList?: {
          data?: any[];
        };
        data?: any[];
      }>('/v1/bidang-2/pengajuan', {
        params: { search: searchQuery, status },
      });

      const data = res.data;
      if (data.permohonanList?.data) {
        setItems(data.permohonanList.data);
      } else if (Array.isArray(data.data)) {
        setItems(data.data);
      } else if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch Bidang 2 pengajuan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPengajuan(search, selectedStatus);
  }, [selectedStatus]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchPengajuan(search, selectedStatus);
  };

  const handleFilterStatus = (statusKey: string) => {
    setSelectedStatus(statusKey);
  };

  const sidebarProps = {
    navItems: NAV_ITEMS,
    activeRoute: 'pengajuan',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'Menu',
  };

  const topbarProps = {
    user,
  };

  const statusTabs = [
    { key: 'semua', label: 'Semua Status' },
    { key: 'diajukan', label: 'Diajukan' },
    { key: 'menunggu_bidang2', label: 'Menunggu Persetujuan' },
    { key: 'disetujui', label: 'Disetujui' },
    { key: 'ditolak', label: 'Ditolak' },
  ];

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#14201C] tracking-tight">
            Daftar Pengajuan Permohonan
          </h1>
          <p className="text-sm text-[#5F6F6A] mt-1">
            Daftar pengajuan permohonan pengadaan barang dan jasa dari seluruh unit kampus.
          </p>
        </div>

        <div className="bg-white border border-[#E4EBE8] rounded-[18px] p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter status pengajuan">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleFilterStatus(tab.key)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    selectedStatus === tab.key
                      ? 'bg-[#0E7C5A] text-white'
                      : 'bg-[#F2F6F4] text-[#5F6F6A] hover:bg-[#E4ECE8] hover:text-[#14201C]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-[#8A9A95] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor atau judul..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E4EBE8] bg-[#FAFCFB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] text-[#14201C]"
              />
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-[#E4EBE8] text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider">
                  <th className="py-3 px-4">No Permohonan</th>
                  <th className="py-3 px-4">Judul Pengadaan</th>
                  <th className="py-3 px-4">Unit Asal</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nilai Anggaran</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EBE8]">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-[#5F6F6A]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-[#5F6F6A]">Memuat data pengajuan...</p>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-[#5F6F6A]">
                      Tidak ada pengajuan yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  items.map((row) => {
                    const { label, variant } = labelStatusPermohonan(row.status);
                    const hasDokumen = Boolean(row.dokumen?.[0]);

                    return (
                      <tr key={row.id} className="hover:bg-[#F9FBFA] transition-colors">
                        <td className="py-3.5 px-4 text-xs font-semibold text-[#0E7C5A]">
                          {row.nomor_surat}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-[#14201C] max-w-xs truncate">
                          {row.judul}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#5F6F6A]">
                          {row.unit?.nama || 'Unit Kampus'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#5F6F6A] whitespace-nowrap">
                          {formatTanggal(row.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-[#14201C] whitespace-nowrap">
                          {formatRupiah(row.estimasi_anggaran)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusPill status={variant} label={label} />
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setDetailPermohonan(row)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0E7C5A] bg-[#E8F5F1] hover:bg-[#D4EFE6] rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Permohonan"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>
                          {hasDokumen && (
                            <a
                              href={`/api/v1/bidang-2/permohonan/${row.id}/dokumen`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#5F6F6A] bg-[#F2F6F4] hover:bg-[#E4ECE8] rounded-lg transition-colors"
                              title="Unduh Berkas Surat"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh</span>
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DetailPermohonanModal
        isOpen={Boolean(detailPermohonan)}
        onClose={() => setDetailPermohonan(null)}
        permohonan={detailPermohonan}
      />
    </DashboardShellTemplate>
  );
};

export default PengajuanIndex;
