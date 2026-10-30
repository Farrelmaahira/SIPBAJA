import type { FC } from 'react';

interface StatusTheme {
  bg: string;
  text: string;
  dot: string;
  defaultLabel: string;
}

const STATUS_CONFIG: Record<string, StatusTheme> = {
  // Approved / Success
  aktif: {
    bg: 'bg-[#E4F6EC]',
    text: 'text-[#0B7A4E]',
    dot: 'bg-[#12A06B]',
    defaultLabel: 'Aktif',
  },
  disetujui: {
    bg: 'bg-[#E4F6EC]',
    text: 'text-[#0B7A4E]',
    dot: 'bg-[#12A06B]',
    defaultLabel: 'Disetujui',
  },
  lunas: {
    bg: 'bg-[#E4F6EC]',
    text: 'text-[#0B7A4E]',
    dot: 'bg-[#12A06B]',
    defaultLabel: 'Lunas',
  },
  selesai: {
    bg: 'bg-[#E4F6EC]',
    text: 'text-[#0B7A4E]',
    dot: 'bg-[#12A06B]',
    defaultLabel: 'Selesai',
  },

  // Rejected / Danger
  nonaktif: {
    bg: 'bg-[#FDECEC]',
    text: 'text-[#B42318]',
    dot: 'bg-[#E5484D]',
    defaultLabel: 'Nonaktif',
  },
  ditolak: {
    bg: 'bg-[#FDECEC]',
    text: 'text-[#B42318]',
    dot: 'bg-[#E5484D]',
    defaultLabel: 'Ditolak',
  },
  batal: {
    bg: 'bg-[#FDECEC]',
    text: 'text-[#B42318]',
    dot: 'bg-[#E5484D]',
    defaultLabel: 'Batal',
  },

  // Pending / In Review / Info
  pending: {
    bg: 'bg-[#E8F0FF]',
    text: 'text-[#1F55C7]',
    dot: 'bg-[#2F6FED]',
    defaultLabel: 'Pending',
  },
  menunggu_verifikasi: {
    bg: 'bg-[#E8F0FF]',
    text: 'text-[#1F55C7]',
    dot: 'bg-[#2F6FED]',
    defaultLabel: 'Menunggu Verifikasi',
  },
  menunggu: {
    bg: 'bg-[#E8F0FF]',
    text: 'text-[#1F55C7]',
    dot: 'bg-[#2F6FED]',
    defaultLabel: 'Menunggu',
  },
  menunggu_ppk: {
    bg: 'bg-[#E8F0FF]',
    text: 'text-[#1F55C7]',
    dot: 'bg-[#2F6FED]',
    defaultLabel: 'Menunggu PPK',
  },
  menunggu_bidang2: {
    bg: 'bg-[#E8F0FF]',
    text: 'text-[#1F55C7]',
    dot: 'bg-[#2F6FED]',
    defaultLabel: 'Menunggu Bidang 2',
  },
  review_pp: {
    bg: 'bg-[#FEF6EE]',
    text: 'text-[#B54708]',
    dot: 'bg-[#F79009]',
    defaultLabel: 'Review PP',
  },
  review_ppk: {
    bg: 'bg-[#FEF6EE]',
    text: 'text-[#B54708]',
    dot: 'bg-[#F79009]',
    defaultLabel: 'Review PPK',
  },
  diproses_ppbj: {
    bg: 'bg-[#E8F0FF]',
    text: 'text-[#1F55C7]',
    dot: 'bg-[#2F6FED]',
    defaultLabel: 'Diproses PPBJ',
  },
  siap_spk: {
    bg: 'bg-[#E4F6EC]',
    text: 'text-[#0B7A4E]',
    dot: 'bg-[#12A06B]',
    defaultLabel: 'Siap SPK',
  },
  kontrak_terbit: {
    bg: 'bg-[#E4F6EC]',
    text: 'text-[#0B7A4E]',
    dot: 'bg-[#12A06B]',
    defaultLabel: 'Kontrak Terbit',
  },
  berjalan: {
    bg: 'bg-[#E8F0FF]',
    text: 'text-[#1F55C7]',
    dot: 'bg-[#2F6FED]',
    defaultLabel: 'Berjalan',
  },
  belum_diajukan: {
    bg: 'bg-[#F3F6F5]',
    text: 'text-[#5F6F6A]',
    dot: 'bg-[#8A9A95]',
    defaultLabel: 'Belum Diajukan',
  },
};

export interface StatusPillProps {
  status?: string;
  label?: string;
}

export const StatusPill: FC<StatusPillProps> = ({ status = 'aktif', label }) => {
  const normalizedKey = String(status).toLowerCase().replace(/\s+/g, '_');
  const config = STATUS_CONFIG[normalizedKey] || {
    bg: 'bg-[#E8F0FF]',
    text: 'text-[#1F55C7]',
    dot: 'bg-[#2F6FED]',
    defaultLabel: String(status).replace(/_/g, ' '),
  };

  const displayLabel = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} shrink-0`}
    >
      <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${config.dot}`} aria-hidden="true" />
      <span className="capitalize">{displayLabel}</span>
    </span>
  );
};

export default StatusPill;
