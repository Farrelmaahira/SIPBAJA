import { FC } from 'react';
import {
  Hash,
  FileText,
  Banknote,
  Calendar,
  Building2,
  Activity,
} from 'lucide-react';
import StatusPill from '../atoms/StatusPill';
import { formatRupiah, formatTanggal } from '../../utils/formatPermohonan';
interface PermohonanInfoData {
  nomor_surat?: string | null;
  created_at?: string | null;
  judul?: string | null;
  unit_nama?: string | null;
  pembuat_nama?: string | null;
  estimasi_anggaran?: number | string | null;
  status?: string | null;
}

interface PermohonanInfoSectionProps {
  permohonan: PermohonanInfoData;
}

export const PermohonanInfoSection: FC<PermohonanInfoSectionProps> = ({ permohonan }) => {
  return (
    <section
      className="bg-white rounded-[24px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] p-6 md:p-8 space-y-6"
      aria-labelledby="info-permohonan-title"
    >
      <div>
        <h2
          id="info-permohonan-title"
          className="text-lg md:text-xl font-bold text-[#14201C]"
        >
          Informasi Permohonan
        </h2>
        <p className="text-xs md:text-sm text-[#5F6F6A] mt-0.5">
          Ringkasan data yang diajukan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 pt-2">
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-xs"
            aria-hidden="true"
          >
            <Hash className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#5F6F6A]">Nomor Permohonan</p>
            <p className="text-sm font-bold text-[#14201C] mt-0.5">
              {permohonan.nomor_surat || '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-xs"
            aria-hidden="true"
          >
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#5F6F6A]">Tanggal Pengajuan</p>
            <p className="text-sm font-bold text-[#14201C] mt-0.5">
              {formatTanggal(permohonan.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-xs"
            aria-hidden="true"
          >
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#5F6F6A]">Judul Permohonan</p>
            <p className="text-sm font-bold text-[#14201C] mt-0.5">
              {permohonan.judul || '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-xs"
            aria-hidden="true"
          >
            <Building2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#5F6F6A]">Diajukan Oleh</p>
            <p className="text-sm font-bold text-[#14201C] mt-0.5">
              {permohonan.unit_nama || permohonan.pembuat_nama || '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-xs"
            aria-hidden="true"
          >
            <Banknote className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#5F6F6A]">Nominal/Estimasi</p>
            <p className="text-sm font-bold text-[#14201C] mt-0.5">
              {formatRupiah(permohonan.estimasi_anggaran)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-xs"
            aria-hidden="true"
          >
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#5F6F6A] mb-1">Status</p>
            <StatusPill status={permohonan.status || 'diajukan'} />
          </div>
        </div>
      </div>
    </section>
  );
};
