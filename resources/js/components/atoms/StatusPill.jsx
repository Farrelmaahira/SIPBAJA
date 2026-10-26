const STATUS_CONFIG = {
    // Existing user-status variants
    aktif: {
        bg: 'bg-[#E4F6EC]',
        text: 'text-[#0B7A4E]',
        dot: 'bg-[#12A06B]',
        defaultLabel: 'Aktif',
    },
    nonaktif: {
        bg: 'bg-[#FDECEC]',
        text: 'text-[#B42318]',
        dot: 'bg-[#E5484D]',
        defaultLabel: 'Nonaktif',
    },
    pending: {
        bg: 'bg-[#E8F0FF]',
        text: 'text-[#1F55C7]',
        dot: 'bg-[#2F6FED]',
        defaultLabel: 'Pending',
    },
    // Permohonan status variants
    neutral: {
        bg: 'bg-[#F3F6F5]',
        text: 'text-[#5F6F6A]',
        dot: 'bg-[#8A9A95]',
        defaultLabel: '-',
    },
    info: {
        bg: 'bg-[#E8F0FF]',
        text: 'text-[#1F55C7]',
        dot: 'bg-[#2F6FED]',
        defaultLabel: 'Info',
    },
    success: {
        bg: 'bg-[#E4F6EC]',
        text: 'text-[#0B7A4E]',
        dot: 'bg-[#12A06B]',
        defaultLabel: 'Disetujui',
    },
    danger: {
        bg: 'bg-[#FDECEC]',
        text: 'text-[#B42318]',
        dot: 'bg-[#E5484D]',
        defaultLabel: 'Ditolak',
    },
    warning: {
        bg: 'bg-[#FEF3E2]',
        text: 'text-[#B45309]',
        dot: 'bg-[#D97706]',
        defaultLabel: 'Proses',
    },
};

export default function StatusPill({ status = 'aktif', label }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.neutral;
    const displayLabel = label || config.defaultLabel;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
        >
            <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${config.dot}`} aria-hidden="true" />
            <span>{displayLabel}</span>
        </span>
    );
}
