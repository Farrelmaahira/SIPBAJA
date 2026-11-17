import { useState, useEffect, type FC } from 'react';
import { FileText, Eye, Download, Loader2 } from 'lucide-react';
import api from '../../services/api';
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
  if (!bytes || bytes <= 0) return '-';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${Math.round(kb)} KB`;
}

export const SuratPermohonanCard: FC<SuratPermohonanCardProps> = ({
  dokumen,
  nomorSurat: _nomorSurat,
  judul,
  unitNama: _unitNama,
  tanggal: _tanggal,
  nominal: _nominal,
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
        ) : loadFailed ? (
          <div className="w-full h-[380px] flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-[#E4EBE8] p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#14201C]">Gagal Memuat Pratinjau Dokumen</p>
            <p className="text-xs text-[#5F6F6A] max-w-sm">
              Pratinjau dokumen tidak dapat ditampilkan secara langsung di peramban. Silakan gunakan tombol lihat atau unduh berkas.
            </p>
            {downloadUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0E7C5A] text-xs font-bold text-white hover:bg-[#0B6549] transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas</span>
              </button>
            )}
          </div>
        ) : (
          <div className="w-full h-[380px] flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-[#E4EBE8] p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#14201C]">Pratinjau Dokumen Tidak Tersedia</p>
            <p className="text-xs text-[#5F6F6A] max-w-sm">
              Berkas lampiran surat belum tersedia atau tidak memiliki pratinjau yang valid.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SuratPermohonanCard;
