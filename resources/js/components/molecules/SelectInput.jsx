import { ChevronDown } from 'lucide-react';

export default function SelectInput({
    id,
    value = '',
    onChange,
    options = [],
    placeholder = 'Pilih...',
    error,
    className = '',
    ...props
}) {
    return (
        <div className={`relative ${className}`}>
            <select
                id={id}
                value={value}
                onChange={onChange}
                aria-invalid={error ? 'true' : undefined}
                className={`w-full min-h-[44px] appearance-none rounded-xl bg-[#F7FAF9] border pl-3.5 pr-10 py-2.5 text-sm transition-all focus:outline-none focus:border-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A]/20 hover:border-[#CFDAD6] disabled:bg-[#EEF2F0] disabled:text-[#8A9A95] cursor-pointer ${
                    value === '' ? 'text-[#8A9A95]' : 'text-[#14201C]'
                } ${error ? 'border-[#E5484D]' : 'border-[#E4EBE8]'}`}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                className="w-[18px] h-[18px] text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
            />
        </div>
    );
}
