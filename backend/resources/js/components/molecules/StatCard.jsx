const BADGE_CONFIG = {
    success: 'bg-[#E4F6EC] text-[#0B7A4E]',
    warning: 'bg-[#FEF3E2] text-[#B45309]',
    danger: 'bg-[#FDECEC] text-[#B42318]',
    neutral: 'bg-[#F3F6F5] text-[#5F6F6A]',
    info: 'bg-[#E8F0FF] text-[#1F55C7]',
};

export default function StatCard({
    icon: Icon,
    value,
    label,
    unit = '',
    iconBg = 'bg-[#E4F6EC]',
    iconColor = 'text-[#0E7C5A]',
    // badge?: { label: string, variant: 'success'|'warning'|'danger'|'neutral'|'info' }
    badge,
    className = '',
}) {
    return (
        <div
            className={`p-6 bg-white border border-[#E4EBE8] rounded-[18px] shadow-[0_1px_3px_rgba(20,32,28,0.04)] flex items-start gap-4 ${className}`}
        >
            {Icon && (
                <div
                    className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center ${iconBg} ${iconColor}`}
                >
                    <Icon className="w-6 h-6" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-medium text-[#5F6F6A] mb-1 truncate">
                        {label}
                    </p>
                    {badge && (
                        <span
                            className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${BADGE_CONFIG[badge.variant] ?? BADGE_CONFIG.neutral}`}
                        >
                            {badge.label}
                        </span>
                    )}
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold tracking-tight text-[#14201C]">
                        {value}
                    </span>
                    {unit && (
                        <span className="text-[13px] font-medium text-[#8A9A95]">
                            {unit}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
