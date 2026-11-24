import type { FC, ReactNode } from 'react';
import {
  Hash,
  FileText,
  Calendar,
  Layers,
  GitBranch,
  ShieldAlert,
  Banknote,
  UserCheck,
  Activity,
  Building2,
} from 'lucide-react';

export interface InformasiPengadaanCardProps {
  judul: string;
  unitNama: string;
  nomorPengadaan: string;
  nomorPermohonan: string;
  tanggalPengajuan: string;
  jenisPengadaan: string;
  metodePengadaan: string;
  levelPengadaan: string;
  nominal: string;
  statusPpLabel: string;
  statusPengadaanPill: ReactNode;
}

export const InformasiPengadaanCard: FC<InformasiPengadaanCardProps> = ({
  judul,
  unitNama,
  nomorPengadaan,
  nomorPermohonan,
  tanggalPengajuan,
  jenisPengadaan,
  metodePengadaan,
  levelPengadaan,
  nominal,
  statusPpLabel,
  statusPengadaanPill,
}) => {
  return (
    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
      <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
        <p className="text-[11px] font-bold text-[#8A9A95] tracking-wider uppercase">
          INFORMASI PENGADAAN
        </p>
        <h2 className="text-lg font-bold text-[#14201C] mt-1">{judul}</h2>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-[#8A9A95]">
          <Building2 className="w-3.5 h-3.5 text-[#0E7C5A] shrink-0" />
          <span>Diajukan oleh {unitNama}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom 1: Identitas Pengadaan */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9] mt-0.5">
              <Hash className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-[#8A9A95] block">No. Pengadaan</span>
              <span className="text-sm font-bold text-[#14201C] block mt-0.5 truncate">{nomorPengadaan}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9] mt-0.5">
              <FileText className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-[#8A9A95] block">Nomor Permohonan</span>
              <span className="text-sm font-bold text-[#14201C] block mt-0.5 truncate">{nomorPermohonan}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9] mt-0.5">
              <Calendar className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-[#8A9A95] block">Tanggal Pengajuan</span>
              <span className="text-sm font-bold text-[#14201C] block mt-0.5 truncate">{tanggalPengajuan}</span>
            </div>
          </div>
        </div>

        {/* Kolom 2: Klasifikasi */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9] mt-0.5">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-[#8A9A95] block">Jenis Pengadaan</span>
              <span className="text-sm font-bold text-[#14201C] block mt-0.5 truncate">{jenisPengadaan}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9] mt-0.5">
              <GitBranch className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-[#8A9A95] block">Metode Pengadaan</span>
              <span className="text-sm font-bold text-[#14201C] block mt-0.5 truncate">{metodePengadaan}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9] mt-0.5">
              <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-[#8A9A95] block">Level Pengadaan</span>
              <span className="text-sm font-bold text-[#14201C] block mt-0.5 truncate">{levelPengadaan}</span>
            </div>
          </div>
        </div>

        {/* Kolom 3: Nilai & Status */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9] mt-0.5">
              <Banknote className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-[#8A9A95] block">Nominal / Estimasi</span>
              <span className="text-sm font-bold text-[#0E7C5A] block mt-0.5 truncate">{nominal}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9] mt-0.5">
              <UserCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-[#8A9A95] block">Status PP</span>
              <span className="text-sm font-bold text-[#14201C] block mt-0.5 truncate">{statusPpLabel}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9] mt-0.5">
              <Activity className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-[#8A9A95] block">Status Pengadaan</span>
              <div className="mt-1">{statusPengadaanPill}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformasiPengadaanCard;
