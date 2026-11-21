import { useState, useEffect, useRef, type FC } from 'react';
import { X } from 'lucide-react';
import type { FilterStatusOption } from '../organisms/FilterPengajuanModal';

export interface FilterStatusPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStatuses: string[];
  onApply: (statuses: string[]) => void;
  options: FilterStatusOption[];
  title?: string;
}

export const FilterStatusPopover: FC<FilterStatusPopoverProps> = ({
  isOpen,
  onClose,
  selectedStatuses = [],
  onApply,
  options,
  title = 'Filter Status',
}) => {
  const [tempStatuses, setTempStatuses] = useState<string[]>(selectedStatuses);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempStatuses(selectedStatuses);
  }, [selectedStatuses, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    // Delay slight tick to avoid immediate close from button click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleStatus = (key: string) => {
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
    <div
      ref={popoverRef}
      className="absolute top-full left-0 mt-2 z-40 w-72 bg-white rounded-2xl border border-[#E4EBE8] shadow-[0_12px_28px_rgba(13,51,38,0.12)] p-4 animate-scale-up"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
        <h4 className="text-xs font-bold text-[#14201C] uppercase tracking-wider">{title}</h4>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-[#8A9A95] hover:bg-[#F4F7F5] hover:text-[#14201C] transition-colors cursor-pointer"
          title="Tutup Filter"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Options List */}
      <div className="py-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {options.map((opt) => {
          const optKey = opt.key || opt.value || '';
          const isChecked = tempStatuses.includes(optKey);
          return (
            <label
              key={optKey}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#F9FBFA] cursor-pointer select-none transition-colors"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleStatus(optKey)}
                className="w-4 h-4 rounded border-[#CFDBD5] text-[#0E7C5A] focus:ring-[#0E7C5A] cursor-pointer accent-[#0E7C5A]"
              />
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  opt.pillClass || 'bg-slate-100 text-slate-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${opt.dotClass || 'bg-slate-500'}`} />
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#F0F4F2]">
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 py-2 px-3 rounded-xl border border-[#E4EBE8] text-xs font-bold text-[#5F6F6A] hover:bg-[#F4F7F5] transition-colors cursor-pointer text-center"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 py-2 px-3 rounded-xl bg-[#0E7C5A] hover:bg-[#09573E] text-xs font-bold text-white transition-colors cursor-pointer shadow-xs text-center"
        >
          Terapkan
        </button>
      </div>
    </div>
  );
};

export default FilterStatusPopover;
