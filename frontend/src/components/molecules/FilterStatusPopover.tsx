import { useState, useEffect, useRef, type FC, type RefObject } from 'react';
import { X } from 'lucide-react';

export interface FilterStatusOption {
  key?: string;
  value?: string;
  label: string;
  pillClass?: string;
  dotClass?: string;
}

export interface FilterStatusPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStatuses?: string[];
  onApply: (statuses: string[]) => void;
  options: FilterStatusOption[];
  title?: string;
  statusSectionTitle?: string;
  containerRef?: RefObject<HTMLElement | null>;
  align?: 'left' | 'right';
  className?: string;
}

export const FilterStatusPopover: FC<FilterStatusPopoverProps> = ({
  isOpen,
  onClose,
  selectedStatuses = [],
  onApply,
  options,
  title = 'Filter',
  statusSectionTitle = 'Status Pengadaan',
  containerRef,
  align = 'left',
  className = '',
}) => {
  const [tempStatuses, setTempStatuses] = useState<string[]>(selectedStatuses);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempStatuses(selectedStatuses);
  }, [selectedStatuses, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef?.current) {
        if (!containerRef.current.contains(target)) {
          onClose();
        }
      } else if (popoverRef.current && !popoverRef.current.contains(target)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, containerRef]);

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

  const alignmentClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div
      ref={popoverRef}
      className={`absolute ${alignmentClass} top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-2.5rem)] rounded-2xl bg-white border border-[#E4EBE8] shadow-[0_14px_36px_rgba(13,51,38,0.14)] p-4 z-40 animate-scale-up ${className}`}
      role="dialog"
      aria-label={title}
    >
      {/* Header Popover */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
        <h3 className="text-sm font-bold text-[#14201C]">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-[#8A9A95] hover:bg-[#F4F7F5] hover:text-[#14201C] transition-colors cursor-pointer"
          aria-label="Tutup filter"
          title="Tutup Filter"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Pilihan Status */}
      <div className="py-3 max-h-60 overflow-y-auto pr-1">
        {statusSectionTitle && (
          <p className="text-[10px] font-bold text-[#8A9A95] uppercase tracking-wider mb-2.5">
            {statusSectionTitle}
          </p>
        )}
        <div className="space-y-2.5">
          {options.map((opt) => {
            const optKey = opt.key || opt.value || '';
            const isChecked = tempStatuses.includes(optKey);
            return (
              <label
                key={optKey}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F9FBFA] cursor-pointer select-none transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleStatus(optKey)}
                  className="w-4 h-4 rounded border-[#CFDBD5] text-[#0E7C5A] focus:ring-[#0E7C5A] accent-[#0E7C5A] cursor-pointer"
                />
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    opt.pillClass || 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${opt.dotClass || 'bg-slate-500'}`}
                  />
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Tombol Aksi */}
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
          className="flex-1 py-2 px-3 rounded-xl bg-[#0E7C5A] hover:bg-[#0B6549] text-xs font-bold text-white transition-colors cursor-pointer shadow-xs text-center"
        >
          Terapkan
        </button>
      </div>
    </div>
  );
};

export default FilterStatusPopover;
