import { Search } from 'lucide-react';

export default function SearchBar({
    value = '',
    onChange,
    placeholder = 'Cari data pengguna...',
    className = '',
    id = 'dashboard-search-input',
}) {
    return (
        <div
            className={`relative flex items-center w-full max-w-md min-h-[44px] rounded-xl bg-[#F7FAF9] border border-[#E4EBE8] px-3.5 focus-within:border-[#0E7C5A] focus-within:ring-2 focus-within:ring-[#0E7C5A]/20 transition-all ${className}`}
        >
            <Search className="w-[18px] h-[18px] text-[#8A9A95] shrink-0" />
            <input
                id={id}
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-transparent border-0 py-2.5 pl-2.5 pr-1 text-sm text-[#14201C] placeholder-[#8A9A95] focus:outline-none focus:ring-0"
            />
        </div>
    );
}
