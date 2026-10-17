const STATUS_CONFIG = {
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
};

export default function StatusPill({ status = 'aktif', label }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.aktif;
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
