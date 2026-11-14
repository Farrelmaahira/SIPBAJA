import type { FC } from 'react';
import { Tag, User } from 'lucide-react';
import type {
  CatatanPerencanaanData,
  Bidang2PermohonanMakItem,
} from '../../../types/bidang2';

export interface CatatanPerencanaanCardProps {
  catatan: CatatanPerencanaanData;
  makList?: Bidang2PermohonanMakItem[];
}

export const CatatanPerencanaanCard: FC<CatatanPerencanaanCardProps> = ({
  catatan,
  makList,
}) => {
  const primaryMak = makList && makList.length > 0 ? makList[0] : null;
  const kodeMak = primaryMak?.kode || '532111';
  const namaMak = primaryMak?.nama || 'Belanja Modal Peralatan dan Mesin';
  const ppkNama = primaryMak?.ppk_nama || 'Budi Santoso';

  const tanggalCatatan = catatan.tanggal || '05 Maret 2027, 09:30';
  const headerCatatan = `${catatan.pemeriksa_peran || 'Tim Perencanaan'} · ${tanggalCatatan}`;
  const isiCatatan =
    catatan.catatan ||
    `Jenis MAK ${kodeMak} telah diverifikasi. Mohon periksa kesesuaian nominal dengan Dokumen RKAKL terbaru sebelum memberi keputusan.`;

  return (
    <section
      className="bg-white rounded-[24px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] p-6 md:p-8 space-y-5"
      aria-labelledby="jenis-mak-catatan-title"
    >
      <div>
        <h2
          id="jenis-mak-catatan-title"
          className="text-base sm:text-lg font-bold text-[#14201C]"
        >
          Jenis MAK &amp; Catatan Perencanaan
        </h2>
        <p className="text-xs text-[#5F6F6A] mt-0.5">
          Jenis MAK dan masukan Tim Perencanaan untuk permohonan ini
        </p>
      </div>

      {/* Box 1: Jenis MAK dari Perencanaan */}
      <div className="bg-[#EAF6F1] border border-[#C8E6C9] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div
          className="w-10 h-10 rounded-full bg-white text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9] shadow-2xs mt-0.5"
          aria-hidden="true"
        >
          <Tag className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-[#5F6F6A]">
            Jenis MAK dari Perencanaan
          </p>
          <h3 className="text-sm font-bold text-[#14201C] mt-0.5 break-words">
            {kodeMak} · {namaMak}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-[#5F6F6A] font-medium mt-1.5">
            <User className="w-3.5 h-3.5 text-[#0E7C5A] shrink-0" />
            <span className="truncate">
              Penanggung Jawab MAK: <strong className="text-[#14201C]">{ppkNama}</strong> · PPK
            </span>
          </div>
        </div>
      </div>

      {/* Box 2: Catatan Tim Perencanaan */}
      <div className="bg-[#F9FBFA] border border-[#E4EBE8] rounded-2xl p-4 sm:p-5 space-y-2">
        <p className="text-xs font-semibold text-[#5F6F6A]">
          {headerCatatan}
        </p>
        <p className="text-xs sm:text-sm text-[#14201C] leading-relaxed">
          {isiCatatan}
        </p>
      </div>
    </section>
  );
};

export default CatatanPerencanaanCard;
