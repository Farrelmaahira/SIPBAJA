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
  CheckCircle2,
} from 'lucide-react';
import AppLayout, { type AppTopbarUser } from '../General/AppLayout';
import StatusPill from '../../atoms/StatusPill';
import DocumentPreviewModal from '../../organisms/DocumentPreviewModal';
import KonfirmasiPenerimaanModal from '../../organisms/Perlengkapan/KonfirmasiPenerimaanModal';
import { PERLENGKAPAN_NAV_ITEMS } from '../../../constants/perlengkapanNav';
import { formatRupiah } from '../../../utils/formatters';
import type {
  PerlengkapanPengadaanDetail,
  PerlengkapanDokumenItem,
} from '../../../types/perlengkapan';

export interface PerlengkapanPengadaanShowTemplateProps {
  user?: AppTopbarUser | null;
  detail: PerlengkapanPengadaanDetail | null;
  isLoading?: boolean;
  isSubmitting?: boolean;
  dokumenBarangFiles: File[];
  onAddDokumenBarang: (files: File[]) => void;
  onRemoveDokumenBarang: (index: number) => void;
  dokumentasiFotoFiles: File[];
  onAddDokumentasiFoto: (files: File[]) => void;
  onRemoveDokumentasiFoto: (index: number) => void;
  onSubmitPenerimaan: () => void;
  onBack: () => void;
  onViewDokumen?: (doc: PerlengkapanDokumenItem) => void;
  onDownloadDokumen?: (doc: PerlengkapanDokumenItem) => void;
  previewBlobUrl?: string | null;
  previewDocName?: string | null;
  onClosePreview?: () => void;
  isConfirmOpen?: boolean;
  onOpenConfirm?: () => void;
  onCloseConfirm?: () => void;
}

export const PerlengkapanPengadaanShowTemplate: FC<PerlengkapanPengadaanShowTemplateProps> = ({
  user,
  detail,
  isLoading = false,
  isSubmitting = false,
  dokumenBarangFiles,
  onAddDokumenBarang,
  onRemoveDokumenBarang,
  dokumentasiFotoFiles,
  onAddDokumentasiFoto,
  onRemoveDokumentasiFoto,
  onSubmitPenerimaan,
  onBack,
  onViewDokumen,
  onDownloadDokumen,
  previewBlobUrl = null,
  previewDocName = null,
  onClosePreview,
  isConfirmOpen,
  onOpenConfirm,
  onCloseConfirm,
}) => {
  const [internalConfirmOpen, setInternalConfirmOpen] = useState(false);
  const confirmOpen = isConfirmOpen !== undefined ? isConfirmOpen : internalConfirmOpen;
  const handleOpenConfirm = onOpenConfirm || (() => setInternalConfirmOpen(true));
  const handleCloseConfirm = onCloseConfirm || (() => setInternalConfirmOpen(false));

  const dokumenInputRef = useRef<HTMLInputElement>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const isSelesai = detail?.status === 'selesai' || detail?.status === 'barang_diterima' || detail?.penerimaan !== null;

  const handleDokumenChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddDokumenBarang(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddDokumentasiFoto(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDropFoto = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddDokumentasiFoto(Array.from(e.dataTransfer.files));
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

  if (isLoading && !detail) {
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
          <p className="text-sm font-semibold text-[#5F6F6A]">Memuat detail pengadaan...</p>
        </div>
      </AppLayout>
    );
  }

  const stepperItems = detail?.tracking?.stepper || [
    { key: 'permohonan', label: 'Permohonan', status: 'selesai' as const },
    { key: 'pengadaan', label: 'Pengadaan', status: 'selesai' as const },
    { key: 'pembelian_barang', label: 'Pembelian Barang', status: 'selesai' as const },
    { key: 'penerimaan_barang', label: 'Penerimaan Barang', status: isSelesai ? ('selesai' as const) : ('sedang_diproses' as const) },
    { key: 'selesai', label: 'Selesai', status: isSelesai ? ('selesai' as const) : ('belum_dimulai' as const) },
  ];

  const timelineItems = detail?.tracking?.timeline || [];

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
        { label: 'DETAIL PENGADAAN' },
      ]}
    >
      <div className="space-y-6 pb-12">
        {/* Hero Header Card */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#0E7C5A] to-[#12A06B] p-6 sm:p-8 text-white shadow-[0_12px_28px_rgba(14,124,90,0.18)]">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#BDE8D1]">
                PENGADAAN
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Detail Pengadaan
                </h1>
                <StatusPill
                  status={detail?.status || 'sedang_diproses'}
                  label={detail?.status_label || (isSelesai ? 'Selesai' : 'Sedang Diproses')}
                />
              </div>
              <p className="text-xs sm:text-sm text-[#E4F6EC] mt-2 font-medium">
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

        {/* Card 1: INFORMASI PENGADAAN */}
        <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#F0F4F2]">
            {/* Box 1 */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#8A9A95]">Nomor Pengadaan</p>
                <p className="text-xs sm:text-sm font-bold text-[#14201C] mt-0.5">
                  {detail?.nomor_pengadaan || 'PGD-2027-0001'}
                </p>
              </div>
            </div>

            {/* Box 2 */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#8A9A95]">Tanggal Pengajuan</p>
                <p className="text-xs sm:text-sm font-bold text-[#14201C] mt-0.5">
                  {detail?.tanggal_pengajuan || '04 Maret 2027'}
                </p>
              </div>
            </div>

            {/* Box 3 */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#8A9A95]">Nominal/Estimasi</p>
                <p className="text-xs sm:text-sm font-bold text-[#14201C] mt-0.5">
                  {formatRupiah(detail?.nominal || 100000000)}
                </p>
              </div>
            </div>

            {/* Box 4 */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#8A9A95]">Status</p>
                <div className="mt-1">
                  <StatusPill
                    status={detail?.status || 'sedang_diproses'}
                    label={detail?.status_label || (isSelesai ? 'Selesai' : 'Sedang Diproses')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Tracking Proses */}
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
                const isStepSelesai =
                  step.status === 'selesai' ||
                  (isSelesai && (step.key === 'penerimaan_barang' || step.key === 'selesai'));
                const isStepActive = !isStepSelesai && step.status === 'sedang_diproses';

                let StepIcon = Check;
                if (step.key === 'permohonan') StepIcon = Check;
                else if (step.key === 'pengadaan') StepIcon = FileText;
                else if (step.key === 'pembelian_barang') StepIcon = ShoppingCart;
                else if (step.key === 'penerimaan_barang') StepIcon = isStepSelesai ? Check : Package;
                else if (step.key === 'selesai') StepIcon = isStepSelesai ? Check : Clock;

                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative group">
                    {/* Line Connector */}
                    {idx < stepperItems.length - 1 && (
                      <div
                        className={`absolute top-4 left-1/2 w-full h-[2.5px] -z-0 ${
                          isStepSelesai ? 'bg-[#0E7C5A]' : 'bg-[#E4EBE8]'
                        }`}
                      />
                    )}

                    {/* Step Circle */}
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

                    {/* Label & Status */}
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

          {/* Vertical Timeline */}
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

        {/* Card 3: Vendor & Dokumen Pengadaan */}
        <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F0F4F2]">
            <div>
              <h3 className="text-base font-bold text-[#14201C]">Vendor &amp; Dokumen Pengadaan</h3>
              <p className="text-xs text-[#5F6F6A] mt-0.5">
                Data vendor dan dokumen dari PPBJ
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-[#5F6F6A]">Nama Vendor</span>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E4EBE8] bg-[#F9FBFA] text-xs font-bold text-[#14201C]">
                <Building2 className="w-4 h-4 text-[#0E7C5A]" />
                <span>{detail?.vendor?.nama || 'PT PNJ PPBJ JAYA ABADI'}</span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A9A95] mb-3">
              Dokumen Pengadaan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(detail?.vendor?.dokumen || []).map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-[#E4EBE8] bg-[#FDFEFE] hover:bg-[#F9FBFA] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#FEECEC] text-[#E5484D] flex items-center justify-center shrink-0">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#14201C] truncate">{doc.nama}</p>
                      <p className="text-[11px] text-[#8A9A95] font-medium mt-0.5">
                        {doc.label || 'Dokumen'} &bull; {doc.tipe} &bull; {doc.ukuran}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => onViewDokumen?.(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg border border-[#E4EBE8] bg-white text-[#14201C] hover:bg-[#F4F7F5] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#5F6F6A]" />
                      <span>Lihat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadDokumen?.(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-[#0E7C5A] hover:bg-[#09573E] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 4: Dokumen Barang/Jasa */}
        <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#14201C]">Dokumen Barang/Jasa</h3>
              {!isSelesai ? (
                <span className="w-2 h-2 rounded-full bg-[#E5484D]" title="Wajib diisi" />
              ) : (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E4F6EC] text-[#0E7C5A]">
                  Terverifikasi
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-[#5F6F6A] mt-0.5">
            {isSelesai
              ? 'Berita Acara Serah Terima (BAST) dan dokumen serah terima yang telah diverifikasi'
              : 'Berita acara serah terima dan dokumen pendukung lainnya'}
          </p>

          {/* Banner Peringatan Bertanda Tangan */}
          {!isSelesai ? (
            <div className="mt-4 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#E5484D] mt-1 shrink-0" />
              <p className="text-xs text-[#B91C1C] leading-relaxed">
                <strong className="font-bold">Wajib ditandatangani terlebih dahulu:</strong>{' '}
                Pastikan setiap dokumen sudah bertanda tangan sebelum diunggah.
              </p>
            </div>
          ) : (
            <div className="mt-4 p-3.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <p className="text-xs text-[#15803D] font-medium leading-relaxed">
                Berita Acara Serah Terima (BAST) telah diterima dan diverifikasi oleh Unit Perlengkapan.
              </p>
            </div>
          )}

          {/* Dokumen yang Sudah Tersimpan (mode read-only / selesai) */}
          {isSelesai && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {(detail?.penerimaan?.dokumen_barang && detail.penerimaan.dokumen_barang.length > 0
                ? detail.penerimaan.dokumen_barang
                : [
                    {
                      id: 'bast-fallback',
                      nama: `BAST_Serah_Terima_${detail?.nomor_pengadaan || 'Pengadaan'}.pdf`,
                      tipe: 'PDF',
                      ukuran: '2.4 MB',
                      url: `/api/v1/perlengkapan/pengadaan/${detail?.id || 1}/dokumen/bast`,
                    },
                  ]
              ).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#E4EBE8] bg-[#FDFEFE]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#FEECEC] text-[#E5484D] flex items-center justify-center shrink-0">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#14201C] truncate">{doc.nama}</p>
                      <p className="text-[11px] text-[#8A9A95]">{doc.tipe} &bull; {doc.ukuran}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onViewDokumen?.(doc)}
                      className="p-2 rounded-lg border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5] cursor-pointer"
                      title="Lihat dokumen"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadDokumen?.(doc)}
                      className="p-2 rounded-lg bg-[#0E7C5A] text-white hover:bg-[#09573E] cursor-pointer"
                      title="Unduh dokumen"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dokumen Barang Baru yang Dipilih untuk Diunggah (HANYA saat belum selesai) */}
          {!isSelesai && (
            <>
              {dokumenBarangFiles.length > 0 && (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {dokumenBarangFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-[#E4EBE8] bg-[#FDFEFE] group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#FEECEC] text-[#E5484D] flex items-center justify-center shrink-0">
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

                      <button
                        type="button"
                        onClick={() => onRemoveDokumenBarang(idx)}
                        className="w-7 h-7 rounded-lg text-[#8A9A95] hover:text-[#E5484D] hover:bg-[#FEECEC] flex items-center justify-center transition-colors cursor-pointer"
                        title="Hapus berkas"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tombol Tambah Dokumen */}
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
                className="mt-4 w-full py-3.5 rounded-xl border-2 border-dashed border-[#BDE8D1] hover:border-[#0E7C5A] bg-[#F9FDFB] hover:bg-[#EEF5F2] text-xs font-bold text-[#0E7C5A] flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Dokumen</span>
              </button>
            </>
          )}
        </div>

        {/* Card 5: Dokumentasi */}
        <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#14201C]">Dokumentasi</h3>
              <p className="text-xs text-[#5F6F6A] mt-0.5">
                {isSelesai
                  ? 'Foto fisik barang yang telah diperiksa pada saat serah terima'
                  : 'Foto kondisi barang/jasa, bisa lebih dari satu'}
              </p>
            </div>
            {isSelesai && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E4F6EC] text-[#0E7C5A]">
                Foto Serah Terima
              </span>
            )}
          </div>

          {/* Foto yang Sudah Tersimpan (mode read-only / selesai) */}
          {isSelesai && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {(detail?.penerimaan?.dokumentasi_foto && detail.penerimaan.dokumentasi_foto.length > 0
                ? detail.penerimaan.dokumentasi_foto
                : [
                    {
                      id: 'foto-fallback-1',
                      nama: 'Dokumentasi_Fisik_Barang_1.jpg',
                      tipe: 'JPG',
                      ukuran: '1.8 MB',
                      url: `/api/v1/perlengkapan/pengadaan/${detail?.id || 1}/dokumen/foto-1`,
                    },
                  ]
              ).map((foto) => (
                <div
                  key={foto.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E4EBE8] bg-[#FDFEFE]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2 py-1 rounded bg-[#E4F6EC] text-[#0E7C5A] text-[10px] font-bold">
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
                      onClick={() => onViewDokumen?.(foto)}
                      className="p-1.5 rounded-lg border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5] cursor-pointer"
                      title="Lihat foto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadDokumen?.(foto)}
                      className="p-1.5 rounded-lg bg-[#0E7C5A] text-white hover:bg-[#09573E] cursor-pointer"
                      title="Unduh foto"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dropzone Upload Foto (HANYA saat belum selesai) */}
          {!isSelesai && (
            <>
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
                className="mt-4 p-7 rounded-2xl border-2 border-dashed border-[#D5DFDC] hover:border-[#0E7C5A] bg-[#F9FBFA] hover:bg-[#EEF5F2] flex flex-col items-center justify-center text-center cursor-pointer transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center mb-2">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-[#14201C]">
                  <span className="text-[#0E7C5A] font-bold">Klik untuk upload</span> atau drag &amp; drop
                </p>
                <p className="text-[11px] text-[#8A9A95] mt-1">
                  JPG, PNG, atau MP4 &bull; maksimal 20 MB per file
                </p>
              </div>

              {/* Antrean Upload */}
              {dokumentasiFotoFiles.length > 0 && (
                <div className="mt-5 pt-4 border-t border-[#F0F4F2]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#5F6F6A]">Antrean Upload</span>
                    <span className="text-xs font-bold text-[#0E7C5A]">
                      {dokumentasiFotoFiles.length} Siap
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dokumentasiFotoFiles.map((file, idx) => {
                      const ext = file.name.split('.').pop()?.toUpperCase() || 'JPG';
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-[#E4EBE8] bg-[#FDFEFE]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="px-2 py-1 rounded bg-[#E4F6EC] text-[#0E7C5A] text-[10px] font-bold shrink-0">
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

                          <button
                            type="button"
                            onClick={() => onRemoveDokumentasiFoto(idx)}
                            className="w-7 h-7 rounded-lg text-[#8A9A95] hover:text-[#E5484D] hover:bg-[#FEECEC] flex items-center justify-center transition-colors cursor-pointer"
                            title="Hapus foto"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer / Action Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#5F6F6A]">
            <Info className="w-4 h-4 text-[#8A9A95] shrink-0" />
            <span>
              {isSelesai
                ? 'Seluruh berkas serah terima barang telah lengkap dan tersimpan secara permanen.'
                : 'Pastikan dokumen barang/jasa sudah ditandatangani sebelum dikirim.'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-5 py-2.5 min-h-[44px] rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#5F6F6A] hover:bg-[#EEF5F2] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSelesai ? 'Kembali' : 'Batal'}
            </button>

            {!isSelesai ? (
              <button
                type="button"
                onClick={handleOpenConfirm}
                disabled={isSubmitting || dokumenBarangFiles.length === 0}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-[#0E7C5A] hover:bg-[#09573E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim</span>
                )}
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E4F6EC] text-[#0B7A4E] text-xs font-bold border border-[#BDE8D1]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Penerimaan Barang Selesai</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Konfirmasi Kirim Penerimaan Barang Modal */}
      <KonfirmasiPenerimaanModal
        isOpen={confirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={onSubmitPenerimaan}
        nomorPengadaan={detail?.nomor_pengadaan}
        judulPengadaan={detail?.judul}
        totalDokumenBarang={dokumenBarangFiles.length}
        totalDokumentasiFoto={dokumentasiFotoFiles.length}
        isSubmitting={isSubmitting}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewBlobUrl !== null}
        onClose={onClosePreview || (() => {})}
        blobUrl={previewBlobUrl}
        filename={previewDocName || 'Dokumen Pengadaan'}
      />
    </AppLayout>
  );
};

export default PerlengkapanPengadaanShowTemplate;
