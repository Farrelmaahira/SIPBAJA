import type { FC } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  FileText,
  Calendar,
  Building,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import DashboardShellTemplate from '../../../components/templates/DashboardShellTemplate';
import HeroBanner from '../../../components/organisms/HeroBanner';
import StatusPill from '../../../components/atoms/StatusPill';
import { formatRupiah } from '../../../utils/formatters';

const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/bidang-2/dashboard',
  },
  {
    key: 'pengajuan',
    label: 'List Permohonan',
    icon: ClipboardList,
    href: '/bidang-2/pengajuan',
    badge: 4,
  },
  {
    key: 'pengadaan',
    label: 'List Pengadaan',
    icon: ShoppingCart,
    href: '/bidang-2/pengadaan',
  },
  {
    key: 'rkakl',
    label: 'Dokumen RKAKL',
    icon: FileText,
    href: '/bidang-2/rkakl',
  },
];

export const Bidang2PengadaanShow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const sidebarProps = {
    navItems: NAV_ITEMS,
    activeRoute: 'pengadaan',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'Menu',
  };

  const topbarProps = {
    user,
  };

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() => navigate('/bidang-2/pengadaan')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0E7C5A] hover:underline cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Pengadaan</span>
          </button>
          <HeroBanner
            eyebrow={`DETAIL PENGADAAN #${id || '1'}`}
            title={`Paket Pengadaan #${id || '1'}`}
            description="Informasi rincian paket pengadaan barang dan jasa."
          />
        </div>

        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F0F4F2]">
            <div>
              <p className="text-xs text-[#8A9A95]">Nomor Pengadaan</p>
              <h2 className="text-base font-bold text-[#14201C] mt-0.5">
                PGD-{String(id || '1').padStart(5, '0')}
              </h2>
            </div>
            <StatusPill status="review_pengajuan" label="Review Pengajuan" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F4F7F5] border border-[#E4EBE8]">
              <div className="flex items-center gap-2 text-[#5F6F6A] text-xs mb-1">
                <Building className="w-4 h-4 text-[#0E7C5A]" />
                <span>Unit Pengusul</span>
              </div>
              <p className="text-sm font-bold text-[#14201C]">Jurusan Unit Kampus</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F7F5] border border-[#E4EBE8]">
              <div className="flex items-center gap-2 text-[#5F6F6A] text-xs mb-1">
                <DollarSign className="w-4 h-4 text-[#0E7C5A]" />
                <span>Nilai Pengadaan</span>
              </div>
              <p className="text-sm font-bold text-[#14201C]">{formatRupiah(185000000)}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F7F5] border border-[#E4EBE8]">
              <div className="flex items-center gap-2 text-[#5F6F6A] text-xs mb-1">
                <Calendar className="w-4 h-4 text-[#0E7C5A]" />
                <span>Status Proses</span>
              </div>
              <p className="text-sm font-bold text-[#14201C]">Tahap Review PPBJ / PPK</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0F4F2] flex items-center justify-between">
            <Link
              to="/bidang-2/pengadaan"
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5] transition-colors"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>
    </DashboardShellTemplate>
  );
};

export default Bidang2PengadaanShow;
