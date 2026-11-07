import type { FC } from 'react';
import {
  Hash,
  Calendar,
  FileText,
  Building2,
  Banknote,
  Activity,
} from 'lucide-react';
import StatusPill from '../../atoms/StatusPill';
import { formatRupiah } from '../../../utils/formatPermohonan';
import type { Bidang2DetailPengajuan } from '../../../types/bidang2';

export interface InformasiPermohonanCardProps {
  data: Bidang2DetailPengajuan;
}

export const InformasiPermohonanCard: FC<InformasiPermohonanCardProps> = ({ data }) => {
  const makKode = data.mak_list && data.mak_list.length > 0
    ? data.mak_list.map((m) => m.kode).join(', ')
    : '532111';

  return (
    <section
      className="bg-white rounded-[24px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] p-6 md:p-8 space-y-6"
      aria-labelledby="info-permohonan-title"
    >
      <div>
        <h2 id="info-permohonan-title" className="text-lg md:text-xl font-bold text-[#14201C]">
          Informasi Permohonan
        </h2>
        <p className="text-xs md:text-sm text-[#5F6F6A] mt-0.5">
          Ringkasan data yang diajukan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
        {/* Nomor Permohonan */}
        <div className="flex items-start gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs"
            aria-hidden="true"
          >
            <Hash className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#8A9A95]">Nomor Permohonan</p>
            <p className="text-sm font-bold text-[#14201C] mt-0.5">{data.nomor_surat || '-'}</p>
          </div>
        </div>

        {/* Tanggal Pengajuan */}
        <div className="flex items-start gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs"
            aria-hidden="true"
          >
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#8A9A95]">Tanggal Pengajuan</p>
            <p className="text-sm font-bold text-[#14201C] mt-0.5">{data.tanggal_pengajuan || '-'}</p>
          </div>
        </div>

        {/* Judul Permohonan */}
        <div className="flex items-start gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs"
            aria-hidden="true"
          >
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#8A9A95]">Judul Permohonan</p>
            <p className="text-sm font-bold text-[#14201C] mt-0.5">{data.judul || '-'}</p>
          </div>
        </div>

        {/* Diajukan Oleh */}
        <div className="flex items-start gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs"
            aria-hidden="true"
          >
            <Building2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#8A9A95]">Diajukan Oleh</p>
            <p className="text-sm font-bold text-[#14201C] mt-0.5">{data.unit_nama || '-'}</p>
          </div>
        </div>

        {/* Nominal/Estimasi */}
        <div className="flex items-start gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs"
            aria-hidden="true"
          >
            <Banknote className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#8A9A95]">Nominal/Estimasi</p>
            <p className="text-sm font-bold text-[#14201C] mt-0.5">
              {formatRupiah(data.estimasi_anggaran)}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-start gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs"
            aria-hidden="true"
          >
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#8A9A95]">Status</p>
            <div className="mt-1">
              <StatusPill status={data.status} label={data.status === 'menunggu_bidang2' ? 'Review Permohonan' : undefined} />
            </div>
          </div>
        </div>

        {/* Jenis MAK */}
        <div className="flex items-start gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs"
            aria-hidden="true"
          >
            <Hash className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#8A9A95]">Jenis MAK</p>
            <p className="text-sm font-bold text-[#14201C] mt-0.5">{makKode}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InformasiPermohonanCard;

