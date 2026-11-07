import { useState, useEffect, type FC } from 'react';
import { FileText, Eye, Download, EyeOff, Loader2 } from 'lucide-react';
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
  showLivePreviewInitially = true,
}) => {
  const [showPreview, setShowPreview] = useState(showLivePreviewInitially);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfLoadFailed, setPdfLoadFailed] = useState(false);

  const displayFileName =
    dokumen?.nama_asli ||
    `Surat_Permohonan_${(judul || 'Pengadaan').replace(/\s+/g, '_')}.pdf`;
  const displaySize = formatBytes(dokumen?.ukuran_bytes);
  const downloadUrl = dokumen?.download_url;

  useEffect(() => {
    let isSubscribed = true;
    let localBlobUrl: string | null = null;

    if (!showPreview || !downloadUrl) {
      return;
    }

    async function loadPdfContent() {
      setIsLoadingPdf(true);
      setPdfLoadFailed(false);

      try {
        const endpoint = `${downloadUrl}?disposition=inline`;
        const res = await api.get<Blob>(endpoint, {
          responseType: 'blob',
        });

        if (!isSubscribed) return;

        const blob = new Blob([res.data], { type: 'application/pdf' });
        localBlobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(localBlobUrl);
      } catch {
        if (isSubscribed) {
          setPdfLoadFailed(true);
        }
      } finally {
        if (isSubscribed) {
          setIsLoadingPdf(false);
        }
      }
    }

    loadPdfContent();

    return () => {
      isSubscribed = false;
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [showPreview, downloadUrl]);

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <section
      className="bg-white rounded-[24px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] p-6 md:p-8 space-y-5"
      aria-labelledby="surat-permohonan-title"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="surat-permohonan-title" className="text-lg md:text-xl font-bold text-[#14201C]">
            Surat Permohonan
          </h2>
          <p className="text-xs md:text-sm text-[#5F6F6A] mt-0.5">
            Dokumen yang dilampirkan pemohon
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E] shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#12A06B]" aria-hidden="true" />
          <span>Live Preview</span>
        </span>
      </div>

      {/* File metadata card */}
      <div className="bg-[#F9FBFA] border border-[#E4EBE8] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-11 h-11 rounded-xl bg-[#FDECEC] text-[#E5484D] flex items-center justify-center shrink-0 shadow-xs"
            aria-hidden="true"
          >
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#14201C] truncate" title={displayFileName}>
              {displayFileName}
            </p>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              PDF · {displaySize}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowPreview((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-[#E4EBE8] bg-white text-xs font-semibold text-[#14201C] hover:bg-[#F3F6F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPreview ? 'Tutup' : 'Lihat'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[#0E7C5A] text-xs font-semibold text-white shadow-xs hover:bg-[#0A5C43] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Unduh</span>
          </button>
        </div>
      </div>

      {/* Live Preview Container */}
      {showPreview && (
        <div className="relative rounded-2xl border border-[#E4EBE8] bg-[#F7FAF9] p-4 sm:p-5 shadow-inner overflow-hidden animate-in fade-in duration-200">
          {isLoadingPdf ? (
            <div className="h-[480px] flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-[#E4EBE8]">
              <Loader2 className="w-7 h-7 text-[#0E7C5A] animate-spin" />
              <p className="text-xs font-medium text-[#5F6F6A]">
                Memuat pratinjau isi surat permohonan...
              </p>
            </div>
          ) : pdfBlobUrl && !pdfLoadFailed ? (
            <div className="space-y-3">
              <iframe
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                title={`Pratinjau isi ${displayFileName}`}
                className="w-full h-[520px] rounded-xl border border-[#E4EBE8] bg-white shadow-xs"
              />
              <div className="flex items-center justify-between px-2 text-xs text-[#5F6F6A]">
                <span className="font-medium text-[#14201C] truncate max-w-xs">
                  {displayFileName}
                </span>
                <span className="px-3 py-1 bg-[#14201C] text-white rounded-full text-[10px] font-semibold tracking-wide">
                  Pratinjau Berkas Aktif
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E4EBE8] shadow-sm p-6 sm:p-8 max-w-xl mx-auto space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-[#14201C]">
                <div
                  className="w-10 h-10 rounded-lg bg-[#0E7C5A] text-white flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#14201C] uppercase tracking-wide">
                    {unitNama || 'JURUSAN TEKNIK INFORMATIKA & KOMPUTER'}
                  </p>
                  <p className="text-[11px] text-[#5F6F6A]">
                    Pengadaan Barang & Jasa
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-1.5 text-[#14201C]">
                <div className="flex gap-2">
                  <span className="w-16 text-[#5F6F6A]">Nomor</span>
                  <span>: {nomorSurat || '-'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-16 text-[#5F6F6A]">Perihal</span>
                  <span className="font-semibold">: Permohonan {judul || 'Pengadaan'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-16 text-[#5F6F6A]">Tanggal</span>
                  <span>: {formatTanggal(tanggal)}</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#14201C] underline">
                  SURAT PERMOHONAN PENGADAAN
                </p>
              </div>

              <p className="text-xs text-[#14201C] leading-relaxed">
                Dengan hormat, bersama surat ini kami mengajukan permohonan pengadaan {judul || 'barang'} dengan estimasi anggaran sebesar {formatRupiah(nominal)} untuk menunjang kelancaran operasional dan kegiatan akademik unit kami.
              </p>

              <div className="space-y-2 pt-2">
                <div className="h-2 bg-[#F2F4F7] rounded w-full" />
                <div className="h-2 bg-[#F2F4F7] rounded w-11/12" />
                <div className="h-2 bg-[#F2F4F7] rounded w-4/5" />
              </div>

              <div className="text-center pt-4">
                <span className="inline-block px-3 py-1 bg-[#14201C] text-white rounded-full text-[10px] font-semibold tracking-wide">
                  Halaman 1 dari 2
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SuratPermohonanCard;
