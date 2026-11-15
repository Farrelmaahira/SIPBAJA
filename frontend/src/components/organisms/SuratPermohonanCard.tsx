import { useState, useEffect, type FC } from 'react';
import { FileText, Eye, Download, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { formatRupiah, formatTanggal } from '../../utils/formatPermohonan';
import type { PermohonanDokumenDetail } from '../../types/permohonan';

export interface SuratPermohonanCardProps {
  dokumen?: PermohonanDokumenDetail | null;
  nomorSurat?: string | null;
  judul?: string | null;
  unitNama?: string | null;
  tanggal?: string | null;
  nominal?: number | string | null;
  ringkasanTujuan?: string | null;
  showLivePreviewInitially?: boolean;
  pdfBlobUrl?: string | null;
  isLoadingPdf?: boolean;
  onView?: () => void;
  onDownload?: () => void;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '8 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${Math.round(kb)} KB`;
}

export const SuratPermohonanCard: FC<SuratPermohonanCardProps> = ({
  dokumen,
  nomorSurat,
  judul,
  unitNama,
  tanggal,
  nominal,
  pdfBlobUrl: externalBlobUrl,
  isLoadingPdf: externalIsLoading,
  onView,
  onDownload,
}) => {
  const [internalBlobUrl, setInternalBlobUrl] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const displayFileName =
    dokumen?.nama_asli ||
    `Surat_Permohonan_${(judul || 'Pengadaan').replace(/\s+/g, '_')}.pdf`;
  const displaySize = formatBytes(dokumen?.ukuran_bytes);
  const downloadUrl = dokumen?.download_url;

  const activeBlobUrl = externalBlobUrl !== undefined ? externalBlobUrl : internalBlobUrl;
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalLoading;

  useEffect(() => {
    if (externalBlobUrl !== undefined || !downloadUrl) {
      return;
    }

    let isSubscribed = true;
    let localBlobUrl: string | null = null;

    async function loadPdfContent() {
      setInternalLoading(true);
      setLoadFailed(false);

      try {
        const endpoint = `${downloadUrl}?disposition=inline`;
        const res = await api.get<Blob>(endpoint, {
          responseType: 'blob',
        });

        if (!isSubscribed) return;

        const blob = new Blob([res.data], { type: 'application/pdf' });
        localBlobUrl = URL.createObjectURL(blob);
        setInternalBlobUrl(localBlobUrl);
      } catch {
        if (isSubscribed) {
          setLoadFailed(true);
        }
      } finally {
        if (isSubscribed) {
          setInternalLoading(false);
        }
      }
    }

    void loadPdfContent();

    return () => {
      isSubscribed = false;
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [externalBlobUrl, downloadUrl]);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleView = () => {
    if (onView) {
      onView();
      return;
    }
    if (activeBlobUrl) {
      window.open(activeBlobUrl, '_blank');
    } else if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <section
      className="bg-white rounded-[24px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] p-6 md:p-8 space-y-5"
      aria-labelledby="surat-permohonan-heading"
    >
      {/* Header Kartu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0F4F2]">
        <div>
          <h2
            id="surat-permohonan-heading"
            className="text-base sm:text-lg font-bold text-[#14201C] tracking-tight"
          >
            Surat Permohonan
          </h2>
          <p className="text-xs text-[#5F6F6A] mt-0.5">
            Pratinjau dokumen yang dilampirkan pemohon
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF6F1] text-[#0E7C5A] self-start sm:self-auto border border-[#C8E6C9]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C5A] animate-pulse" />
          <span>Live Preview</span>
        </div>
      </div>

      {/* Bar Berkas File */}
      <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-[#F9FBFA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0 border border-[#FECDCA]"
            aria-hidden="true"
          >
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-bold text-[#14201C] truncate max-w-xs sm:max-w-sm md:max-w-md"
              title={displayFileName}
            >
              {displayFileName}
            </p>
            <p className="text-xs text-[#8A9A95] mt-0.5 font-medium">
              PDF &bull; {displaySize}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleView}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#E4EBE8] bg-white text-xs font-bold text-[#14201C] hover:bg-[#F4F7F5] transition-colors shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A]"
            aria-label="Lihat dokumen surat permohonan"
          >
            <Eye className="w-4 h-4 text-[#5F6F6A]" />
            <span>Lihat</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#0E7C5A] text-xs font-bold text-white shadow-2xs hover:bg-[#0B6549] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
            aria-label="Unduh berkas surat permohonan"
          >
            <Download className="w-4 h-4 stroke-[2.2]" />
            <span>Unduh</span>
          </button>
        </div>
      </div>

      {/* Frame Bingkai Live Preview */}
      <div className="rounded-2xl border border-[#E4EBE8] bg-[#F3F6F5] p-3 sm:p-5 flex flex-col items-center justify-center min-h-[480px]">
        {isLoading ? (
          <div className="w-full h-[520px] flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-[#E4EBE8]">
            <Loader2 className="w-7 h-7 text-[#0E7C5A] animate-spin" />
            <p className="text-xs font-medium text-[#5F6F6A]">
              Memuat pratinjau isi dokumen...
            </p>
          </div>
        ) : activeBlobUrl && !loadFailed ? (
          <iframe
            src={`${activeBlobUrl}#toolbar=0&navpanes=0`}
            title={`Pratinjau isi ${displayFileName}`}
            className="w-full h-[560px] rounded-xl border border-[#E4EBE8] bg-white shadow-xs"
          />
        ) : (
          /* Fallback Lembar Surat Mockup Ber-Kop Resmi */
          <>
            <div className="bg-white border border-[#E4EBE8] rounded-xl shadow-md max-w-xl w-full p-6 sm:p-8 relative min-h-[440px] flex flex-col justify-between">
              <div>
                {/* Kop Surat Jurusan */}
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
                      {unitNama || 'JURUSAN TEKNIK INFORMATIKA & KOMPUTER'}
                    </p>
                    <p className="text-[10px] text-[#5F6F6A] font-medium leading-none mt-0.5">
                      Pengadaan Barang &amp; Jasa
                    </p>
                  </div>
                </div>

                {/* Garis Pembatas Kop */}
                <div className="border-b-2 border-[#0E7C5A] mt-3.5 mb-4" />

                {/* Metadata Ringkas Berkas Surat */}
                <div className="text-[11px] text-[#5F6F6A] space-y-1 mb-5">
                  <div className="grid grid-cols-[80px_10px_1fr]">
                    <span className="font-medium text-[#8A9A95]">Nomor</span>
                    <span>:</span>
                    <span className="font-semibold text-[#14201C]">{nomorSurat || '111-FFF-111'}</span>
                  </div>
                  <div className="grid grid-cols-[80px_10px_1fr]">
                    <span className="font-medium text-[#8A9A95]">Perihal</span>
                    <span>:</span>
                    <span className="text-[#14201C]">Permohonan {judul || 'Pengadaan Komputer'}</span>
                  </div>
                  <div className="grid grid-cols-[80px_10px_1fr]">
                    <span className="font-medium text-[#8A9A95]">Tanggal</span>
                    <span>:</span>
                    <span className="text-[#14201C]">{formatTanggal(tanggal) || '04 Maret 2027'}</span>
                  </div>
                </div>

                {/* Judul Bagian Surat */}
                <div className="text-center my-4">
                  <h3 className="text-xs font-bold text-[#14201C] uppercase tracking-wider">
                    SURAT PERMOHONAN PENGADAAN
                  </h3>
                </div>

                {/* Teks Isi Surat */}
                <p className="text-[11px] text-[#5F6F6A] leading-relaxed mb-5">
                  Dengan hormat, bersama surat ini kami mengajukan permohonan pengadaan{' '}
                  <strong className="text-[#14201C] font-semibold">{judul || 'komputer'}</strong>{' '}
                  dengan estimasi anggaran sebesar{' '}
                  <strong className="text-[#14201C] font-semibold">{formatRupiah(nominal)}</strong>{' '}
                  untuk menunjang kegiatan akademik.
                </p>

                {/* Representasi Garis Konten Dokumen */}
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
                <p className="text-[10px] text-[#5F6F6A] font-medium">Hormat kami,</p>
                <div className="w-24 h-1.5 bg-[#E4EBE8] rounded mt-8 ml-auto opacity-70" />
              </div>
            </div>

            {/* Indikator Halaman di Bawah Dokumen */}
            <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-[#14201C] text-white text-[11px] font-semibold shadow-md">
              Halaman 1 dari 2
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SuratPermohonanCard;
