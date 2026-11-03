import { useState, useEffect, useRef, type FC } from 'react';
import { X } from 'lucide-react';
import StatusPill from '../atoms/StatusPill';

export interface FilterPermohonanModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStatuses: string[];
  onApply: (statuses: string[]) => void;
  onReset: () => void;
}

interface FilterOption {
  key: string;
  label: string;
  statusProp: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    key: 'menunggu_persetujuan',
    label: 'Menunggu Persetujuan',
    statusProp: 'menunggu_persetujuan',
  },
  {
    key: 'sedang_diproses',
    label: 'Sedang Diproses',
    statusProp: 'sedang_diproses',
  },
  {
    key: 'disetujui',
    label: 'Disetujui',
    statusProp: 'disetujui',
  },
  {
    key: 'ditolak',
    label: 'Ditolak',
    statusProp: 'ditolak',
  },
];

export const FilterPermohonanModal: FC<FilterPermohonanModalProps> = ({
  isOpen,
  onClose,
  selectedStatuses,
  onApply,
  onReset,
}) => {
  const [localStatuses, setLocalStatuses] = useState<string[]>(selectedStatuses);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalStatuses(selectedStatuses);
    }
  }, [isOpen, selectedStatuses]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleToggle = (key: string) => {
    setLocalStatuses((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleResetClick = () => {
    setLocalStatuses([]);
    onReset();
    onClose();
  };

  const handleApplyClick = () => {
    onApply(localStatuses);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[1px] animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      <div
        ref={cardRef}
        className="relative w-full max-w-[340px] bg-white rounded-[24px] border border-[#E4EBE8] shadow-[0_12px_32px_rgba(14,124,90,0.12)] p-6 animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E4EBE8]">
          <h2 id="filter-modal-title" className="text-xl font-bold text-[#14201C]">
            Filter
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#5F6F6A] hover:text-[#14201C] hover:bg-[#F3F6F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
            aria-label="Tutup filter"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5">
          <p className="text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider mb-3.5">
            STATUS PERMOHONAN
          </p>

          <div className="space-y-3">
            {FILTER_OPTIONS.map((opt) => {
              const isChecked = localStatuses.includes(opt.key);
              return (
                <label
                  key={opt.key}
                  className="flex items-center gap-3 cursor-pointer select-none group"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(opt.key)}
                    className="w-5 h-5 rounded-md border border-[#D0D5DD] text-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A] focus:ring-offset-1 transition cursor-pointer accent-[#0E7C5A]"
                  />
                  <StatusPill status={opt.statusProp} label={opt.label} />
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-[#E4EBE8]">
          <button
            type="button"
            onClick={handleResetClick}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E4EBE8] bg-white text-sm font-semibold text-[#14201C] hover:bg-[#F3F6F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleApplyClick}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0E7C5A] text-sm font-semibold text-white shadow-sm hover:bg-[#0A5C43] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] focus-visible:ring-offset-2 cursor-pointer"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPermohonanModal;

