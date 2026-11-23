import { useState, type FC } from 'react';
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
  Plus,
  Trash2,
  AlertTriangle,
  Pencil,
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
  BuktiBayarFormItem,
  KeuanganBuktiBayarItem,
} from '../../../types/keuangan';

export interface KeuanganPengadaanShowTemplateProps {
  user?: AppTopbarUser | null;
  detail: KeuanganPengadaanDetail | null;
  isLoading?: boolean;
  isSubmitting?: boolean;
  buktiBayarItems: BuktiBayarFormItem[];
  onAddBuktiBayarItem: () => void;
  onRemoveBuktiBayarItem: (index: number) => void;
  onUpdateBuktiBayarItem: (
    index: number,
    field: 'tanggal_pembayaran' | 'file' | 'existing_file',
    value: string | File | KeuanganBuktiBayarItem | null
  ) => void;
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
  toast?: { type: 'success' | 'error'; message: string } | null;
  onDismissToast?: () => void;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
}

export const KeuanganPengadaanShowTemplate: FC<KeuanganPengadaanShowTemplateProps> = ({
  user,
  detail,
  isLoading = false,
  isSubmitting = false,
  buktiBayarItems,
  onAddBuktiBayarItem,
  onRemoveBuktiBayarItem,
  onUpdateBuktiBayarItem,
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
  toast = null,
  onDismissToast,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
}) => {
  const [internalConfirmOpen, setInternalConfirmOpen] = useState(false);
  const confirmOpen = isConfirmOpen !== undefined ? isConfirmOpen : internalConfirmOpen;
  const handleOpenConfirm = onOpenConfirm || (() => setInternalConfirmOpen(true));
  const handleCloseConfirm = onCloseConfirm || (() => setInternalConfirmOpen(false));
  const [formError, setFormError] = useState<string | null>(null);

  const isSelesai = detail?.status === 'selesai' || detail?.pembayaran?.status === 'selesai';

  const handleFormSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (buktiBayarItems.length === 0) {
      setFormError('Silakan tambahkan minimal satu bukti pembayaran.');
      return;
    }
    const hasEmptyDate = buktiBayarItems.some((item) => !item.tanggal_pembayaran);
    if (hasEmptyDate) {
      setFormError('Silakan lengkapi tanggal pembayaran untuk semua bukti pembayaran.');
      return;
    }
    const hasEmptyFile = buktiBayarItems.some((item) => !item.file && !item.existing_file);
    if (hasEmptyFile) {
      setFormError('Silakan unggah berkas bukti pembayaran untuk semua formulir yang ditambahkan.');
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

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {isSelesai && !isEditing && onStartEdit && (
              <button
                type="button"
                onClick={onStartEdit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#0E7C5A] hover:bg-[#F0FDF4] text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          </div>
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

            {/* Jenis MAK dari Perencanaan (1 MAK yang Digunakan) */}
            {detail?.jenis_mak && detail.jenis_mak.length > 0 && (
              <div className="pt-5 border-t border-[#F0F4F2] space-y-2.5">
                <span className="text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider block">
                  Jenis MAK yang Digunakan (Perencanaan)
                </span>
                {(() => {
                  const mak = detail.jenis_mak[0];
                  return (
                    <div className="bg-[#FAFCFB] border border-[#D1E7DD] rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#16A34A]">
                              MAK {mak.kode}
                            </span>
                            <span className="font-bold text-xs text-[#14201C] truncate" title={mak.nama}>
                              {mak.nama}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#5F6F6A] block">
                            Penanggung Jawab MAK: <strong className="text-[#14201C]">{mak.penanggung_jawab}</strong>
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#0E7C5A] bg-[#EEF5F2] px-3 py-1 rounded-full shrink-0">
                        Terverifikasi Perencanaan
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}
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

        {(() => {
          const allDocs = detail?.dokumen_diterima || [];

          // 1. Dokumen Permohonan (Surat Permohonan, Memo Permohonan Bidang 2, Memo Permohonan PPK)
          const permohonanDocs = allDocs.filter(
            (d) => d.kategori === 'permohonan' || d.tipe.toLowerCase().includes('permohonan')
          );

          // 2. Dokumen Pengadaan (Dokumen Pengadaan, status Verifikasi PP dan PPK)
          const pengadaanDocs = allDocs.filter(
            (d) =>
              d.kategori === 'pengadaan' ||
              (d.tipe.toLowerCase().includes('pengadaan') && !d.tipe.toLowerCase().includes('penerimaan'))
          );

          // 3. Dokumen Pembelian (Surat Kontrak, SPK, Kwitansi, Invoice, Surat Pembelian) - hanya yg diunggah PPBJ
          const pembelianDocs = allDocs.filter(
            (d) =>
              d.kategori === 'pembelian' ||
              d.tipe.toLowerCase().includes('kontrak') ||
              d.tipe.toLowerCase().includes('spk') ||
              d.tipe.toLowerCase().includes('kwitansi') ||
              d.tipe.toLowerCase().includes('invoice') ||
              d.tipe.toLowerCase().includes('surat pembelian')
          );

          // 4. Dokumen Pembayaran (Dokumen Pembayaran, Memo Persetujuan Bidang 2, Memo Persetujuan PPK)
          const pembayaranDocs = allDocs.filter(
            (d) =>
              d.kategori === 'pembayaran' ||
              (d.tipe.toLowerCase().includes('persetujuan') && !d.tipe.toLowerCase().includes('permohonan')) ||
              (d.tipe.toLowerCase().includes('pembayaran') && !d.tipe.toLowerCase().includes('bukti'))
          );

          // 5. Dokumen Vendor (Dokumen Legalitas Vendor dari PPBJ)
          const vendorDocs = allDocs.filter(
            (d) =>
              d.kategori === 'vendor' ||
              d.tipe.toLowerCase().includes('legalitas') ||
              d.tipe.toLowerCase().includes('vendor')
          );

          const renderDocCard = (doc: KeuanganDokumenItem) => (
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
                  <div className="overflow-hidden min-w-0 flex-1">
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
          );

          return (
            <>
              {/* Card 3: Dokumen Permohonan */}
              <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#14201C]">Dokumen Permohonan</h2>
                    <p className="text-xs text-[#5F6F6A]">
                      Surat Permohonan, Memo Permohonan Bidang 2, dan Memo Permohonan PPK
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#EEF5F2] text-[#0E7C5A]">
                    {permohonanDocs.length} Berkas
                  </span>
                </div>

                {permohonanDocs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permohonanDocs.map(renderDocCard)}
                  </div>
                ) : (
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center text-xs text-[#8A9A95]">
                    Tidak ada dokumen permohonan.
                  </div>
                )}
              </div>

              {/* Card 4: Dokumen Pengadaan (3 Bagian Menyamping: Dokumen Pengadaan, Verifikasi PP, dan Persetujuan PPK) */}
              <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] space-y-5">
                <div>
                  <h2 className="text-base font-bold text-[#14201C]">Dokumen Pengadaan</h2>
                  <p className="text-xs text-[#5F6F6A]">
                    Berkas dokumen pengadaan serta status verifikasi oleh Pejabat Pengadaan (PP) dan persetujuan oleh PPK
                  </p>
                </div>

                {/* 3 Bagian Menyamping */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                  {/* Bagian 1: Berkas Dokumen Pengadaan */}
                  <div className="flex flex-col space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider block">
                        1. Dokumen Pengadaan
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF5F2] text-[#0E7C5A]">
                        {pengadaanDocs.length} Berkas
                      </span>
                    </div>

                    {pengadaanDocs.length > 0 ? (
                      <div className="space-y-3 flex-1 flex flex-col justify-start">
                        {pengadaanDocs.map(renderDocCard)}
                      </div>
                    ) : (
                      <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-center text-xs text-[#8A9A95] flex-1 flex items-center justify-center">
                        Tidak ada berkas dokumen pengadaan.
                      </div>
                    )}
                  </div>

                  {/* Bagian 2: Verifikasi oleh PP */}
                  <div className="flex flex-col space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider block">
                        2. Verifikasi oleh PP
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                        Terverifikasi
                      </span>
                    </div>

                    <div className="bg-[#FAFCFB] border border-[#D1E7DD] rounded-2xl p-4 flex flex-col justify-between flex-1 space-y-3 hover:border-[#86EFAC] transition-all">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider block">
                              PEJABAT PENGADAAN (PP)
                            </span>
                            <span className="font-bold text-xs text-[#14201C] block truncate">
                              {detail?.informasi_pengadaan?.verifikasi_pp || 'Diverifikasi oleh PP'}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-[#5F6F6A] leading-relaxed">
                          Dokumen pengadaan telah diverifikasi oleh Pejabat Pengadaan (PP) dan dinyatakan memenuhi syarat.
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-[#EEF3F0] flex items-center justify-between text-[11px]">
                        <span className="text-[#8A9A95] font-medium">Status</span>
                        <span className="font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                          Diverifikasi
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bagian 3: Persetujuan oleh PPK */}
                  <div className="flex flex-col space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider block">
                        3. Persetujuan oleh PPK
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                        Disetujui
                      </span>
                    </div>

                    <div className="bg-[#FAFCFB] border border-[#D1E7DD] rounded-2xl p-4 flex flex-col justify-between flex-1 space-y-3 hover:border-[#86EFAC] transition-all">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider block">
                              PEJABAT PEMBUAT KOMITMEN (PPK)
                            </span>
                            <span className="font-bold text-xs text-[#14201C] block truncate">
                              {detail?.informasi_pengadaan?.persetujuan_ppk || 'Disetujui oleh PPK'}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-[#5F6F6A] leading-relaxed">
                          Paket pengadaan telah disetujui oleh PPK untuk dapat dilanjutkan ke tahap pembelian barang/jasa.
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-[#EEF3F0] flex items-center justify-between text-[11px]">
                        <span className="text-[#8A9A95] font-medium">Status</span>
                        <span className="font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                          Disetujui
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 5: Dokumen Pembelian (oleh PPBJ) */}
              <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#14201C]">Dokumen Pembelian (oleh PPBJ)</h2>
                    <p className="text-xs text-[#5F6F6A]">
                      Surat Kontrak, SPK, Kwitansi, Invoice, dan Surat Pembelian yang diunggah oleh PPBJ
                    </p>
                  </div>
                  {pembelianDocs.length > 0 && (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#EEF5F2] text-[#0E7C5A]">
                      {pembelianDocs.length} Berkas
                    </span>
                  )}
                </div>

                {pembelianDocs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pembelianDocs.map(renderDocCard)}
                  </div>
                ) : (
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] border-dashed rounded-xl flex items-center justify-center gap-2 text-xs text-[#8A9A95]">
                    <Info className="w-4 h-4 text-[#8A9A95]" />
                    <span>Belum ada dokumen pembelian yang diunggah oleh PPBJ.</span>
                  </div>
                )}
              </div>

              {/* Card 6: Dokumen Pembayaran */}
              <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#14201C]">Dokumen Pembayaran</h2>
                    <p className="text-xs text-[#5F6F6A]">
                      Dokumen Pembayaran, Memo Persetujuan Bidang 2, dan Memo Persetujuan PPK
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#EEF5F2] text-[#0E7C5A]">
                    {pembayaranDocs.length} Berkas
                  </span>
                </div>

                {pembayaranDocs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pembayaranDocs.map(renderDocCard)}
                  </div>
                ) : (
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center text-xs text-[#8A9A95]">
                    Tidak ada dokumen pembayaran.
                  </div>
                )}
              </div>

              {/* Card 7: Dokumen Vendor (oleh PPBJ) */}
              <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#14201C]">Dokumen Vendor (Legalitas Vendor oleh PPBJ)</h2>
                    <p className="text-xs text-[#5F6F6A]">
                      Dokumen legalitas vendor yang diunggah oleh PPBJ
                    </p>
                  </div>
                  {vendorDocs.length > 0 && (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#EEF5F2] text-[#0E7C5A]">
                      {vendorDocs.length} Berkas
                    </span>
                  )}
                </div>

                {vendorDocs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendorDocs.map(renderDocCard)}
                  </div>
                ) : (
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] border-dashed rounded-xl flex items-center justify-center gap-2 text-xs text-[#8A9A95]">
                    <Info className="w-4 h-4 text-[#8A9A95]" />
                    <span>Belum ada dokumen legalitas vendor yang diunggah oleh PPBJ.</span>
                  </div>
                )}
              </div>
            </>
          );
        })()}

        {/* Card 4: Form Bukti Pembayaran */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#14201C]">Form Bukti Pembayaran</h2>
              <p className="text-xs text-[#5F6F6A]">
                {isEditing
                  ? 'Perbarui tanggal pembayaran atau ubah/tambahkan berkas bukti pembayaran'
                  : 'Lengkapi tanggal pembayaran dan unggah bukti pembayaran'}
              </p>
            </div>
            {isSelesai && !isEditing ? (
              onStartEdit && (
                <button
                  type="button"
                  onClick={onStartEdit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#CBD5E1] hover:border-[#0E7C5A] text-[#0E7C5A] hover:bg-[#EEF5F2] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Bukti Pembayaran</span>
                </button>
              )
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#EEF5F2] text-[#0E7C5A] rounded-full self-start sm:self-auto">
                {buktiBayarItems.length} Bukti Pembayaran
              </span>
            )}
          </div>

          {isSelesai && !isEditing ? (
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
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-[#14201C] block">
                    Daftar Bukti Pembayaran Terlampir ({detail.pembayaran.dokumen_bukti_bayar.length} Berkas):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {detail.pembayaran.dokumen_bukti_bayar.map((doc, idx) => {
                      const tglDisplay = doc.tanggal_pembayaran_formatted || doc.tanggal_pembayaran || detail?.pembayaran?.tanggal_pembayaran || '-';
                      const ext = doc.nama.split('.').pop()?.toUpperCase() || 'PDF';

                      return (
                        <div
                          key={doc.id}
                          className="bg-[#F9FBFA] border border-[#E4EBE8] hover:border-[#CBD5E1] rounded-2xl p-4 sm:p-5 transition-all flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#EEF3F0]">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#0E7C5A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <h4 className="text-xs font-bold text-[#14201C]">
                                  Bukti Pembayaran #{idx + 1}
                                </h4>
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] text-[#0B7A4E] bg-[#E4F6EC] border border-[#BDE8D1] px-2.5 py-0.5 rounded-full font-medium shrink-0">
                                <Calendar className="w-3 h-3 text-[#0E7C5A]" />
                                <span>{tglDisplay}</span>
                              </div>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] flex items-center gap-2.5">
                              <span className="px-2 py-1 rounded text-[10px] font-bold bg-[#E2E8F0] text-[#475569] shrink-0">
                                {ext}
                              </span>
                              <div className="truncate flex-1">
                                <span className="font-semibold text-xs text-[#14201C] block truncate" title={doc.nama}>
                                  {doc.nama}
                                </span>
                                <span className="text-[11px] text-[#8A9A95]">
                                  {doc.ukuran}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-[#EEF3F0]">
                            {onViewDokumen && (
                              <button
                                type="button"
                                onClick={() => onViewDokumen({ id: doc.id, tipe: 'Bukti Bayar', nama: doc.nama, ukuran: doc.ukuran, url: doc.url })}
                                className="flex-1 py-1.5 text-xs font-semibold text-[#0E7C5A] bg-[#EEF5F2] hover:bg-[#E4F6EC] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat</span>
                              </button>
                            )}
                            {onDownloadDokumen && (
                              <button
                                type="button"
                                onClick={() => onDownloadDokumen({ id: doc.id, tipe: 'Bukti Bayar', nama: doc.nama, ukuran: doc.ukuran, url: doc.url })}
                                className="flex-1 py-1.5 text-xs font-semibold text-[#5F6F6A] bg-white border border-[#E2E8F0] hover:bg-[#F9FBFA] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Unduh</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleFormSubmitClick} className="space-y-5">
              {isEditing && (
                <div className="p-3.5 bg-[#FEF6EE] border border-[#FDE68A] rounded-2xl flex items-center justify-between text-xs text-[#92400E]">
                  <div className="flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>
                      <strong>Mode Edit Aktif:</strong> Anda dapat memperbarui tanggal pembayaran atau mengganti/menambahkan berkas bukti pembayaran.
                    </span>
                  </div>
                  {onCancelEdit && (
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="text-xs font-semibold text-[#B45309] hover:underline cursor-pointer shrink-0 ml-3"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>
              )}

              {formError && (
                <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-xs text-[#DC2626] flex items-center justify-between">
                  <span>{formError}</span>
                  <button
                    type="button"
                    onClick={() => setFormError(null)}
                    className="p-1 hover:text-black cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Dynamic List Bukti Pembayaran */}
              <div className="space-y-4">
                {buktiBayarItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl border border-[#E4EBE8] bg-[#F9FBFA] hover:border-[#CBD5E1] transition-all space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#EEF3F0]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#0E7C5A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h3 className="text-xs font-bold text-[#14201C]">
                          Bukti Pembayaran #{idx + 1}
                        </h3>
                      </div>
                      {buktiBayarItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveBuktiBayarItem(idx)}
                          className="text-[#E5484D] hover:text-[#C53030] hover:bg-[#FFEBEB] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title={`Hapus Bukti Pembayaran #${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tanggal Pembayaran */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#14201C]">
                          Tanggal Pembayaran <span className="text-[#E5484D]">*</span>
                        </label>
                        <p className="text-[11px] text-[#8A9A95]">
                          Tanggal pembayaran dilakukan kepada vendor
                        </p>
                        <input
                          type="date"
                          value={item.tanggal_pembayaran}
                          onChange={(e) => onUpdateBuktiBayarItem(idx, 'tanggal_pembayaran', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#14201C] focus:outline-none focus:border-[#0E7C5A] focus:ring-1 focus:ring-[#0E7C5A] transition-colors"
                          required
                        />
                      </div>

                      {/* Bukti Pembayaran (File Upload) */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#14201C]">
                          Bukti Pembayaran <span className="text-[#E5484D]">*</span>
                        </label>
                        <p className="text-[11px] text-[#8A9A95]">
                          Unggah bukti transfer atau kwitansi (PDF, JPG, PNG &bull; maks 10 MB)
                        </p>

                        {item.existing_file && !item.file ? (
                          <div className="bg-white border border-[#BDE8D1] rounded-xl p-2.5 flex items-center justify-between min-h-[42px]">
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E4F6EC] text-[#0E7C5A] shrink-0">
                                {item.existing_file.nama.split('.').pop()?.toUpperCase() || 'FILE'}
                              </span>
                              <div className="truncate">
                                <span className="font-semibold text-xs text-[#14201C] block truncate" title={item.existing_file.nama}>
                                  {item.existing_file.nama}
                                </span>
                                <span className="text-[10px] text-[#8A9A95]">
                                  {item.existing_file.ukuran} (Tersimpan)
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => onUpdateBuktiBayarItem(idx, 'existing_file', null)}
                              className="text-[#8A9A95] hover:text-[#E5484D] hover:bg-[#FEE2E2]/50 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                              title="Ganti Berkas Ini"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : item.file ? (
                          <div className="bg-white border border-[#BDE8D1] rounded-xl p-2.5 flex items-center justify-between min-h-[42px]">
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E4F6EC] text-[#0E7C5A] shrink-0">
                                {item.file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                              </span>
                              <div className="truncate">
                                <span className="font-semibold text-xs text-[#14201C] block truncate" title={item.file.name}>
                                  {item.file.name}
                                </span>
                                <span className="text-[10px] text-[#8A9A95]">
                                  {formatFileSize(item.file.size)} (Baru)
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => onUpdateBuktiBayarItem(idx, 'file', null)}
                              className="text-[#8A9A95] hover:text-[#E5484D] hover:bg-[#FEE2E2]/50 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                              title="Hapus / Ganti Berkas"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const dropped = e.dataTransfer.files?.[0];
                              if (dropped) onUpdateBuktiBayarItem(idx, 'file', dropped);
                            }}
                            className="border-2 border-dashed border-[#CBD5E1] hover:border-[#0E7C5A] bg-white hover:bg-[#F0FDF4]/30 rounded-xl p-3 text-center cursor-pointer transition-all flex items-center justify-center gap-2 min-h-[42px]"
                          >
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const selected = e.target.files?.[0];
                                if (selected) onUpdateBuktiBayarItem(idx, 'file', selected);
                              }}
                              className="hidden"
                            />
                            <UploadCloud className="w-4 h-4 text-[#0E7C5A] shrink-0" />
                            <span className="text-xs font-semibold text-[#0E7C5A]">
                              Pilih Berkas Bukti Bayar
                            </span>
                            <span className="text-[11px] text-[#8A9A95] hidden sm:inline">
                              atau drag & drop
                            </span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tombol Tambah Bukti Pembayaran */}
              <button
                type="button"
                onClick={onAddBuktiBayarItem}
                className="w-full py-3.5 border-2 border-dashed border-[#BDE8D1] hover:border-[#0E7C5A] bg-[#F9FBFA] hover:bg-[#E4F6EC]/40 rounded-2xl text-xs font-bold text-[#0E7C5A] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Bukti Pembayaran</span>
              </button>

              {/* Bottom Notice & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#F0F4F2]">
                <div className="flex items-center gap-2 text-[11px] text-[#5F6F6A]">
                  <Info className="w-4 h-4 text-[#8A9A95] shrink-0" />
                  <span>
                    Pastikan seluruh bukti pembayaran ({buktiBayarItems.length} data) sudah benar sebelum {isEditing ? 'disimpan' : 'dikirim'}.
                  </span>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={isEditing ? onCancelEdit : onBack}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold text-[#5F6F6A] bg-white border border-[#E2E8F0] hover:bg-[#F9FBFA] rounded-xl transition-colors cursor-pointer"
                  >
                    {isEditing ? 'Batal Edit' : 'Batal'}
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      buktiBayarItems.length === 0 ||
                      buktiBayarItems.some((item) => !item.tanggal_pembayaran || (!item.file && !item.existing_file))
                    }
                    className="px-6 py-2 text-xs font-semibold text-white bg-[#0E7C5A] hover:bg-[#0A5C43] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{isEditing ? 'Menyimpan...' : 'Mengirim...'}</span>
                      </>
                    ) : (
                      <span>{isEditing ? 'Simpan Perubahan' : 'Kirim'}</span>
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
        tanggalPembayaran={
          buktiBayarItems
            .map((item) => item.tanggal_pembayaran)
            .filter(Boolean)
            .join(', ') || '-'
        }
        totalFiles={buktiBayarItems.filter((item) => item.file !== null).length}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200 max-w-md">
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-[#E4F6EC] border-[#BDE8D1] text-[#0B7A4E]'
                : 'bg-[#FEE2E2] border-[#FCA5A5] text-[#DC2626]'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#0E7C5A] mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 text-[#DC2626] mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">
              <span className="block font-bold mb-0.5">
                {toast.type === 'success' ? 'Berhasil' : 'Perhatian'}
              </span>
              <span>{toast.message}</span>
            </div>
            {onDismissToast && (
              <button
                type="button"
                onClick={onDismissToast}
                className="p-1 rounded-md hover:bg-black/5 transition-colors cursor-pointer text-inherit"
                title="Tutup Notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

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
