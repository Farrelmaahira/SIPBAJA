import type { FC } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  AlertCircle,
  RotateCcw,
  ShoppingCart,
} from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import HeroBanner from '../organisms/HeroBanner';
import Bidang2RkaklPreviewCard from '../organisms/Bidang2/Bidang2RkaklPreviewCard';
import Bidang2RkaklInfoCard from '../organisms/Bidang2/Bidang2RkaklInfoCard';
import type { ProfilePillUser } from '../molecules/ProfilePill';
import type { Bidang2RkaklActiveDoc } from '../../types/bidang2';

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

const DEFAULT_DOC: Bidang2RkaklActiveDoc = {
  id: 1,
  nama_asli: 'RKAKL_TA_2026_Satker_Politeknik_v3.pdf',
  ukuran_bytes: 12582912,
  versi: 3,
  tahun_anggaran: 2026,
  nomor_dokumen: 'RKAKL-2026-003',
  perihal: 'Rencana Kerja dan Anggaran',
  tanggal: '12 Oktober 2026',
  diperbarui_oleh: 'Unit Perencanaan',
  status: 'Aktif',
  total_halaman: 24,
  download_url: '/api/v1/bidang-2/rkakl/dokumen?disposition=attachment',
  view_url: '/api/v1/bidang-2/rkakl/dokumen?disposition=inline',
};

export interface Bidang2RkaklTemplateProps {
  user?: ProfilePillUser | null;
  document?: Bidang2RkaklActiveDoc | null;
  isLoading?: boolean;
  hasError?: boolean;
  previewBlobUrl?: string | null;
  isLoadingPreview?: boolean;
  onView?: () => void;
  onDownload?: () => void;
  onRetry?: () => void;
}

export const Bidang2RkaklTemplate: FC<Bidang2RkaklTemplateProps> = ({
  user,
  document,
  isLoading = false,
  hasError = false,
  previewBlobUrl,
  isLoadingPreview = false,
  onView,
  onDownload,
  onRetry,
}) => {
  const sidebarProps = {
    navItems: NAV_ITEMS,
    activeRoute: 'rkakl',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'Menu',
  };

  const topbarProps = {
    user,
  };

  const activeDoc = document || DEFAULT_DOC;

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      <div className="space-y-6">
        {/* Hero Banner sesuai mockup bidang2_dokumen_rkakl.png */}
        <HeroBanner
          eyebrow="DOKUMEN ACUAN"
          title="Dokumen RKAKL"
          description="Lihat dokumen RKAKL terbaru sebagai acuan review permohonan dan pengajuan."
        />

        {/* State Loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 bg-white rounded-[22px] p-8 border border-[#E4EBE8] animate-pulse min-h-[500px]">
              <div className="h-5 w-48 bg-[#EEF5F2] rounded mb-2" />
              <div className="h-3 w-64 bg-[#EEF5F2] rounded mb-6" />
              <div className="h-16 w-full bg-[#EEF5F2] rounded-xl mb-6" />
              <div className="h-80 w-full bg-[#EEF5F2] rounded-2xl" />
            </div>
            <div className="lg:col-span-1 bg-white rounded-[22px] p-8 border border-[#E4EBE8] animate-pulse space-y-4">
              <div className="h-5 w-36 bg-[#EEF5F2] rounded mb-2" />
              <div className="h-3 w-48 bg-[#EEF5F2] rounded mb-6" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF5F2]" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2.5 w-20 bg-[#EEF5F2] rounded" />
                    <div className="h-3.5 w-32 bg-[#EEF5F2] rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : hasError ? (
          /* State Error */
          <div className="bg-white border border-[#E4EBE8] rounded-[22px] p-10 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FDECEC] text-[#B42318] flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-base font-bold text-[#14201C]">
              Gagal Memuat Dokumen RKAKL
            </h2>
            <p className="text-xs text-[#5F6F6A]">
              Terjadi gangguan saat mengambil data dokumen RKAKL dari server.
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E7C5A] text-white text-xs font-semibold hover:bg-[#0B6549] transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
            )}
          </div>
        ) : (
          /* Grid 2 Kolom Konten RKAKL */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <Bidang2RkaklPreviewCard
                document={activeDoc}
                previewBlobUrl={previewBlobUrl}
                isLoadingPreview={isLoadingPreview}
                onView={onView}
                onDownload={onDownload}
              />
            </div>
            <div className="lg:col-span-1">
              <Bidang2RkaklInfoCard document={activeDoc} />
            </div>
          </div>
        )}
      </div>
    </DashboardShellTemplate>
  );
};

export default Bidang2RkaklTemplate;
