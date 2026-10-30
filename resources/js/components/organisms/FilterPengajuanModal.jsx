import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STATUS_OPTIONS = [
    {
        key: 'menunggu_persetujuan',
        label: 'Menunggu Persetujuan',
        pillClass: 'bg-[#EFF4FE] text-[#2F68D6] border border-[#D0E1FD]',
        dotClass: 'bg-[#2F68D6]',
    },
    {
        key: 'diteruskan',
        label: 'Diteruskan',
        pillClass: 'bg-[#FEF6EE] text-[#B54708] border border-[#F9DBAF]',
        dotClass: 'bg-[#B54708]',
    },
    {
        key: 'disetujui',
        label: 'Disetujui',
        pillClass: 'bg-[#E8F5E9] text-[#0E7C5A] border border-[#C8E6C9]',
        dotClass: 'bg-[#0E7C5A]',
    },
    {
        key: 'selesai',
        label: 'Selesai',
        pillClass: 'bg-[#E6F4F1] text-[#0E7090] border border-[#BAE6FD]',
        dotClass: 'bg-[#0E7090]',
    },
    {
        key: 'ditolak',
        label: 'Ditolak',
        pillClass: 'bg-[#FDECEC] text-[#E5484D] border border-[#FECDCA]',
        dotClass: 'bg-[#E5484D]',
    },
];

export default function FilterPengajuanModal({
    isOpen,
    onClose,
    selectedStatuses = [],
    onApply,
    options = STATUS_OPTIONS,
}) {
    const [tempStatuses, setTempStatuses] = useState(selectedStatuses);

    useEffect(() => {
        setTempStatuses(selectedStatuses);
    }, [selectedStatuses, isOpen]);

    if (!isOpen) return null;

    const toggleStatus = (key) => {
        if (tempStatuses.includes(key)) {
            setTempStatuses(tempStatuses.filter((s) => s !== key));
        } else {
            setTempStatuses([...tempStatuses, key]);
        }
    };

    const handleReset = () => {
        setTempStatuses([]);
        onApply([]);
        onClose();
    };

    const handleApply = () => {
        onApply(tempStatuses);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-[#E4EBE8] animate-scale-up">
                <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F2]">
                    <h3 className="text-base font-bold text-[#14201C]">Filter</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-[#8A9A95] hover:bg-[#F4F7F5] hover:text-[#14201C]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="py-4">
                    <p className="text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider mb-3">
                        Status Permohonan
                    </p>
                    <div className="space-y-3">
                        {options.map((opt) => {
                            const isChecked = tempStatuses.includes(opt.key);
                            return (
                                <label
                                    key={opt.key}
                                    className="flex items-center gap-3 cursor-pointer select-none group"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleStatus(opt.key)}
                                        className="w-4 h-4 rounded border-[#CFDBD5] text-[#0E7C5A] focus:ring-[#0E7C5A] cursor-pointer"
                                    />
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${opt.pillClass}`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${opt.dotClass}`} />
                                        {opt.label}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#F0F4F2]">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-[#E4EBE8] text-xs font-bold text-[#5F6F6A] hover:bg-[#F4F7F5] transition-colors cursor-pointer"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleApply}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#0E7C5A] hover:bg-[#0B6549] text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                    >
                        Terapkan
                    </button>
                </div>
            </div>
        </div>
    );
}
