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
  UploadCloud,
  Info,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Store,
  Compass,
  BarChart2,
  Bell,
  Image as ImageIcon,
} from 'lucide-react';
import AppLayout, { type AppTopbarUser } from '../General/AppLayout';
import StatusPill from '../../atoms/StatusPill';
import DocumentPreviewModal from '../../organisms/DocumentPreviewModal';
import KonfirmasiPembayaranModal from '../../organisms/Keuangan/KonfirmasiPembayaranModal';
import { KEUANGAN_NAV_ITEMS } from '../../../constants/keuanganNav';
import { formatRupiah } from '../../../utils/formatters';
import type {
  KeuanganPengadaanDetail,
  KeuanganDokumenItem,
} from '../../../types/keuangan';

export interface KeuanganPengadaanShowTemplateProps {
  user?: AppTopbarUser | null;
  detail: KeuanganPengadaanDetail | null;
  isLoading?: boolean;
  isSubmitting?: boolean;
  tanggalPembayaran: string;
  onTanggalPembayaranChange: (val: string) => void;
  buktiBayarFiles: File[];
  onAddBuktiBayar: (files: File[]) => void;
  onRemoveBuktiBayar: (index: number) => void;
  onSubmitBuktiBayar: () => void;
  onBack: () => void;
  onViewDokumen?: (doc: KeuanganDokumenItem) => void;
  onDownloadDokumen?: (doc: KeuanganDokumenItem) => void;
  previewBlobUrl?: string | null;
  previewDocName?: string | null;
  onClosePreview?: () => void;
  isConfirmOpen?: boolean;
  onOpenConfirm?: () => void;
  onCloseConfirm?: () => void;
}

export const KeuanganPengadaanShowTemplate: FC<KeuanganPengadaanShowTemplateProps> = ({
  user,
  detail,
  isLoading = false,
  isSubmitting = false,
  tanggalPembayaran,
  onTanggalPembayaranChange,
  buktiBayarFiles,
  onAddBuktiBayar,
  onRemoveBuktiBayar,
  onSubmitBuktiBayar,
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSelesai = detail?.status === 'selesai' || detail?.pembayaran?.status === 'selesai';

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddBuktiBayar(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddBuktiBayar(Array.from(e.dataTransfer.files));
    }
  };

  const handleFormSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggalPembayaran) {
      alert('Silakan pilih tanggal pembayaran terlebih dahulu.');
      return;
    }
    if (buktiBayarFiles.length === 0) {
      alert('Silakan unggah minimal satu berkas bukti pembayaran.');
      return;
    }
    handleOpenConfirm();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1048576) {
      return (bytes / 1048576).toFixed(1) + ' MB';
    }
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  if (isLoading || !detail) {
    return (
      <AppLayout
        activeRoute="pengadaan"
        navItems={KEUANGAN_NAV_ITEMS}
        roleInitials="KE"
        roleTitle="Keuangan"
        roleSubtitle="Unit Keuangan"
        basePath="/keuangan"
        user={user}
        profileHref="/keuangan/profil"
        notifikasiHref="/keuangan/notifikasi"
      >
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-[#0E7C5A] animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-[#5F6F6A]">Memuat detail pengadaan...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      activeRoute="pengadaan"
      navItems={KEUANGAN_NAV_ITEMS}
      roleInitials="KE"
      roleTitle="Keuangan"
      roleSubtitle="Unit Keuangan"
      basePath="/keuangan"
      user={user}
      profileHref="/keuangan/profil"
      notifikasiHref="/keuangan/notifikasi"
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-[11px] font-semibold text-[#8A9A95] uppercase tracking-wider flex items-center gap-1.5">
          <span>LIST PENGADAAN</span>
          <span>&gt;</span>
          <span className="text-[#0E7C5A]">DETAIL PENGADAAN</span>
        </nav>

        {/* Hero Header */}
        <div className="bg-[#0E7C5A] rounded-[22px] p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8DAC7]">
              PENGADAAN
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Detail Pengadaan</h1>
              <StatusPill
                status={detail?.status || 'menunggu_input'}
                label={detail?.status_label || (isSelesai ? 'Selesai' : 'Menunggu Input')}
              />
            </div>
            <p className="text-xs text-[#D1EBE1] pt-1">
              No. Pengadaan {detail?.nomor_pengadaan || '-'} &bull; Permohonan {detail?.nomor_permohonan || '-'} &bull; Diajukan {detail?.tanggal_pengajuan || '-'}
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors self-start md:self-auto cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
        </div>

        {/* Tanggal Pengingat Pengadaan */}
        {detail?.tanggal_pengingat && (
          <div className="bg-[#FFF8EE] border border-[#FDE68A] rounded-2xl px-5 py-3.5 flex items-center justify-between text-xs text-[#B45309]">
            <div className="flex items-center gap-2 font-semibold">
              <Bell className="w-4 h-4 text-[#D97706]" />
              <span>Tanggal Pengingat Pengadaan</span>
            </div>
            <span className="font-bold text-[#14201C]">{detail.tanggal_pengingat}</span>
          </div>
        )}

        {/* Card 1: INFORMASI PENGADAAN */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] space-y-5">
          <div>
            <span className="text-[10px] font-bold text-[#8A9A95] uppercase tracking-wider block">
              INFORMASI PENGADAAN
            </span>
            <h2 className="text-lg font-bold text-[#14201C] mt-0.5">
              {detail?.judul || 'Pengadaan Komputer'}
            </h2>
            <p className="text-xs text-[#5F6F6A]">
              Diajukan oleh {detail?.unit_pemohon || 'Jurusan Teknik Informatika & Komputer'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-1">
            {/* Col 1 */}
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 mt-0.5">
                  <Hash className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px] font-medium">No. Pengadaan</span>
                  <span className="font-bold text-[#14201C]">{detail?.informasi_pengadaan?.no_pengadaan || '-'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 mt-0.5">
                  <Hash className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px] font-medium">Nomor Permohonan</span>
                  <span className="font-bold text-[#14201C]">{detail?.informasi_pengadaan?.nomor_permohonan || '-'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px] font-medium">Tanggal Pengajuan</span>
                  <span className="font-bold text-[#14201C]">{detail?.informasi_pengadaan?.tanggal_pengajuan || '-'}</span>
                </div>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px] font-medium">Jenis Pengadaan</span>
                  <span className="font-bold text-[#14201C]">{detail?.informasi_pengadaan?.jenis_pengadaan || 'Barang'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px] font-medium">Metode Pengadaan</span>
                  <span className="font-bold text-[#14201C]">{detail?.informasi_pengadaan?.metode_pengadaan || 'Non Tender'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px] font-medium">Level Pengadaan</span>
                  <span className="font-bold text-[#14201C]">{detail?.informasi_pengadaan?.level_pengadaan || '50-200 Juta'}</span>
                </div>
              </div>
            </div>

            {/* Col 3 */}
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 mt-0.5">
                  <Banknote className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px] font-medium">Nominal/Estimasi</span>
                  <span className="font-bold text-[#14201C]">{formatRupiah(detail?.informasi_pengadaan?.nominal_estimasi || 0)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 mt-0.5">
                  <Banknote className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px] font-medium">Biaya Riil</span>
                  <span className="font-bold text-[#14201C]">{formatRupiah(detail?.informasi_pengadaan?.biaya_riil || 0)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 mt-0.5">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px] font-medium">Nama Vendor</span>
                  <span className="font-bold text-[#14201C] truncate max-w-[150px] block" title={detail?.informasi_pengadaan?.nama_vendor}>
                    {detail?.informasi_pengadaan?.nama_vendor || 'PT PNJ PPBJ JAYA ABADI'}
                  </span>
                </div>
              </div>
            </div>

            {/* Col 4 */}
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px] font-medium">Verifikasi PP</span>
                  <span className="font-bold text-[#14201C]">{detail?.informasi_pengadaan?.verifikasi_pp || 'Diverifikasi oleh PP'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px] font-medium">Persetujuan PPK</span>
                  <span className="font-bold text-[#14201C]">{detail?.informasi_pengadaan?.persetujuan_ppk || 'Disetujui oleh PPK'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px] font-medium">Status Pengadaan</span>
                  <div className="mt-0.5">
                    <StatusPill
                      status={detail?.informasi_pengadaan?.status_pengadaan || 'menunggu_input'}
                      label={detail?.informasi_pengadaan?.status_label || (isSelesai ? 'Selesai' : 'Menunggu Input')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Tracking Proses */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#14201C]">Tracking Proses</h2>
            <p className="text-xs text-[#5F6F6A]">Posisi pengadaan dalam alur proses saat ini</p>
          </div>

          {/* Stepper 5-tahap */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {(detail?.tracking_proses?.stepper || []).map((step, idx) => (
              <div key={step.id || idx} className="flex flex-col items-center text-center space-y-2 relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-xs ${
                    step.status === 'selesai'
                      ? 'bg-[#0E7C5A] text-white ring-4 ring-[#EEF5F2]'
                      : step.status === 'current'
                      ? 'bg-[#FEF3C7] text-[#B45309] ring-4 ring-[#FEF9EE] border border-[#FDE68A]'
                      : 'bg-[#F0F4F2] text-[#8A9A95]'
                  }`}
                >
                  {step.icon === 'check' && <Check className="w-5 h-5" />}
                  {step.icon === 'file' && <FileText className="w-5 h-5" />}
                  {step.icon === 'cart' && <ShoppingCart className="w-5 h-5" />}
                  {step.icon === 'package' && <Package className="w-5 h-5" />}
                  {step.icon === 'target' && <Clock className="w-5 h-5" />}
                  {!['check', 'file', 'cart', 'package', 'target'].includes(step.icon || '') && (idx + 1)}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#14201C] block">{step.label}</span>
                  <span className="text-[11px] text-[#5F6F6A] font-medium block">
                    {step.sublabel || (step.status === 'selesai' ? 'Selesai' : 'Pending')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline List */}
          <div className="pt-4 border-t border-[#F0F4F2] space-y-3">
            {(detail?.tracking_proses?.timeline || []).map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 text-xs">
                <span className="font-semibold text-[#8A9A95] w-32 shrink-0">{item.waktu}</span>
                <div className="w-2 h-2 rounded-full bg-[#0E7C5A] shrink-0 mt-1.5" />
                <span className="text-[#14201C] font-medium">{item.deskripsi}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Dokumen yang Diterima */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#14201C]">Dokumen yang Diterima</h2>
            <p className="text-xs text-[#5F6F6A]">
              Dokumen dari tahap sebelumnya dan jenis MAK dari Perencanaan
            </p>
          </div>

          {/* 12 Grid Dokumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(detail?.dokumen_diterima || []).map((doc) => (
              <div
                key={doc.id}
                className="bg-[#FAFCFB] border border-[#E4EBE8] rounded-2xl p-4 flex flex-col justify-between hover:border-[#A8DAC7] transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider block">
                      {doc.tipe}
                    </span>
                    {onDownloadDokumen && (
                      <button
                        type="button"
                        onClick={() => onDownloadDokumen(doc)}
                        className="text-[#8A9A95] hover:text-[#0E7C5A] transition-colors p-1"
                        title="Unduh Berkas"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FDECEC] text-[#E5484D] flex items-center justify-center shrink-0">
                      {doc.is_image ? <ImageIcon className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
                    </div>
                    <div className="overflow-hidden">
                      <span className="font-bold text-xs text-[#14201C] block truncate" title={doc.nama}>
                        {doc.nama}
                      </span>
                      <span className="text-[10px] text-[#8A9A95] font-medium block">
                        {doc.ukuran}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#EEF3F0]">
                  {onViewDokumen && (
                    <button
                      type="button"
                      onClick={() => onViewDokumen(doc)}
                      className="w-full py-1.5 px-3 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F0F4F2] text-[#0E7C5A] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{doc.is_image ? 'Lihat Foto' : 'Lihat Dokumen'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Kartu MAK dari Perencanaan */}
          {detail?.jenis_mak && detail.jenis_mak.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {detail.jenis_mak.map((mak, idx) => (
                <div
                  key={idx}
                  className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider block">
                      JENIS MAK DARI PERENCANAAN
                    </span>
                    <span className="font-bold text-xs text-[#14201C] block">
                      {mak.kode} - {mak.nama}
                    </span>
                    <span className="text-[11px] text-[#5F6F6A] block">
                      Penanggung Jawab MAK: {mak.penanggung_jawab}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 4: Form Bukti Pembayaran */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#14201C]">Form Bukti Pembayaran</h2>
            <p className="text-xs text-[#5F6F6A]">
              Lengkapi tanggal pembayaran dan unggah bukti pembayaran
            </p>
          </div>

          {isSelesai ? (
            <div className="space-y-4">
              <div className="bg-[#E4F6EC] border border-[#BDE8D1] rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#0E7C5A] shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-[#0B7A4E]">Pembayaran Telah Selesai</h3>
                  <p className="text-xs text-[#285A43] mt-0.5">
                    Proses pencairan dana dan pengunggahan bukti bayar telah selesai diproses.
                  </p>
                </div>
              </div>

              {detail?.pembayaran?.dokumen_bukti_bayar && detail.pembayaran.dokumen_bukti_bayar.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#14201C] block">Berkas Bukti Bayar Terlampir:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detail.pembayaran.dokumen_bukti_bayar.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-[#F9FBFA] border border-[#E4EBE8] rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className="w-4 h-4 text-[#0E7C5A] shrink-0" />
                          <span className="font-semibold text-[#14201C] truncate">{doc.nama}</span>
                          <span className="text-[#8A9A95] text-[11px] shrink-0">({doc.ukuran})</span>
                        </div>
                        {onViewDokumen && (
                          <button
                            type="button"
                            onClick={() => onViewDokumen({ id: doc.id, tipe: 'Bukti Bayar', nama: doc.nama, ukuran: doc.ukuran, url: doc.url })}
                            className="px-2.5 py-1 text-xs font-semibold text-[#0E7C5A] hover:bg-[#EEF5F2] rounded-lg transition-colors"
                          >
                            Lihat
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleFormSubmitClick} className="space-y-5">
              {/* Field Tanggal Pembayaran */}
              <div className="space-y-1.5 max-w-md">
                <label htmlFor="tanggal_pembayaran" className="block text-xs font-bold text-[#14201C]">
                  Tanggal Pembayaran <span className="text-[#E5484D]">*</span>
                </label>
                <p className="text-[11px] text-[#8A9A95]">Tanggal pembayaran dilakukan kepada vendor</p>
                <input
                  id="tanggal_pembayaran"
                  type="date"
                  value={tanggalPembayaran}
                  onChange={(e) => onTanggalPembayaranChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#14201C] focus:outline-none focus:border-[#0E7C5A] focus:ring-1 focus:ring-[#0E7C5A] transition-colors"
                  required
                />
              </div>

              {/* Field Upload Bukti Pembayaran */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-[#14201C]">
                      Upload Bukti Pembayaran <span className="text-[#E5484D]">*</span>
                    </label>
                    <p className="text-[11px] text-[#8A9A95]">
                      Bukti transfer atau kwitansi pembayaran, bisa lebih dari satu.
                    </p>
                  </div>
                  {buktiBayarFiles.length > 0 && (
                    <span className="text-xs font-semibold text-[#0E7C5A]">
                      {buktiBayarFiles.length} file dipilih
                    </span>
                  )}
                </div>

                {/* Dropzone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#CBD5E1] hover:border-[#0E7C5A] rounded-2xl p-6 text-center cursor-pointer bg-[#F8FAFC] hover:bg-[#F0FDF4]/30 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-[#14201C]">
                      <span className="font-bold text-[#0E7C5A] hover:underline">Klik untuk upload</span> atau drag & drop
                    </p>
                    <p className="text-[11px] text-[#8A9A95]">
                      JPG, PNG, atau PDF &bull; maksimal 10 MB per file
                    </p>
                  </div>
                </div>

                {/* Upload Queue */}
                {buktiBayarFiles.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider block">
                      Antrean Upload ({buktiBayarFiles.length} Siap)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {buktiBayarFiles.map((file, idx) => {
                        const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
                        return (
                          <div
                            key={idx}
                            className="bg-[#F9FBFA] border border-[#E4EBE8] rounded-xl p-3 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E2E8F0] text-[#475569]">
                                {ext}
                              </span>
                              <div className="truncate">
                                <span className="font-semibold text-[#14201C] block truncate">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-[#8A9A95]">
                                  {formatFileSize(file.size)}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveBuktiBayar(idx)}
                              className="text-[#8A9A95] hover:text-[#E5484D] p-1 transition-colors cursor-pointer"
                              title="Hapus file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Notice & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#F0F4F2]">
                <div className="flex items-center gap-2 text-[11px] text-[#5F6F6A]">
                  <Info className="w-4 h-4 text-[#8A9A95] shrink-0" />
                  <span>Pastikan bukti pembayaran sudah benar dan terbaca jelas sebelum dikirim.</span>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold text-[#5F6F6A] bg-white border border-[#E2E8F0] hover:bg-[#F9FBFA] rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || buktiBayarFiles.length === 0 || !tanggalPembayaran}
                    className="px-6 py-2 text-xs font-semibold text-white bg-[#0E7C5A] hover:bg-[#0A5C43] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <span>Kirim</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <KonfirmasiPembayaranModal
        isOpen={confirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={() => {
          handleCloseConfirm();
          onSubmitBuktiBayar();
        }}
        isSubmitting={isSubmitting}
        tanggalPembayaran={tanggalPembayaran}
        totalFiles={buktiBayarFiles.length}
      />

      {/* Document Preview Modal */}
      {previewBlobUrl && (
        <DocumentPreviewModal
          isOpen={Boolean(previewBlobUrl)}
          onClose={onClosePreview || (() => {})}
          filename={previewDocName || 'Pratinjau Dokumen'}
          blobUrl={previewBlobUrl}
        />
      )}
    </AppLayout>
  );
};

export default KeuanganPengadaanShowTemplate;
