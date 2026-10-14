export default function IconButton({
    children,
    onClick,
    ariaLabel,
    className = '',
    type = 'button',
    ...props
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            aria-label={ariaLabel}
            className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white hover:bg-[#EEF5F2] active:bg-[#E4EBE8] border border-[#E4EBE8] text-[#5F6F6A] hover:text-[#14201C] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
