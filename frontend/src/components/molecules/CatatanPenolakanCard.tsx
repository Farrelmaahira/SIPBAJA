import type { FC } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import type { CatatanPenolakanData } from '../../types/permohonan';

export interface CatatanPenolakanCardProps {
  catatan?: CatatanPenolakanData | null;
  onRevisi?: () => void;
}

export const CatatanPenolakanCard: FC<CatatanPenolakanCardProps> = ({ catatan, onRevisi }) => {
  if (!catatan) return null;

  return (
    <section
      className="bg-white rounded-[24px] border border-[#FECDCA] shadow-[0_4px_16px_rgba(229,72,77,0.06)] p-6 md:p-8 space-y-5"
      aria-labelledby="catatan-penolakan-title"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-xl bg-[#FEE4E2] text-[#E5484D] flex items-center justify-center shrink-0 shadow-xs"
            aria-hidden="true"
          >
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#E5484D] uppercase tracking-wider">
              CATATAN DARI PEMERIKSA
            </p>
            <h2 id="catatan-penolakan-title" className="text-lg font-bold text-[#14201C] leading-tight">
              Permohonan Ditolak
            </h2>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs text-[#5F6F6A]">
          <p className="font-semibold text-[#14201C]">{catatan.pemeriksa_peran || 'Tim Pemeriksa'}</p>
          <p className="text-[#8A9A95] mt-0.5">
            {catatan.diperiksa_at ? `Diperiksa ${catatan.diperiksa_at}` : 'Pemeriksaan selesai'}
          </p>
        </div>
      </div>

      <div className="bg-[#FFF7F7] border border-[#FECDCA] rounded-2xl p-4 md:p-5 space-y-2">
        <p className="text-xs font-bold text-[#E5484D] tracking-wide">Alasan Penolakan</p>
        <p className="text-xs md:text-sm text-[#14201C] leading-relaxed">
          {catatan.alasan || 'Tidak ada catatan alasan penolakan.'}
        </p>
      </div>

      {onRevisi && (
        <div>
          <button
            type="button"
            onClick={onRevisi}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0E7C5A] text-white text-sm font-semibold hover:bg-[#0A5C43] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.2]" />
            <span>Perbaiki & Ajukan Ulang</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default CatatanPenolakanCard;

