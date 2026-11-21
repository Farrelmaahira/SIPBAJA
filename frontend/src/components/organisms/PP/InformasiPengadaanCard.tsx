import type { FC, ReactNode } from 'react';

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
        <p className="text-xs text-[#8A9A95] mt-0.5">Diajukan oleh {unitNama}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom 1: Identitas Pengadaan */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-medium text-[#8A9A95] block">No. Pengadaan</span>
            <span className="text-sm font-bold text-[#14201C] block mt-0.5">{nomorPengadaan}</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[#8A9A95] block">Nomor Permohonan</span>
            <span className="text-sm font-bold text-[#14201C] block mt-0.5">{nomorPermohonan}</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[#8A9A95] block">Tanggal Pengajuan</span>
            <span className="text-sm font-bold text-[#14201C] block mt-0.5">{tanggalPengajuan}</span>
          </div>
        </div>

        {/* Kolom 2: Klasifikasi */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-medium text-[#8A9A95] block">Jenis Pengadaan</span>
            <span className="text-sm font-bold text-[#14201C] block mt-0.5">{jenisPengadaan}</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[#8A9A95] block">Metode Pengadaan</span>
            <span className="text-sm font-bold text-[#14201C] block mt-0.5">{metodePengadaan}</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[#8A9A95] block">Level Pengadaan</span>
            <span className="text-sm font-bold text-[#14201C] block mt-0.5">{levelPengadaan}</span>
          </div>
        </div>

        {/* Kolom 3: Nilai & Status */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-medium text-[#8A9A95] block">Nominal / Estimasi</span>
            <span className="text-sm font-bold text-[#0E7C5A] block mt-0.5">{nominal}</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[#8A9A95] block">Status PP</span>
            <span className="text-sm font-bold text-[#14201C] block mt-0.5">{statusPpLabel}</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[#8A9A95] block">Status Pengadaan</span>
            <div className="mt-1">{statusPengadaanPill}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformasiPengadaanCard;
