export default function FormField({ label, error, children, htmlFor }) {
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="block text-[13px] font-semibold text-[#14201C] mb-2"
            >
                {label}
            </label>
            {children}
            {error && <p className="mt-1.5 text-xs text-[#B42318]">{error}</p>}
        </div>
    );
}
