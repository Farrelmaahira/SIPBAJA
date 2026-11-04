import type { FC } from 'react';
import { FileText, Eye, Pencil, Loader2 } from 'lucide-react';

export interface RkaklActiveCardProps {
  filename: string;
  version: number | string;
  statusText?: string;
  isLoading?: boolean;
  onOpenReplaceModal: () => void;
  onOpenFullPreview: () => void;
}

export const RkaklActiveCard: FC<RkaklActiveCardProps> = ({
  filename,
  version,
  statusText = 'Aktif Digunakan',
  isLoading = false,
  onOpenReplaceModal,
  onOpenFullPreview,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-[22px] p-12 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#0E7C5A] animate-spin" />
        <p className="text-xs text-[#5F6F6A] font-medium">Memuat dokumen RKAKL aktif...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F4F2]">
        <div>
          <h2 className="text-base font-bold text-[#14201C]">Dokumen RKAKL Aktif</h2>
          <p className="text-xs text-[#8A9A95] mt-0.5">
            Pratinjau dokumen RKAKL yang dipakai sebagai acuan verifikasi anggaran
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EAF6F1] text-[#0E7C5A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C5A]" />
          Live Preview
        </span>
      </div>

      {/* File Action Bar */}
      <div className="p-3.5 rounded-2xl bg-[#F4F7F5] border border-[#E4EBE8] flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#14201C] truncate" title={filename}>
              {filename}
            </p>
            <p className="text-[11px] text-[#8A9A95]">PDF &bull; Dokumen Acuan Pagu</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenFullPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#14201C] hover:bg-[#F8FAF9] transition-colors cursor-pointer shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#5F6F6A]" />
            <span>Lihat</span>
          </button>
          <button
            type="button"
            onClick={onOpenReplaceModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Ganti</span>
          </button>
        </div>
      </div>

      {/* Simulated Paper Sheet */}
      <div className="rounded-2xl bg-[#EFF3F1] p-5 sm:p-7">
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs min-h-[300px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b-2 border-[#0E7C5A]">
              <div>
                <p className="text-xs font-extrabold text-[#14201C] uppercase tracking-wide">
                  RKA-K/L TAHUN ANGGARAN 2026
                </p>
                <p className="text-[11px] text-[#8A9A95]">Pengadaan Barang &amp; Jasa Politeknik Negeri Jakarta</p>
              </div>
            </div>

            <div className="py-4 space-y-1.5 text-xs text-[#5F6F6A]">
              <p>
                <span className="inline-block w-28 text-[#8A9A95]">Nama Berkas</span>:{' '}
                <strong className="text-[#14201C]">{filename}</strong>
              </p>
              <p>
                <span className="inline-block w-28 text-[#8A9A95]">Versi Dokumen</span>:{' '}
                <strong className="text-[#14201C]">Versi {version}</strong>
              </p>
              <p>
                <span className="inline-block w-28 text-[#8A9A95]">Status Dokumen</span>:{' '}
                <strong className="text-[#0E7C5A]">{statusText}</strong>
              </p>
            </div>

            <p className="text-xs text-[#5F6F6A] leading-relaxed pt-2 border-t border-[#F0F4F2]">
              Dokumen acuan pagu anggaran yang telah disahkan untuk proses verifikasi mata
              anggaran kegiatan (MAK) di lingkungan kampus.
            </p>
          </div>

          <div className="pt-6 flex justify-between items-end text-xs text-[#8A9A95]">
            <span className="px-3 py-1 rounded-full bg-[#14201C] text-white text-[10px] font-bold">
              Dokumen Resmi Terverifikasi
            </span>
            <span className="text-[11px] text-[#8A9A95]">SIPBAJA Digital Archive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RkaklActiveCard;

