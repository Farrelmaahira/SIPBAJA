import { useState, type FC, type ChangeEvent } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Lock,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { PpbjPembayaranContext, PpbjDokumenItem } from '@/types/ppbj';
import type { DokumenItem } from '@/types/dokumen';
import { DokumenListCard } from '@/components/organisms/DokumenListCard';
import { formatRupiah, formatTanggalIndo } from '@/utils/formatters';

export interface PpbjPembayaranSectionProps {
  pengadaanId: number | string;
  context: PpbjPembayaranContext | null;
  isLoading: boolean;
  onUploadTagihan: (file: File, nominal?: number, catatan?: string) => Promise<void>;
  onUploadLegalitas: (file: File) => Promise<void>;
  onViewDokumen: (doc: PpbjDokumenItem) => void;
  onDownloadDokumen?: (doc: PpbjDokumenItem) => void;
  previewBlobUrl?: string | null;
  previewDocId?: number | string | null;
  isLoadingPreview?: boolean;
}

export const PpbjPembayaranSection: FC<PpbjPembayaranSectionProps> = ({
  context,
  isLoading,
  onUploadTagihan,
  onUploadLegalitas,
  onViewDokumen,
  onDownloadDokumen,
  previewBlobUrl,
  previewDocId,
  isLoadingPreview,
}) => {
  const [tagihanFile, setTagihanFile] = useState<File | null>(null);
  const [nominalTagihan, setNominalTagihan] = useState<string>('');
  const [catatanTagihan, setCatatanTagihan] = useState<string>('');
  const [isUploadingTagihan, setIsUploadingTagihan] = useState<boolean>(false);

  const [legalitasFile, setLegalitasFile] = useState<File | null>(null);
  const [isUploadingLegalitas, setIsUploadingLegalitas] = useState<boolean>(false);

  const [selectedImage, setSelectedImage] = useState<PpbjDokumenItem | null>(null);
  const [isFotoDrawerOpen, setIsFotoDrawerOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-[#E4EBE8] shadow-[0_4px_24px_rgba(13,51,38,0.04)] flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#0E7C5A]" />
        <span className="ml-3 text-xs font-semibold text-[#5F6F6A]">Memuat data pembayaran & penerimaan...</span>
      </div>
    );
  }

  if (!context) return null;

  const {
    penerimaan,
    pembayaran,
    dokumen_tagihan,
    approvals,
    can_upload_tagihan,
    can_upload_legalitas,
    dokumen_legalitas,
    is_locked,
  } = context;

  const handleTagihanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagihanFile) return;
    setIsUploadingTagihan(true);
    try {
      const numNominal = nominalTagihan ? parseFloat(nominalTagihan) : undefined;
      await onUploadTagihan(tagihanFile, numNominal, catatanTagihan);
      setTagihanFile(null);
      setCatatanTagihan('');
    } finally {
      setIsUploadingTagihan(false);
    }
  };

  const handleLegalitasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalitasFile) return;
    setIsUploadingLegalitas(true);
    try {
      await onUploadLegalitas(legalitasFile);
      setLegalitasFile(null);
    } finally {
      setIsUploadingLegalitas(false);
    }
  };

  const bastDokumenList: DokumenItem[] = penerimaan?.bast_dokumen
    ? [
        {
          id: penerimaan.bast_dokumen.id,
          nama_asli: penerimaan.bast_dokumen.nama_asli,
          tipe_dokumen: 'bast',
          ukuran_bytes: penerimaan.bast_dokumen.ukuran_bytes,
          mime_type: penerimaan.bast_dokumen.mime_type,
          download_url: penerimaan.bast_dokumen.url,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* 1. KARTU BUKTI PENERIMAAN BARANG PERLENGKAPAN (FR-40) */}
      <section className="bg-white rounded-3xl p-6 border border-[#E4EBE8] shadow-[0_4px_24px_rgba(13,51,38,0.04)]">
        <div className="pb-4 mb-5 border-b border-[#F0F4F2] flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-[#14201C]">
              Bukti Penerimaan Barang (Perlengkapan)
            </h2>
            <p className="text-xs text-[#5F6F6A] mt-0.5">
              Acuan verifikasi barang fisik dari bagian Perlengkapan untuk penyusunan tagihan
            </p>
          </div>
          {penerimaan ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E] border border-[#BDE8D1]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Barang Telah Diterima ({penerimaan.tanggal_terima ? formatTanggalIndo(penerimaan.tanggal_terima) : 'Tercatat'})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
              <Clock className="w-3.5 h-3.5" />
              Menunggu Penerimaan Perlengkapan
            </span>
          )}
        </div>

        {penerimaan ? (
          <div className="space-y-5">
            {/* Surat Tanda Terima / BAST menggunakan DokumenListCard */}
            <div>
              <DokumenListCard
                title="Dokumen Berita Acara Serah Terima (BAST)"
                dokumenList={bastDokumenList}
                emptyTitle="Belum ada berkas BAST"
                emptyDescription="Bagian Perlengkapan belum mengunggah dokumen BAST untuk paket pengadaan ini."
                onViewNewTab={() => {
                  if (penerimaan.bast_dokumen) {
                    onViewDokumen(penerimaan.bast_dokumen);
                  }
                }}
                onDownload={() => {
                  if (onDownloadDokumen && penerimaan.bast_dokumen) {
                    onDownloadDokumen(penerimaan.bast_dokumen);
                  }
                }}
                previewBlobUrl={previewBlobUrl}
                previewDocId={previewDocId}
                isLoadingPreview={isLoadingPreview}
              />
            </div>

            {/* Dokumentasi Foto Fisik Barang dengan Horizontal Collapsible Drawer */}
            <div className="rounded-2xl border border-[#E4EBE8] bg-[#F9FBFA] overflow-hidden">
              <button
                type="button"
                onClick={() => setIsFotoDrawerOpen((prev) => !prev)}
                className="w-full p-4 flex items-center justify-between bg-white hover:bg-[#F8FAF9] transition-colors cursor-pointer text-left select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[#14201C]">
                        Dokumentasi Foto Fisik Barang
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4F7F5] text-[#5F6F6A]">
                        {penerimaan.foto_barang.length} Foto
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8A9A95] mt-0.5">
                      Klik untuk {isFotoDrawerOpen ? 'menutup' : 'melihat'} galeri foto dokumentasi fisik dari Perlengkapan
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0E7C5A] hidden sm:inline">
                    {isFotoDrawerOpen ? 'Sembunyikan' : 'Buka Galeri'}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#F4F7F5] flex items-center justify-center text-[#5F6F6A]">
                    {isFotoDrawerOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#0E7C5A]" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Horizontal Drawer Content */}
              {isFotoDrawerOpen && (
                <div className="p-4 border-t border-[#E4EBE8] bg-[#F9FBFA] transition-all">
                  {penerimaan.foto_barang.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-[#D0DCD7] scrollbar-track-transparent">
                      {penerimaan.foto_barang.map((foto) => (
                        <div
                          key={foto.id}
                          className="group relative shrink-0 w-44 sm:w-52 rounded-2xl overflow-hidden border border-[#E4EBE8] bg-white shadow-xs"
                        >
                          <div className="relative aspect-4/3 w-full bg-[#F4F7F5] overflow-hidden">
                            <img
                              src={foto.url}
                              alt={foto.nama_asli}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedImage(foto)}
                                className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-xs font-bold text-[#14201C] shadow-sm cursor-pointer flex items-center gap-1"
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-[#0E7C5A]" />
                                Perbesar
                              </button>
                            </div>
                          </div>
                          <div className="p-2.5 bg-white">
                            <p className="text-xs font-semibold text-[#14201C] truncate" title={foto.nama_asli}>
                              {foto.nama_asli}
                            </p>
                            <p className="text-[10px] text-[#8A9A95] mt-0.5">
                              {(foto.ukuran_bytes / 1024).toFixed(0)} KB &bull; Foto Barang
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-[#8A9A95] italic">
                      Tidak ada foto dokumentasi fisik yang diunggah oleh bagian Perlengkapan.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E4EBE8] text-xs text-[#5F6F6A]">
            Bagian Perlengkapan belum mengunggah dokumen BAST dan dokumentasi foto fisik untuk paket ini.
          </div>
        )}
      </section>

      {/* 2. KARTU DOKUMEN TAGIHAN & STATUS DUAL APPROVAL (FR-41, FR-42) */}
      <section className="bg-white rounded-3xl p-6 border border-[#E4EBE8] shadow-[0_4px_24px_rgba(13,51,38,0.04)]">
        <div className="pb-4 mb-5 border-b border-[#F0F4F2] flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-[#14201C]">
              Dokumen Pembayaran & Tagihan Termin (PPBJ)
            </h2>
            <p className="text-xs text-[#5F6F6A] mt-0.5">
              Unggah draf tagihan/invoice untuk diverifikasi oleh PPK dan Bidang 2
            </p>
          </div>
          {pembayaran && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                pembayaran.status === 'disetujui' || pembayaran.status === 'siap_bayar' || pembayaran.status === 'selesai'
                  ? 'bg-[#E4F6EC] text-[#0B7A4E] border border-[#BDE8D1]'
                  : pembayaran.status === 'perlu_revisi'
                  ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]'
                  : 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
              }`}
            >
              {pembayaran.status.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Existing Dokumen Tagihan Info */}
        {dokumen_tagihan && (
          <div className="mb-5 p-4 rounded-2xl bg-[#F8FAF9] border border-[#E4EBE8]">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF7F2] text-[#0E7C5A] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#14201C]">{dokumen_tagihan.nama_asli}</p>
                  <p className="text-[11px] text-[#5F6F6A]">
                    Nominal: <span className="font-semibold text-[#14201C]">{formatRupiah(pembayaran?.nominal || 0)}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onViewDokumen(dokumen_tagihan)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#0E7C5A] hover:bg-[#F4F7F5] transition-colors cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-4 h-4" />
                Pratinjau Tagihan
              </button>
            </div>
          </div>
        )}

        {/* Status Dual Approval PPK & Bidang 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* PPK Approval Box */}
          <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-[#FAFCFA]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#14201C]">Review PPK</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  approvals.ppk?.keputusan === 'disetujui'
                    ? 'bg-[#E4F6EC] text-[#0B7A4E]'
                    : approvals.ppk?.keputusan === 'ditolak'
                    ? 'bg-[#FEE2E2] text-[#991B1B]'
                    : 'bg-[#FEF3C7] text-[#B45309]'
                }`}
              >
                {approvals.ppk?.keputusan || 'Menunggu Review'}
              </span>
            </div>
            {approvals.ppk?.memo ? (
              <button
                type="button"
                onClick={() => onViewDokumen(approvals.ppk!.memo!)}
                className="text-xs font-semibold text-[#0E7C5A] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Memo Persetujuan PPK (Tersedia)
              </button>
            ) : (
              <p className="text-[11px] text-[#8A9A95] mt-1">Memo persetujuan belum diunggah PPK.</p>
            )}
          </div>

          {/* Bidang 2 Approval Box */}
          <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-[#FAFCFA]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#14201C]">Review Bidang 2 (WD2)</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  approvals.bidang2?.keputusan === 'disetujui'
                    ? 'bg-[#E4F6EC] text-[#0B7A4E]'
                    : approvals.bidang2?.keputusan === 'ditolak'
                    ? 'bg-[#FEE2E2] text-[#991B1B]'
                    : 'bg-[#FEF3C7] text-[#B45309]'
                }`}
              >
                {approvals.bidang2?.keputusan || 'Menunggu Review'}
              </span>
            </div>
            {approvals.bidang2?.memo ? (
              <button
                type="button"
                onClick={() => onViewDokumen(approvals.bidang2!.memo!)}
                className="text-xs font-semibold text-[#0E7C5A] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Memo Persetujuan WD2 (Tersedia)
              </button>
            ) : (
              <p className="text-[11px] text-[#8A9A95] mt-1">Memo persetujuan belum diunggah WD2.</p>
            )}
          </div>
        </div>

        {/* Upload / Re-upload Tagihan Form */}
        {can_upload_tagihan ? (
          <form onSubmit={handleTagihanSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                  Nominal Tagihan (Opsional)
                </label>
                <input
                  type="number"
                  value={nominalTagihan}
                  onChange={(e) => setNominalTagihan(e.target.value)}
                  placeholder="Contoh: 50000000 (biarkan kosong jika sesuai kontrak)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:ring-2 focus:ring-[#0E7C5A] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                  Unggah Berkas Tagihan (PDF maks 10MB) *
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  required
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files[0]) {
                      setTagihanFile(e.target.files[0]);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs text-[#5F6F6A] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#EBF7F2] file:text-[#0E7C5A] file:cursor-pointer border border-[#E4EBE8] rounded-xl bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                Catatan Pengajuan (Opsional)
              </label>
              <textarea
                value={catatanTagihan}
                onChange={(e) => setCatatanTagihan(e.target.value)}
                rows={2}
                placeholder="Tambahkan catatan khusus untuk verifikator PPK / Bidang 2..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:ring-2 focus:ring-[#0E7C5A] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isUploadingTagihan || !tagihanFile}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0B6549] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isUploadingTagihan ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengunggah Tagihan...
                </>
              ) : dokumen_tagihan ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Unggah Ulang Dokumen Tagihan (Re-upload)
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Kirim Dokumen Tagihan ke PPK & Bidang 2
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E4EBE8] flex items-center gap-2.5 text-xs text-[#5F6F6A]">
            <Lock className="w-4 h-4 text-[#8A9A95] shrink-0" />
            <span>
              {is_locked
                ? 'Dokumen tagihan telah dikunci karena proses pembayaran telah selesai.'
                : 'Dokumen tagihan telah disetujui penuh oleh kedua peninjau (PPK & Bidang 2) dan tidak dapat diubah kembali.'}
            </span>
          </div>
        )}
      </section>

      {/* 3. KARTU DOKUMEN LEGALITAS VENDOR (FR-43, FR-44, FR-45) */}
      <section className="bg-white rounded-3xl p-6 border border-[#E4EBE8] shadow-[0_4px_24px_rgba(13,51,38,0.04)]">
        <div className="pb-4 mb-5 border-b border-[#F0F4F2] flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-[#14201C]">
              Dokumen Legalitas Rekanan Vendor
            </h2>
            <p className="text-xs text-[#5F6F6A] mt-0.5">
              Kelengkapan berkas legalitas rekanan (SIUP, NIB, NPWP, Akta) untuk pencairan dana oleh Keuangan
            </p>
          </div>
          {can_upload_legalitas ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E] border border-[#BDE8D1]">
              Akses Upload Terbuka
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F4F7F5] text-[#8A9A95] border border-[#E4EBE8] flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Terkunci
            </span>
          )}
        </div>

        {/* Existing Dokumen Legalitas */}
        {dokumen_legalitas && (
          <div className="mb-5 p-4 rounded-2xl bg-[#F8FAF9] border border-[#E4EBE8]">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF7F2] text-[#0E7C5A] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#14201C]">{dokumen_legalitas.nama_asli}</p>
                  <p className="text-[11px] text-[#5F6F6A]">
                    {(dokumen_legalitas.ukuran_bytes / 1024).toFixed(0)} KB · Berkas Bundel Legalitas Vendor
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onViewDokumen(dokumen_legalitas)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#0E7C5A] hover:bg-[#F4F7F5] transition-colors cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-4 h-4" />
                Pratinjau Legalitas Vendor
              </button>
            </div>
          </div>
        )}

        {/* Upload form or Locked Message */}
        {can_upload_legalitas ? (
          <form onSubmit={handleLegalitasSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                Pilih Berkas Bundel Legalitas Vendor (PDF maks 10MB) *
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                required
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files && e.target.files[0]) {
                    setLegalitasFile(e.target.files[0]);
                  }
                }}
                className="w-full px-3 py-2 text-xs text-[#5F6F6A] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#EBF7F2] file:text-[#0E7C5A] file:cursor-pointer border border-[#E4EBE8] rounded-xl bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isUploadingLegalitas || !legalitasFile}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0B6549] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isUploadingLegalitas ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengunggah Legalitas...
                </>
              ) : dokumen_legalitas ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Perbarui Dokumen Legalitas Vendor (Re-upload)
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Unggah Dokumen Legalitas Vendor
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E4EBE8] flex items-center gap-3 text-xs text-[#5F6F6A]">
            <Lock className="w-4 h-4 text-[#8A9A95] shrink-0" />
            <span>
              {is_locked
                ? 'Dokumen legalitas vendor terkunci karena bagian Keuangan telah mencairkan dana / mengunggah bukti bayar.'
                : 'Form upload legalitas vendor hanya dapat diakses setelah kedua peninjau (PPK dan Bidang 2) menerbitkan Memo Persetujuan Pembayaran.'}
            </span>
          </div>
        )}
      </section>

      {/* Lightbox Modal Foto Barang */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2] mb-3">
              <h3 className="text-sm font-bold text-[#14201C]">{selectedImage.nama_asli}</h3>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg text-[#5F6F6A] hover:bg-[#F4F7F5] cursor-pointer"
              >
                Tutup
              </button>
            </div>
            <img
              src={selectedImage.url}
              alt={selectedImage.nama_asli}
              className="w-full max-h-[75vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PpbjPembayaranSection;
