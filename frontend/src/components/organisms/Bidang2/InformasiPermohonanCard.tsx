import type { FC } from 'react';
import { Hash, Calendar, Banknote, Activity } from 'lucide-react';
import StatusPill from '../../atoms/StatusPill';
import { formatRupiah } from '../../../utils/formatPermohonan';
import type { Bidang2DetailPengajuan } from '../../../types/bidang2';

export interface InformasiPermohonanCardProps {
  data: Bidang2DetailPengajuan;
}

export const InformasiPermohonanCard: FC<InformasiPermohonanCardProps> = ({ data }) => {
  return (
    <section
      className="bg-white rounded-[24px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] p-6 md:p-8 space-y-6"
      aria-labelledby="info-permohonan-heading"
    >
      <div>
        <p className="text-[11px] font-bold text-[#0E7C5A] tracking-[1.2px] uppercase">
          INFORMASI PERMOHONAN
        </p>
        <h2
          id="info-permohonan-heading"
          className="text-xl sm:text-2xl font-extrabold text-[#14201C] tracking-tight mt-1"
        >
          {data.judul || 'Pengadaan'}
        </h2>
        <p className="text-xs sm:text-sm text-[#5F6F6A] font-medium mt-1">
          Diajukan oleh {data.unit_nama || 'Unit Satuan Kerja'}
        </p>
      </div>

      <div className="pt-2 border-t border-[#F0F4F2] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Nomor Permohonan */}
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9]"
            aria-hidden="true"
          >
            <Hash className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#8A9A95]">Nomor Permohonan</p>
            <p className="text-sm font-bold text-[#14201C] truncate mt-0.5" title={data.nomor_surat}>
              {data.nomor_surat || '-'}
            </p>
          </div>
        </div>

        {/* Tanggal Pengajuan */}
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9]"
            aria-hidden="true"
          >
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#8A9A95]">Tanggal Pengajuan</p>
            <p className="text-sm font-bold text-[#14201C] truncate mt-0.5">
              {data.tanggal_pengajuan || '-'}
            </p>
          </div>
        </div>

        {/* Nominal / Estimasi */}
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9]"
            aria-hidden="true"
          >
            <Banknote className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#8A9A95]">Nominal/Estimasi</p>
            <p className="text-sm font-bold text-[#14201C] truncate mt-0.5">
              {formatRupiah(data.estimasi_anggaran)}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9]"
            aria-hidden="true"
          >
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#8A9A95]">Status</p>
            <div className="mt-1">
              <StatusPill
                status={data.status}
                label={data.status === 'menunggu_bidang2' ? 'Review Permohonan' : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InformasiPermohonanCard;
