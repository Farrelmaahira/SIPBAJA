import type { FC } from 'react';
import { Download, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { formatBytes } from '../../../utils/formatters';
import type { DokumenItem } from '../../../types/dokumen';

export interface DokumenPengadaanCardProps {
  dokumen?: DokumenItem | null;
  previewBlobUrl?: string | null;
  isLoadingPreview?: boolean;
  downloadingDocId?: number | string | null;
  onDownload?: (doc: DokumenItem) => void;
}

export const DokumenPengadaanCard: FC<DokumenPengadaanCardProps> = ({
  dokumen,
  previewBlobUrl,
  isLoadingPreview = false,
  downloadingDocId,
  onDownload,
}) => {
  return (
    <div className="w-full bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] space-y-5">
      <div className="pb-3.5 border-b border-[#F0F4F2] flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#14201C]">Dokumen Pengadaan</h3>
          <p className="text-xs text-[#8A9A95] mt-0.5">
            Pratinjau dokumen pengadaan yang diunggah PPBJ
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8F5EF] text-[#0E7C5A] border border-[#A3D9C3] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C5A] animate-pulse" />
          Live Preview
        </span>
      </div>

      {dokumen ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F4F7F5] border border-[#E4EBE8]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p
                className="text-xs font-bold text-[#14201C] truncate max-w-[220px] sm:max-w-xs md:max-w-md"
                title={dokumen.nama_asli}
              >
                {dokumen.nama_asli}
              </p>
              <p className="text-[11px] text-[#8A9A95] mt-0.5">
                PDF &bull; {formatBytes(dokumen.ukuran_bytes || 0)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {previewBlobUrl && (
              <a
                href={previewBlobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#14201C] hover:bg-[#F8FAF9] shadow-2xs transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#5F6F6A]" />
                <span>Lihat</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => onDownload?.(dokumen)}
              disabled={downloadingDocId === dokumen.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white text-xs font-bold disabled:opacity-50 shadow-2xs transition cursor-pointer"
            >
              {downloadingDocId === dokumen.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Unduh</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#F4F7F5] border border-[#E4EBE8] text-center text-xs text-[#8A9A95]">
          Belum ada berkas dokumen pengadaan yang diunggah PPBJ.
        </div>
      )}

      <div className="rounded-xl border border-[#E4EBE8] overflow-hidden bg-white shadow-xs">
        {isLoadingPreview ? (
          <div className="h-[560px] flex flex-col items-center justify-center gap-3 bg-[#F8FAF9]">
            <Loader2 className="w-8 h-8 text-[#0E7C5A] animate-spin" />
            <p className="text-xs font-semibold text-[#5F6F6A]">
              Memuat pratinjau dokumen pengadaan...
            </p>
          </div>
        ) : previewBlobUrl ? (
          <iframe
            src={`${previewBlobUrl}#toolbar=0&navpanes=0`}
            title={`Pratinjau dokumen ${dokumen?.nama_asli || 'Pengadaan'}`}
            className="w-full h-[640px] border-0"
          />
        ) : (
          <div className="h-[360px] flex flex-col items-center justify-center gap-2 p-6 text-center bg-[#F8FAF9]">
            <FileText className="w-10 h-10 text-[#8A9A95]" />
            <p className="text-sm font-semibold text-[#14201C]">Pratinjau Tidak Tersedia</p>
            <p className="text-xs text-[#8A9A95] max-w-sm">
              Berkas dokumen pengadaan belum dapat dipratinjau secara langsung. Gunakan tombol
              unduh untuk memeriksa dokumen secara offline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DokumenPengadaanCard;
