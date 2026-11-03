import type { FC } from 'react';
import { FileText, Eye, Download, Loader2 } from 'lucide-react';
import type { DokumenPermohonanDetail } from '../../types/perencanaan';
import { formatBytes, formatTanggalIndo } from '../../utils/formatters';

export interface PerencanaanDokumenCardProps {
  dokumen?: DokumenPermohonanDetail | null;
  nomorSurat?: string | null;
  judul?: string | null;
  unitNama?: string | null;
  tanggal?: string | null;
  onViewNewTab: () => void;
  onDownload: () => void;
  isViewing?: boolean;
  isDownloading?: boolean;
}

export const PerencanaanDokumenCard: FC<PerencanaanDokumenCardProps> = ({
  dokumen,
  nomorSurat,
  judul,
  unitNama,
  tanggal,
  onViewNewTab,
  onDownload,
  isViewing = false,
  isDownloading = false,
}) => {
  const hasDokumen = Boolean(dokumen?.download_url);
  const displayFileName = dokumen?.nama_asli || 'Tidak ada dokumen terlampir';
  const displayFileSize = dokumen?.ukuran_bytes ? formatBytes(dokumen.ukuran_bytes) : '-';

  return (
    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
      <div className="pb-4 mb-4 border-b border-[#F0F4F2] flex items-center justify-between">
        <h3 className="text-base font-bold text-[#14201C]">Dokumen Permohonan</h3>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EAF6F1] text-[#0E7C5A]">
          Live Preview
        </span>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#F4F7F5] border border-[#E4EBE8] flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#14201C] truncate" title={displayFileName}>
              {displayFileName}
            </p>
            <p className="text-[11px] text-[#8A9A95]">
              {hasDokumen ? `PDF • ${displayFileSize}` : 'Berkas belum diunggah'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onViewNewTab}
            disabled={!hasDokumen || isViewing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#14201C] hover:bg-[#F8FAF9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Buka dokumen di tab baru"
          >
            {isViewing ? (
              <Loader2 className="w-3.5 h-3.5 text-[#0E7C5A] animate-spin" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-[#5F6F6A]" />
            )}
            <span>{isViewing ? 'Memuat...' : 'Lihat'}</span>
          </button>

          <button
            type="button"
            onClick={onDownload}
            disabled={!hasDokumen || isDownloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
            title="Unduh berkas dokumen"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isDownloading ? 'Mengunduh...' : 'Unduh'}</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-[#EFF3F1] p-5 sm:p-7">
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs min-h-[300px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b-2 border-[#0E7C5A]">
              <div>
                <p className="text-xs font-extrabold text-[#14201C] uppercase tracking-wide">
                  {unitNama || '-'}
                </p>
                <p className="text-[11px] text-[#8A9A95]">Pengadaan Barang &amp; Jasa</p>
              </div>
            </div>

            <div className="py-4 space-y-1 text-xs text-[#5F6F6A]">
              <p>
                <span className="inline-block w-16 text-[#8A9A95]">Nomor</span>:{' '}
                <strong className="text-[#14201C]">{nomorSurat || '-'}</strong>
              </p>
              <p>
                <span className="inline-block w-16 text-[#8A9A95]">Perihal</span>:{' '}
                <strong className="text-[#14201C]">{judul || '-'}</strong>
              </p>
              <p>
                <span className="inline-block w-16 text-[#8A9A95]">Tanggal</span>:{' '}
                <strong className="text-[#14201C]">{formatTanggalIndo(tanggal, true)}</strong>
              </p>
            </div>

            <p className="text-xs text-[#5F6F6A] leading-relaxed mb-4">
              Permohonan pengadaan barang dan jasa yang diajukan oleh unit untuk dilakukan
              verifikasi anggaran serta penetapan MAK.
            </p>
          </div>

          <div className="pt-6 flex justify-between items-end text-xs text-[#8A9A95]">
            <span className="px-3.5 py-1 rounded-full bg-[#14201C] text-white text-[11px] font-bold">
              Halaman 1 dari 1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerencanaanDokumenCard;
