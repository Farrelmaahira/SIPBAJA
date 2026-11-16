import type { FC } from 'react';
import { Eye, XCircle, CheckCircle2, Download } from 'lucide-react';
import type { RkaklAktifInfo, KeputusanBidang2Data } from '../../../types/bidang2';

export interface KeputusanBidang2CardProps {
  rkakl: RkaklAktifInfo;
  onOpenRkakl: () => void;
  onOpenTolakModal: () => void;
  onOpenSetujuModal: () => void;
  status: string;
  keputusan?: KeputusanBidang2Data | null;
}

export const KeputusanBidang2Card: FC<KeputusanBidang2CardProps> = ({
  rkakl,
  onOpenRkakl,
  onOpenTolakModal,
  onOpenSetujuModal,
  status,
  keputusan,
}) => {
  const isApproved = status === 'disetujui' || keputusan?.keputusan === 'disetujui';
  const isRejected = status === 'ditolak' || keputusan?.keputusan === 'ditolak';

  return (
    <section
      className="bg-white rounded-[24px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] p-6 md:p-8 space-y-5"
      aria-labelledby="keputusan-bidang2-title"
    >
      <div>
        <h2 id="keputusan-bidang2-title" className="text-lg font-bold text-[#14201C]">
          Keputusan Bidang 2
        </h2>
        <p className="text-xs text-[#5F6F6A] mt-0.5">
          Tinjau dokumen RKAKL, lalu setujui atau tolak
        </p>
      </div>

      {/* Tombol Buka Dokumen RKAKL */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={onOpenRkakl}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-[#E4EBE8] bg-white text-xs md:text-sm font-semibold text-[#14201C] hover:bg-[#F3F6F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer shadow-2xs"
        >
          <Eye className="w-4 h-4 text-[#5F6F6A]" />
          <span>Buka Dokumen RKAKL</span>
        </button>
        <p className="text-[11px] text-[#8A9A95] text-left">
          Versi terbaru: Versi {rkakl.versi} · diperbarui {rkakl.updated_at}
        </p>
      </div>

      {/* Jika sudah diputuskan: Tampilkan Banner Keputusan */}
      {isApproved && (
        <div className="p-4 rounded-2xl bg-[#E4F6EC] border border-[#A3D9C9] text-[#0B7A4E] space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#12A06B]" />
            <span className="text-xs md:text-sm font-bold">
              Permohonan ini telah disetujui oleh Bidang 2
            </span>
          </div>
          {keputusan?.memo && (
            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="truncate max-w-[200px]">{keputusan.memo.nama_asli}</span>
              <a
                href={keputusan.memo.download_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#0B7A4E] hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Memo</span>
              </a>
            </div>
          )}
        </div>
      )}

      {isRejected && (
        <div className="p-4 rounded-2xl bg-[#FFF0ED] border border-[#FDA29B] text-[#D92D20] space-y-1.5">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs md:text-sm font-bold">
              Permohonan ini telah ditolak oleh Bidang 2
            </span>
          </div>
          {keputusan?.alasan && (
            <p className="text-xs text-[#14201C] leading-relaxed pt-1">
              Alasan: {keputusan.alasan}
            </p>
          )}
        </div>
      )}

      {/* Jika belum diputuskan: Tampilkan Tombol Keputusan */}
      {!isApproved && !isRejected && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onOpenTolakModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-[#FDA29B] bg-[#FFF0ED] text-xs md:text-sm font-semibold text-[#D92D20] hover:bg-[#FEE4E2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92D20] cursor-pointer"
          >
            <XCircle className="w-4 h-4 stroke-[2.2]" />
            <span>Tolak Permohonan</span>
          </button>

          <button
            type="button"
            onClick={onOpenSetujuModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#0E7C5A] text-xs md:text-sm font-semibold text-white hover:bg-[#0A5C43] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
            <span>Setujui Permohonan</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default KeputusanBidang2Card;
