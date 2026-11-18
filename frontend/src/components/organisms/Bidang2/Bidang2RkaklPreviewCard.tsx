import type { FC } from 'react';
import { FileText, Eye, Download, Loader2 } from 'lucide-react';
import type { Bidang2RkaklActiveDoc } from '../../../types/bidang2';

export interface Bidang2RkaklPreviewCardProps {
  document: Bidang2RkaklActiveDoc;
  previewBlobUrl?: string | null;
  isLoadingPreview?: boolean;
  onView?: () => void;
  onDownload?: () => void;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const Bidang2RkaklPreviewCard: FC<Bidang2RkaklPreviewCardProps> = ({
  document,
  previewBlobUrl,
  isLoadingPreview = false,
  onView,
  onDownload,
}) => {
  const formattedSize = formatBytes(document.ukuran_bytes || 12582912);
  const tahunAnggaran = document.tahun_anggaran || 2026;
  const nomorDokumen = document.nomor_dokumen || 'RKAKL-2026-003';
  const perihal = document.perihal || 'Rencana Kerja dan Anggaran';
  const tanggal = document.tanggal || '12 Oktober 2026';
  const totalHalaman = document.total_halaman || 24;

  return (
    <section
      className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]"
      aria-labelledby="rkakl-preview-heading"
    >
      {/* Header Kartu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F0F4F2]">
        <div>
          <h2
            id="rkakl-preview-heading"
            className="text-base font-bold text-[#14201C] tracking-tight"
          >
            Dokumen RKAKL Terbaru
          </h2>
          <p className="text-xs text-[#8A9A95] mt-0.5">
            Pratinjau dokumen RKAKL yang berlaku saat ini
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF6F1] text-[#0E7C5A] self-start sm:self-auto border border-[#C8E6C9]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C5A] animate-pulse" />
          <span>Live Preview</span>
        </div>
      </div>

      {/* Kotak Berkas File */}
      <div className="mt-5 p-4 rounded-2xl border border-[#E4EBE8] bg-[#F9FBFA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0 border border-[#FECDCA]">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3
              className="text-sm font-bold text-[#14201C] truncate max-w-xs sm:max-w-sm md:max-w-md"
              title={document.nama_asli}
            >
              {document.nama_asli}
            </h3>
            <p className="text-xs text-[#8A9A95] mt-0.5 font-medium">
              PDF &bull; {formattedSize}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E4EBE8] bg-white text-xs font-bold text-[#14201C] hover:bg-[#F4F7F5] transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A]"
            aria-label="Lihat pratinjau dokumen RKAKL"
          >
            <Eye className="w-4 h-4 text-[#5F6F6A]" />
            <span>Lihat</span>
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E7C5A] text-xs font-bold text-white hover:bg-[#0B6549] transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A]"
            aria-label="Unduh dokumen RKAKL"
          >
            <Download className="w-4 h-4" />
            <span>Unduh</span>
          </button>
        </div>
      </div>

      {/* Area Bingkai Pratinjau Dokumen (Live Preview Frame) */}
      <div className="mt-6 rounded-2xl border border-[#E4EBE8] bg-[#F3F6F5] p-3 sm:p-5 flex flex-col items-center justify-center min-h-[480px]">
        {isLoadingPreview ? (
          <div className="w-full h-[520px] flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-[#E4EBE8]">
            <Loader2 className="w-7 h-7 text-[#0E7C5A] animate-spin" />
            <p className="text-xs font-medium text-[#5F6F6A]">
              Memuat pratinjau isi dokumen...
            </p>
          </div>
        ) : previewBlobUrl ? (
          <iframe
            src={`${previewBlobUrl}#toolbar=0&navpanes=0`}
            title={`Pratinjau isi ${document.nama_asli}`}
            className="w-full h-[560px] rounded-xl border border-[#E4EBE8] bg-white shadow-xs"
          />
        ) : (
          /* Fallback Mockup Dokumen RKAKL */
          <>
            <div className="bg-white border border-[#E4EBE8] rounded-xl shadow-md max-w-xl w-full p-6 sm:p-8 relative min-h-[440px] flex flex-col justify-between">
              <div>
                {/* Kop Dokumen SIPBAJA */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl bg-[#0E7C5A] flex items-center justify-center shrink-0 shadow-xs text-white"
                    aria-hidden="true"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-extrabold text-xs sm:text-sm text-[#14201C] tracking-tight uppercase leading-tight">
                      RKA-K/L TAHUN ANGGARAN {tahunAnggaran}
                    </p>
                    <p className="text-[10px] text-[#5F6F6A] font-medium leading-none mt-0.5">
                      Pengadaan Barang &amp; Jasa
                    </p>
                  </div>
                </div>

                {/* Garis Pembatas Kop */}
                <div className="border-b-2 border-[#0E7C5A] mt-3.5 mb-4" />

                {/* Metadata Ringkas Berkas */}
                <div className="text-[11px] text-[#5F6F6A] space-y-1 mb-5">
                  <div className="grid grid-cols-[80px_10px_1fr]">
                    <span className="font-medium text-[#8A9A95]">Nomor</span>
                    <span>:</span>
                    <span className="font-semibold text-[#14201C]">{nomorDokumen}</span>
                  </div>
                  <div className="grid grid-cols-[80px_10px_1fr]">
                    <span className="font-medium text-[#8A9A95]">Perihal</span>
                    <span>:</span>
                    <span className="text-[#14201C]">{perihal}</span>
                  </div>
                  <div className="grid grid-cols-[80px_10px_1fr]">
                    <span className="font-medium text-[#8A9A95]">Tanggal</span>
                    <span>:</span>
                    <span className="text-[#14201C]">{tanggal}</span>
                  </div>
                </div>

                {/* Judul Bagian Dokumen */}
                <div className="text-center my-4">
                  <h4 className="text-xs font-bold text-[#14201C] uppercase tracking-wider">
                    RENCANA KERJA DAN ANGGARAN K/L
                  </h4>
                </div>

                {/* Deskripsi Acuan */}
                <p className="text-[11px] text-[#5F6F6A] leading-relaxed mb-5">
                  Dokumen ini memuat rincian rencana kerja dan anggaran satuan kerja tahun
                  anggaran {tahunAnggaran} yang menjadi acuan verifikasi anggaran pengadaan.
                </p>

                {/* Garis-garis Representasi Konten Dokumen */}
                <div className="space-y-2.5 opacity-60" aria-hidden="true">
                  <div className="h-2 rounded bg-[#E4EBE8] w-full" />
                  <div className="h-2 rounded bg-[#E4EBE8] w-full" />
                  <div className="h-2 rounded bg-[#E4EBE8] w-3/4" />
                  <div className="h-2 rounded bg-[#E4EBE8] w-full" />
                  <div className="h-2 rounded bg-[#E4EBE8] w-5/6" />
                </div>
              </div>

              {/* Area Tanda Tangan */}
              <div className="mt-8 self-end text-right">
                <p className="text-[10px] text-[#5F6F6A] font-medium">Disahkan oleh,</p>
                <div className="w-24 h-1.5 bg-[#E4EBE8] rounded mt-8 ml-auto opacity-70" />
              </div>
            </div>

            {/* Indikator Halaman di Bawah Dokumen */}
            <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-[#14201C] text-white text-[11px] font-semibold shadow-md">
              Halaman 1 dari {totalHalaman}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Bidang2RkaklPreviewCard;

