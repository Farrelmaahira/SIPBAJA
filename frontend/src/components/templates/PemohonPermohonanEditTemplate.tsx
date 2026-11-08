import type { FC, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  ArrowLeft,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import HeroBanner from '../organisms/HeroBanner';
import StatusPill from '../atoms/StatusPill';
import CatatanPenolakanCard from '../molecules/CatatanPenolakanCard';
import PermohonanEditFormCard from '../organisms/PermohonanEditFormCard';
import AlurPermohonanCard from '../organisms/AlurPermohonanCard';
import PanduanPengajuanCard from '../organisms/PanduanPengajuanCard';
import type {
  PermohonanDetailInfo,
  PermohonanRevisiFormData,
  PermohonanRevisiFormErrors,
  PermohonanDokumenDetail,
} from '../../types/permohonan';
import type { ProfilePillUser } from '../molecules/ProfilePill';

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
    badge: 4,
  },
];

export interface PemohonPermohonanEditTemplateProps {
  user?: ProfilePillUser | null;
  permohonan: PermohonanDetailInfo | null;
  formData: PermohonanRevisiFormData;
  formErrors: PermohonanRevisiFormErrors;
  isSubmitting: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  onFieldChange: (field: keyof PermohonanRevisiFormData, value: any) => void;
  onSubmit: (e: FormEvent) => void;
  onBack: () => void;
  onRetry: () => void;
  onViewCurrentDokumen: () => void;
}

export const PemohonPermohonanEditTemplate: FC<
  PemohonPermohonanEditTemplateProps
> = ({
  user = {},
  permohonan,
  formData,
  formErrors,
  isSubmitting,
  isLoading,
  hasError,
  errorMessage,
  onFieldChange,
  onSubmit,
  onBack,
  onRetry,
  onViewCurrentDokumen,
}) => {
  const sidebarProps = {
    navItems: NAV_ITEMS,
    activeRoute: 'permohonan',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'MENU',
  };

  const topbarProps = {
    user,
  };

  const currentDokumen: PermohonanDokumenDetail | null = permohonan?.dokumen
    ? (permohonan.dokumen as unknown as PermohonanDokumenDetail)
    : null;

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      {/* Breadcrumb Navigasi */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs font-bold text-[#8A9A95] tracking-wider uppercase mb-1"
      >
        <Link
          to="/pemohon/permohonan"
          className="hover:text-[#0E7C5A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded px-1"
        >
          LIST PERMOHONAN
        </Link>
        <span aria-hidden="true">&gt;</span>
        <button
          type="button"
          onClick={onBack}
          className="hover:text-[#0E7C5A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded px-1 uppercase cursor-pointer"
        >
          DETAIL PERMOHONAN
        </button>
      </nav>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="h-40 bg-[#EEF5F2] rounded-[24px]" />
          <div className="h-28 bg-white rounded-[24px] border border-[#E4EBE8]" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-white rounded-[24px] border border-[#E4EBE8]" />
            <div className="h-96 bg-white rounded-[24px] border border-[#E4EBE8]" />
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && (hasError || !permohonan) && (
        <div className="bg-white rounded-[24px] border border-[#E4EBE8] shadow-sm p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FDECEC] text-[#B42318] flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#14201C]">
            Gagal Memuat Data Permohonan
          </h2>
          <p className="text-xs md:text-sm text-[#5F6F6A] max-w-md mx-auto">
            {errorMessage ||
              'Permohonan tidak ditemukan atau Anda tidak berwenang mengakses data ini.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-[#0E7C5A] text-white text-xs font-semibold hover:bg-[#0A5C43] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba Lagi</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl border border-[#E4EBE8] bg-white text-xs font-semibold text-[#14201C] hover:bg-[#F3F6F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
            >
              Kembali ke Detail
            </button>
          </div>
        </div>
      )}

      {/* Content State */}
      {!isLoading && permohonan && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <HeroBanner
            eyebrow="EDIT PERMOHONAN"
            title={
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Edit Permohonan Pengadaan
                </span>
                <StatusPill status={permohonan.status || 'ditolak'} />
              </div>
            }
            description={`Nomor ${permohonan.nomor_surat ?? '-'} · Perbaiki data sesuai catatan revisi pemeriksa.`}
            ctaLabel="Kembali"
            ctaIcon={ArrowLeft}
            ctaVariant="translucent"
            onCta={onBack}
          />

          {/* Alert General Error jika ada */}
          {formErrors.general && (
            <div className="p-4 rounded-2xl bg-[#FDECEC] border border-[#FDA29B] text-[#B42318] text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{formErrors.general}</p>
            </div>
          )}

          {/* Card Catatan dari Pemeriksa */}
          {permohonan.catatan_penolakan && (
            <CatatanPenolakanCard catatan={permohonan.catatan_penolakan} />
          )}

          {/* Tata Letak 2 Kolom */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Kolom Kiri: Formulir Edit */}
            <div className="lg:col-span-2">
              <PermohonanEditFormCard
                currentDokumen={currentDokumen}
                onViewDokumen={onViewCurrentDokumen}
                data={formData}
                setData={onFieldChange}
                errors={formErrors}
                processing={isSubmitting}
                onSubmit={onSubmit}
              />
            </div>

            {/* Kolom Kanan: Panduan & Alur */}
            <div className="space-y-6">
              <AlurPermohonanCard mode="revisi" />
              <PanduanPengajuanCard mode="revisi" />
            </div>
          </div>
        </div>
      )}
    </DashboardShellTemplate>
  );
};

export default PemohonPermohonanEditTemplate;

