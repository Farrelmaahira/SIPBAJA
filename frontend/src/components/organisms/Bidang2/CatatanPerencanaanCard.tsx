import type { FC } from 'react';
import type { CatatanPerencanaanData } from '../../../types/bidang2';

export interface CatatanPerencanaanCardProps {
  catatan: CatatanPerencanaanData;
}

export const CatatanPerencanaanCard: FC<CatatanPerencanaanCardProps> = ({ catatan }) => {
  return (
    <section
      className="bg-white rounded-[24px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] p-6 md:p-8 space-y-4"
      aria-labelledby="catatan-perencanaan-title"
    >
      <div>
        <h2 id="catatan-perencanaan-title" className="text-lg font-bold text-[#14201C]">
          Catatan dari Perencanaan
        </h2>
        <p className="text-xs text-[#5F6F6A] mt-0.5">
          Masukan Tim Perencanaan untuk permohonan ini
        </p>
      </div>

      <div className="bg-[#F9FBFA] border border-[#E4EBE8] rounded-2xl p-4 md:p-5 space-y-2">
        <p className="text-xs font-semibold text-[#5F6F6A]">
          {catatan.pemeriksa_peran || 'Tim Perencanaan'}
          {catatan.tanggal ? ` · ${catatan.tanggal}` : ''}
        </p>
        <p className="text-xs md:text-sm text-[#14201C] leading-relaxed">
          {catatan.catatan}
        </p>
      </div>
    </section>
  );
};

export default CatatanPerencanaanCard;

