export default function StatCard({
    icon: Icon,
    value,
    label,
    unit = '',
    iconBg = 'bg-[#E4F6EC]',
    iconColor = 'text-[#0E7C5A]',
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
                <p className="text-[13px] font-medium text-[#5F6F6A] mb-1 truncate">
                    {label}
                </p>
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
