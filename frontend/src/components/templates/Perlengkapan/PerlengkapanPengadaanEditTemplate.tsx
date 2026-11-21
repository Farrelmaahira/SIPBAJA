import { useRef, useState, type FC, type ChangeEvent, type DragEvent } from 'react';
import {
  ArrowLeft,
  Calendar,
  Hash,
  Banknote,
  Activity,
  Check,
  FileText,
  ShoppingCart,
  Package,
  Clock,
  Building2,
  Eye,
  Download,
  FileCode,
  X,
  Plus,
  UploadCloud,
  Info,
  Loader2,
  Save,
  AlertCircle,
} from 'lucide-react';
import AppLayout, { type AppTopbarUser } from '../General/AppLayout';
import StatusPill from '../../atoms/StatusPill';
import DocumentPreviewModal from '../../organisms/DocumentPreviewModal';
import { PERLENGKAPAN_NAV_ITEMS } from '../../../constants/perlengkapanNav';
import { formatRupiah } from '../../../utils/formatters';
import type {
  PerlengkapanPengadaanDetail,
  PerlengkapanDokumenItem,
} from '../../../types/perlengkapan';

export interface PerlengkapanPengadaanEditTemplateProps {
  user?: AppTopbarUser | null;
  detail: PerlengkapanPengadaanDetail | null;
  isLoading?: boolean;
  isSubmitting?: boolean;
  existingDokumenBarang: PerlengkapanDokumenItem[];
  onRemoveExistingDokumenBarang: (id: number | string) => void;
  existingDokumentasiFoto: PerlengkapanDokumenItem[];
  onRemoveExistingDokumentasiFoto: (id: number | string) => void;
  newDokumenBarangFiles: File[];
  onAddNewDokumenBarang: (files: File[]) => void;
  onRemoveNewDokumenBarang: (index: number) => void;
  newDokumentasiFotoFiles: File[];
  onAddNewDokumentasiFoto: (files: File[]) => void;
  onRemoveNewDokumentasiFoto: (index: number) => void;
  onSubmitUpdate: () => void;
  onBack: () => void;
  onViewDokumen?: (doc: PerlengkapanDokumenItem) => void;
  onDownloadDokumen?: (doc: PerlengkapanDokumenItem) => void;
  onViewDokumentasi?: (foto: PerlengkapanDokumenItem) => void;
  onDownloadDokumentasi?: (foto: PerlengkapanDokumenItem) => void;
  onViewNewDokumen?: (file: File) => void;
  onDownloadNewDokumen?: (file: File) => void;
  onViewNewFoto?: (file: File) => void;
  onDownloadNewFoto?: (file: File) => void;
  previewBlobUrl?: string | null;
  previewDocName?: string | null;
  previewDocSize?: string | null;
  onDownloadPreview?: () => void;
  onClosePreview?: () => void;
}

export const PerlengkapanPengadaanEditTemplate: FC<PerlengkapanPengadaanEditTemplateProps> = ({
  user,
  detail,
  isLoading = false,
  isSubmitting = false,
  existingDokumenBarang,
  onRemoveExistingDokumenBarang,
  existingDokumentasiFoto,
  onRemoveExistingDokumentasiFoto,
  newDokumenBarangFiles,
  onAddNewDokumenBarang,
  onRemoveNewDokumenBarang,
  newDokumentasiFotoFiles,
  onAddNewDokumentasiFoto,
  onRemoveNewDokumentasiFoto,
  onSubmitUpdate,
  onBack,
  onViewDokumen,
  onDownloadDokumen,
  onViewDokumentasi,
  onDownloadDokumentasi,
  onViewNewDokumen,
  onDownloadNewDokumen,
  onViewNewFoto,
  onDownloadNewFoto,
  previewBlobUrl = null,
  previewDocName = null,
  previewDocSize = null,
  onDownloadPreview,
  onClosePreview,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const dokumenInputRef = useRef<HTMLInputElement>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const handleDokumenChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddNewDokumenBarang(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddNewDokumentasiFoto(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDropFoto = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddNewDokumentasiFoto(Array.from(e.dataTransfer.files));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1048576) {
      return `${(bytes / 1048576).toFixed(1)} MB`;
    }
    if (bytes >= 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${bytes} B`;
  };

  const getDokumenBadge = (label?: string) => {
    const norm = (label || '').toLowerCase();
    if (norm.includes('kontrak')) {
      return { bg: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]', label: label || 'Surat Kontrak' };
    }
    if (norm.includes('spk')) {
      return { bg: 'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]', label: label || 'SPK' };
    }
    if (norm.includes('kwitansi')) {
      return { bg: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]', label: label || 'Kwitansi' };
    }
    if (norm.includes('invoice')) {
      return { bg: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]', label: label || 'Invoice' };
    }
    if (norm.includes('pembelian')) {
      return { bg: 'bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4]', label: label || 'Surat Pembelian' };
    }
    return { bg: 'bg-[#F0F4F2] text-[#2C4039] border-[#E4EBE8]', label: label || 'Dokumen' };
  };

  const stepperItems = detail?.tracking?.stepper || [
    { key: 'permohonan', label: 'Permohonan', status: 'selesai' },
    { key: 'pengadaan', label: 'Pengadaan', status: 'selesai' },
    { key: 'pembelian_barang', label: 'Pembelian Barang', status: 'selesai' },
    { key: 'penerimaan_barang', label: 'Penerimaan Barang', status: 'sedang_diproses' },
    { key: 'selesai', label: 'Selesai', status: 'belum_dimulai' },
  ];

  const timelineItems = detail?.tracking?.timeline || [];
  const totalDokumenBarang = existingDokumenBarang.length + newDokumenBarangFiles.length;
  const canSubmit = totalDokumenBarang > 0 && !isSubmitting;

  if (isLoading) {
    return (
      <AppLayout
        activeRoute="pengadaan"
        navItems={PERLENGKAPAN_NAV_ITEMS}
        roleInitials="PL"
        roleTitle="Perlengkapan"
        roleSubtitle="Unit Perlengkapan"
        basePath="/perlengkapan"
        profileHref="/perlengkapan/profil"
        notifikasiHref="/perlengkapan/notifikasi"
        user={user}
      >
        <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0E7C5A]" />
          <p className="text-sm font-semibold text-[#5F6F6A]">Memuat data pengadaan...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      activeRoute="pengadaan"
      navItems={PERLENGKAPAN_NAV_ITEMS}
      roleInitials="PL"
      roleTitle="Perlengkapan"
      roleSubtitle="Unit Perlengkapan"
      basePath="/perlengkapan"
      profileHref="/perlengkapan/profil"
      notifikasiHref="/perlengkapan/notifikasi"
      user={user}
      breadcrumb={[
        { label: 'LIST PENGADAAN', href: '/perlengkapan/pengadaan' },
        { label: detail?.nomor_pengadaan || 'PENGADAAN', href: `/perlengkapan/pengadaan/${detail?.id || ''}` },
        { label: 'EDIT PENERIMAAN' },
      ]}
    >
      <div className="space-y-6 pb-12">
        {/* Banner Header Halaman Edit */}
        <div className="bg-gradient-to-r from-[#0E7C5A] via-[#0b6347] to-[#084b36] rounded-[24px] p-6 sm:p-8 text-white relative overflow-hidden shadow-[0_12px_32px_rgba(14,124,90,0.18)]">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-amber-950 text-[11px] font-bold uppercase tracking-wider">
                  Mode Edit Penerimaan
                </span>
                <StatusPill
                  status={detail?.status || 'sedang_diproses'}
                  label={detail?.status_label || 'Sedang Diproses'}
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-2 tracking-tight">
                {detail?.judul || 'Pengadaan Komputer'}
              </h1>
              <p className="text-xs sm:text-sm text-[#E4F6EC] mt-1 font-medium">
                Nomor {detail?.nomor_pengadaan || 'PGD-2027-0001'} &bull; Diajukan {detail?.tanggal_pengajuan || '04 Maret 2027'}
              </p>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold transition-all cursor-pointer text-white self-start sm:self-auto shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          </div>
        </div>

        {/* 1. Card: Tracking Proses */}
        <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div>
            <h3 className="text-base font-bold text-[#14201C]">Tracking Proses</h3>
            <p className="text-xs text-[#5F6F6A] mt-0.5">
              Posisi pengadaan dalam alur proses saat ini
            </p>
          </div>

          {/* Stepper Horizontal */}
          <div className="mt-6 pt-2 pb-6 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[620px] relative">
              {stepperItems.map((step, idx) => {
                const isStepSelesai = step.status === 'selesai';
                const isStepActive = !isStepSelesai && step.status === 'sedang_diproses';

                let StepIcon = Check;
                if (step.key === 'permohonan') StepIcon = Check;
                else if (step.key === 'pengadaan') StepIcon = FileText;
                else if (step.key === 'pembelian_barang') StepIcon = ShoppingCart;
                else if (step.key === 'penerimaan_barang') StepIcon = isStepSelesai ? Check : Package;
                else if (step.key === 'selesai') StepIcon = isStepSelesai ? Check : Clock;

                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative group">
                    {idx < stepperItems.length - 1 && (
                      <div
                        className={`absolute top-4 left-1/2 w-full h-[2.5px] -z-0 ${
                          isStepSelesai ? 'bg-[#0E7C5A]' : 'bg-[#E4EBE8]'
                        }`}
                      />
                    )}

                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center relative z-10 transition-transform ${
                        isStepSelesai
                          ? 'bg-[#0E7C5A] text-white shadow-xs'
                          : isStepActive
                          ? 'bg-[#0E7C5A] text-white ring-4 ring-[#E8F5EF]'
                          : 'bg-white border-2 border-[#D5DFDC] text-[#8A9A95]'
                      }`}
                    >
                      <StepIcon className="w-4 h-4" />
                    </div>

                    <p className="text-xs font-bold text-[#14201C] mt-2 text-center">
                      {step.label}
                    </p>
                    <p
                      className={`text-[11px] font-medium mt-0.5 ${
                        isStepSelesai
                          ? 'text-[#0E7C5A]'
                          : isStepActive
                          ? 'text-[#B45309]'
                          : 'text-[#8A9A95]'
                      }`}
                    >
                      {isStepSelesai
                        ? 'Selesai'
                        : isStepActive
                        ? 'Sedang diproses'
                        : 'Belum dimulai'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {timelineItems.length > 0 && (
            <div className="mt-4 pt-5 border-t border-[#F0F4F2] space-y-3">
              {timelineItems.map((t, idx) => (
                <div key={idx} className="flex items-start gap-4 text-xs">
                  <span className="font-mono text-[#5F6F6A] w-28 shrink-0">{t.tanggal}</span>
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        t.aktif ? 'bg-[#0E7C5A] ring-2 ring-[#BDE8D1]' : 'bg-[#D5DFDC]'
                      }`}
                    />
                    {idx < timelineItems.length - 1 && (
                      <span className="w-0.5 h-4 bg-[#E4EBE8] mt-1" />
                    )}
                  </div>
                  <span className="text-[#14201C] font-medium leading-relaxed">
                    {t.keterangan}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Section Side-by-Side: Informasi Pengadaan & Vendor & Dokumen Pengadaan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Card: INFORMASI PENGADAAN */}
          <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col justify-between">
            <div>
              <div className="pb-4 border-b border-[#F0F4F2]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A9A95]">
                  INFORMASI PENGADAAN
                </p>
                <h2 className="text-lg sm:text-xl font-bold text-[#14201C] mt-1">
                  {detail?.judul || 'Pengadaan Komputer'}
                </h2>
                <p className="text-xs sm:text-sm text-[#5F6F6A] mt-0.5 font-medium">
                  Diajukan oleh {detail?.diajukan_oleh || 'Jurusan Teknik Informatika & Komputer'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#F9FBFA] border border-[#E4EBE8]">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#8A9A95]">Nomor Pengadaan</p>
                    <p className="text-xs sm:text-sm font-bold text-[#14201C] mt-0.5 truncate">
                      {detail?.nomor_pengadaan || 'PGD-2027-0001'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#F9FBFA] border border-[#E4EBE8]">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#8A9A95]">Tanggal Pengajuan</p>
                    <p className="text-xs sm:text-sm font-bold text-[#14201C] mt-0.5 truncate">
                      {detail?.tanggal_pengajuan || '04 Maret 2027'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#F9FBFA] border border-[#E4EBE8]">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#8A9A95]">Nominal Fix (PPBJ)</p>
                    <p className="text-xs sm:text-sm font-bold text-[#0E7C5A] mt-0.5 truncate">
                      {formatRupiah(detail?.nominal_kontrak ?? detail?.nominal ?? 98500000)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#F9FBFA] border border-[#E4EBE8]">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#8A9A95]">Status Pengadaan</p>
                    <div className="mt-1">
                      <StatusPill
                        status={detail?.status || 'sedang_diproses'}
                        label={detail?.status_label || 'Sedang Diproses'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: VENDOR & DOKUMEN PENGADAAN */}
          <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0F4F2]">
                <div>
                  <h3 className="text-base font-bold text-[#14201C]">Vendor &amp; Dokumen Pengadaan</h3>
                  <p className="text-xs text-[#5F6F6A] mt-0.5">
                    Data vendor dan lampiran dokumen dari PPBJ
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E4EBE8] bg-[#F9FBFA] text-xs font-bold text-[#14201C] shrink-0 self-start sm:self-auto">
                  <Building2 className="w-4 h-4 text-[#0E7C5A]" />
                  <span>{detail?.vendor?.nama || 'PT PNJ PPBJ JAYA ABADI'}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A9A95]">
                    Dokumen Pengadaan ({detail?.vendor?.dokumen?.length || 0})
                  </h4>
                  <span className="text-[11px] text-[#8A9A95]">Lampiran PPBJ</span>
                </div>

                {detail?.vendor?.dokumen && detail.vendor.dokumen.length > 0 ? (
                  <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                    {detail.vendor.dokumen.map((doc) => {
                      const badgeInfo = getDokumenBadge(doc.label);
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#E4EBE8] bg-[#FDFEFE] hover:bg-[#F9FBFA] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#FEECEC] text-[#E5484D] flex items-center justify-center shrink-0">
                              <FileCode className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badgeInfo.bg}`}>
                                  {badgeInfo.label}
                                </span>
                                <p className="text-xs font-bold text-[#14201C] truncate max-w-[160px] sm:max-w-[220px]">
                                  {doc.nama}
                                </p>
                              </div>
                              <p className="text-[11px] text-[#8A9A95] font-medium mt-0.5">
                                {doc.tipe} &bull; {doc.ukuran}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => onViewDokumen?.(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] rounded-lg border border-[#E4EBE8] bg-white text-[#14201C] hover:bg-[#F4F7F5] text-xs font-semibold transition-colors cursor-pointer"
                              title="Lihat Dokumen di tab baru"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#5F6F6A]" />
                              <span className="hidden sm:inline">Lihat</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onDownloadDokumen?.(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] rounded-lg bg-[#0E7C5A] hover:bg-[#09573E] text-white text-xs font-semibold transition-colors cursor-pointer"
                              title="Unduh Dokumen"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Unduh</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-[#D5DFDC] bg-[#F9FBFA] text-center">
                    <FileText className="w-7 h-7 text-[#8A9A95] mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-[#14201C]">Belum Ada Dokumen Terlampir</p>
                    <p className="text-[11px] text-[#5F6F6A] mt-0.5 max-w-sm mx-auto">
                      PPBJ belum melampirkan berkas untuk pengadaan ini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Section Side-by-Side: FORM EDIT Dokumen Barang/Jasa & Dokumentasi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Card Kiri: DOKUMEN BARANG/JASA (BAST & PENDUKUNG) */}
          <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#14201C]">Dokumen Barang/Jasa</h3>
                  <span className="w-2 h-2 rounded-full bg-[#E5484D]" title="Wajib diisi (minimal 1 berkas)" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF6F1] text-[#0E7C5A]">
                  Total {totalDokumenBarang} Berkas
                </span>
              </div>
              <p className="text-xs text-[#5F6F6A] mt-2">
                Kelola berkas Berita Acara Serah Terima (BAST) dan dokumen pendukung lainnya
              </p>

              <div className="mt-3.5 p-3 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#E5484D] mt-1 shrink-0" />
                <p className="text-xs text-[#B91C1C] leading-relaxed">
                  <strong className="font-bold">Wajib bertanda tangan:</strong> Pastikan dokumen yang diperbarui telah ditandatangani oleh pejabat berwenang.
                </p>
              </div>

              {/* Daftar Berkas BAST yang Sudah Ada */}
              {existingDokumenBarang.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider mb-2">
                    Berkas Tersimpan Saat Ini ({existingDokumenBarang.length})
                  </p>
                  <div className="space-y-2.5">
                    {existingDokumenBarang.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-[#E4EBE8] bg-[#FDFEFE] hover:bg-[#F9FBFA] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#FEECEC] text-[#E5484D] flex items-center justify-center shrink-0">
                            <FileCode className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#14201C] truncate">{doc.nama}</p>
                            <p className="text-[11px] text-[#8A9A95]">{doc.tipe} &bull; {doc.ukuran}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onViewDokumen?.(doc)}
                            className="p-1.5 rounded-lg border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5] cursor-pointer"
                            title="Lihat dokumen di tab baru"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDownloadDokumen?.(doc)}
                            className="p-1.5 rounded-lg bg-[#0E7C5A] text-white hover:bg-[#09573E] cursor-pointer"
                            title="Unduh dokumen"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveExistingDokumenBarang(doc.id)}
                            className="w-7 h-7 rounded-lg text-[#8A9A95] hover:text-[#E5484D] hover:bg-[#FEECEC] flex items-center justify-center transition-colors cursor-pointer"
                            title="Hapus berkas ini"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daftar Berkas Baru yang Ditambahkan */}
              {newDokumenBarangFiles.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#F0F4F2]">
                  <p className="text-[11px] font-bold text-[#0E7C5A] uppercase tracking-wider mb-2">
                    Berkas Baru Ditambahkan ({newDokumenBarangFiles.length})
                  </p>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {newDokumenBarangFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-[#BDE8D1] bg-[#F9FDFB]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0">
                            <FileCode className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#14201C] truncate">
                              {file.name}
                            </p>
                            <p className="text-[11px] text-[#8A9A95]">
                              {file.name.split('.').pop()?.toUpperCase() || 'PDF'} &bull;{' '}
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onViewNewDokumen ? onViewNewDokumen(file) : window.open(URL.createObjectURL(file), '_blank')}
                            className="p-1.5 rounded-lg border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5] cursor-pointer"
                            title="Lihat berkas di tab baru"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDownloadNewDokumen?.(file)}
                            className="p-1.5 rounded-lg bg-[#0E7C5A] text-white hover:bg-[#09573E] cursor-pointer"
                            title="Unduh berkas"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveNewDokumenBarang(idx)}
                            className="w-7 h-7 rounded-lg text-[#8A9A95] hover:text-[#E5484D] hover:bg-[#FEECEC] flex items-center justify-center transition-colors cursor-pointer"
                            title="Batalkan berkas baru"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tombol Tambah Berkas Baru */}
              <input
                ref={dokumenInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={handleDokumenChange}
              />
              <button
                type="button"
                onClick={() => dokumenInputRef.current?.click()}
                className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-[#BDE8D1] hover:border-[#0E7C5A] bg-[#F9FDFB] hover:bg-[#EEF5F2] text-xs font-bold text-[#0E7C5A] flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Unggah / Tambah Dokumen BAST Baru</span>
              </button>
            </div>
          </div>

          {/* Card Kanan: DOKUMENTASI FOTO SERAH TERIMA */}
          <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
                <div>
                  <h3 className="text-base font-bold text-[#14201C]">Dokumentasi Foto</h3>
                  <p className="text-xs text-[#5F6F6A] mt-0.5">
                    Foto kondisi fisik barang pada saat serah terima
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF6F1] text-[#0E7C5A]">
                  Total {existingDokumentasiFoto.length + newDokumentasiFotoFiles.length} Foto
                </span>
              </div>

              {/* Foto yang Sudah Ada Sebelumnya */}
              {existingDokumentasiFoto.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider mb-2">
                    Foto Tersimpan Saat Ini ({existingDokumentasiFoto.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {existingDokumentasiFoto.map((foto) => (
                      <div
                        key={foto.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-[#E4EBE8] bg-[#FDFEFE] hover:bg-[#F9FBFA] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="px-2 py-1 rounded bg-[#E4F6EC] text-[#0E7C5A] text-[10px] font-bold shrink-0">
                            {foto.tipe}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#14201C] truncate">{foto.nama}</p>
                            <p className="text-[10px] text-[#8A9A95]">{foto.ukuran}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => (onViewDokumentasi || onViewDokumen)?.(foto)}
                            className="p-1.5 rounded-lg border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5] cursor-pointer"
                            title="Lihat foto (pop up)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => (onDownloadDokumentasi || onDownloadDokumen)?.(foto)}
                            className="p-1.5 rounded-lg bg-[#0E7C5A] text-white hover:bg-[#09573E] cursor-pointer"
                            title="Unduh foto"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveExistingDokumentasiFoto(foto.id)}
                            className="p-1.5 rounded-lg text-[#8A9A95] hover:text-[#E5484D] hover:bg-[#FEECEC] cursor-pointer"
                            title="Hapus foto ini"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dropzone Upload Foto Baru */}
              <input
                ref={fotoInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,video/mp4"
                className="hidden"
                onChange={handleFotoChange}
              />
              <div
                onClick={() => fotoInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropFoto}
                className="mt-4 p-6 rounded-2xl border-2 border-dashed border-[#D5DFDC] hover:border-[#0E7C5A] bg-[#F9FBFA] hover:bg-[#EEF5F2] flex flex-col items-center justify-center text-center cursor-pointer transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center mb-1.5">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-[#14201C]">
                  <span className="text-[#0E7C5A] font-bold">Klik untuk tambah foto</span> atau drag &amp; drop
                </p>
                <p className="text-[11px] text-[#8A9A95] mt-0.5">
                  JPG, PNG, atau MP4 &bull; maks 20 MB per berkas
                </p>
              </div>

              {/* Antrean Foto Baru */}
              {newDokumentasiFotoFiles.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#F0F4F2]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-[#0E7C5A]">Foto Baru Siap Diunggah</span>
                    <span className="text-xs font-bold text-[#0E7C5A]">
                      {newDokumentasiFotoFiles.length} Berkas
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                    {newDokumentasiFotoFiles.map((file, idx) => {
                      const ext = file.name.split('.').pop()?.toUpperCase() || 'JPG';
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-[#BDE8D1] bg-[#F9FDFB]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="px-2 py-0.5 rounded bg-[#E4F6EC] text-[#0E7C5A] text-[10px] font-bold shrink-0">
                              {ext}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#14201C] truncate">
                                {file.name}
                              </p>
                              <p className="text-[11px] text-[#8A9A95]">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onViewNewFoto?.(file)}
                              className="p-1 rounded-lg border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5] cursor-pointer"
                              title="Lihat foto (pop up)"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDownloadNewFoto?.(file)}
                              className="p-1 rounded-lg bg-[#0E7C5A] text-white hover:bg-[#09573E] cursor-pointer"
                              title="Unduh foto"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveNewDokumentasiFoto(idx)}
                              className="w-6 h-6 rounded-lg text-[#8A9A95] hover:text-[#E5484D] hover:bg-[#FEECEC] flex items-center justify-center transition-colors cursor-pointer"
                              title="Hapus foto baru"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer / Action Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#5F6F6A]">
            <Info className="w-4 h-4 text-[#8A9A95] shrink-0" />
            <span>
              Perubahan berkas serah terima dan foto dokumentasi akan diperbarui secara permanen.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-5 py-2.5 min-h-[44px] rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#5F6F6A] hover:bg-[#EEF5F2] transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-[#0E7C5A] hover:bg-[#09573E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Simpan Perubahan */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-[#0E7C5A] mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5F2] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-[#0E7C5A]" />
              </div>
              <h3 className="text-base font-bold text-[#14201C]">Konfirmasi Perubahan</h3>
            </div>
            <p className="text-xs text-[#5F6F6A] leading-relaxed">
              Apakah Anda yakin ingin menyimpan perubahan dokumen dan foto serah terima barang untuk pengadaan{' '}
              <strong className="text-[#14201C]">{detail?.nomor_pengadaan}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[#F0F4F2]">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#5F6F6A] hover:bg-[#F4F7F5] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  onSubmitUpdate();
                }}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0E7C5A] hover:bg-[#09573E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Ya, Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document / Photo Preview Modal (Pop Up) */}
      <DocumentPreviewModal
        isOpen={previewBlobUrl !== null}
        onClose={onClosePreview || (() => {})}
        blobUrl={previewBlobUrl}
        filename={previewDocName || 'Dokumentasi_Foto.jpg'}
        label="Pratinjau Dokumentasi"
        size={previewDocSize || 'Foto Dokumentasi'}
        onDownload={onDownloadPreview}
      />
    </AppLayout>
  );
};

export default PerlengkapanPengadaanEditTemplate;
