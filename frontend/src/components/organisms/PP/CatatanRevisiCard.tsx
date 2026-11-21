import type { FC } from 'react';
import { XCircle } from 'lucide-react';

export interface CatatanRevisiCardProps {
  actor: string;
  tanggal?: string | null;
  alasan: string;
}

export const CatatanRevisiCard: FC<CatatanRevisiCardProps> = ({ actor, tanggal, alasan }) => {
  return (
    <div className="bg-[#FEF3F2] rounded-[16px] p-6 border border-[#FECDCA] shadow-xs">
      <div className="flex items-start gap-3.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
          <XCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#B42318]">Catatan Revisi</h3>
          <p className="text-xs text-[#8A9A95] mt-0.5">
            Ditolak oleh {actor}
            {tanggal ? ` · ${tanggal}` : ''}
          </p>
        </div>
      </div>

      <div className="bg-white/80 rounded-xl p-4 border border-[#FECDCA]/60">
        <span className="text-[10px] font-extrabold tracking-wider text-[#B42318] uppercase block mb-1">
          ALASAN PENOLAKAN
        </span>
        <p className="text-xs text-[#344054] leading-relaxed font-medium">{alasan}</p>
      </div>
    </div>
  );
};

export default CatatanRevisiCard;
