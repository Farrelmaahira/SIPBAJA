import type { FC, FormEvent, ReactNode } from 'react';
import { Filter, Search, X } from 'lucide-react';

export interface TableToolbarOption {
  value: string;
  label: string;
}

export const BULAN_OPTIONS: TableToolbarOption[] = [
  { value: '', label: 'Semua Bulan' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

export const buildTahunOptions = (): TableToolbarOption[] => {
  const currentYear = new Date().getFullYear();
  return [
    { value: '', label: 'Semua Tahun' },
    ...[0, 1, 2].map((offset) => {
      const year = String(currentYear - offset);
      return { value: year, label: `Tahun ${year}` };
    }),
  ];
};

export interface TableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (event: FormEvent) => void;
  onClearSearch?: () => void;
  searchPlaceholder?: string;
  filterStatusCount?: number;
  filterStatusLabel?: string;
  onFilterStatusClick?: () => void;
  selectedBulan?: string;
  onBulanChange?: (value: string) => void;
  bulanOptions?: TableToolbarOption[];
  selectedTahun?: string;
  onTahunChange?: (value: string) => void;
  tahunOptions?: TableToolbarOption[];
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
  total?: ReactNode;
  children?: ReactNode;
}

export const TableToolbar: FC<TableToolbarProps> = ({
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  searchPlaceholder = 'Cari nomor surat atau judul...',
  filterStatusCount = 0,
  filterStatusLabel = 'Filter Status',
  onFilterStatusClick,
  selectedBulan = '',
  onBulanChange,
  bulanOptions = BULAN_OPTIONS,
  selectedTahun = '',
  onTahunChange,
  tahunOptions,
  onResetFilters,
  hasActiveFilters,
  total,
  children,
}) => {
  const resolvedTahunOptions = tahunOptions ?? buildTahunOptions();
  const hasActiveFilter = filterStatusCount > 0;
  const showResetButton =
    Boolean(onResetFilters) &&
    (hasActiveFilters ?? (filterStatusCount > 0 || Boolean(selectedBulan) || Boolean(selectedTahun) || Boolean(searchValue)));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      <div className="flex flex-wrap items-center gap-2.5">
        {onFilterStatusClick && (
          <button
            type="button"
            onClick={onFilterStatusClick}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              hasActiveFilter
                ? 'bg-[#E8F5EF] text-[#0E7C5A] border-[#0E7C5A]'
                : 'bg-white text-[#14201C] border-[#E4EBE8] hover:bg-[#F4F7F5]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterStatusLabel}</span>
            {hasActiveFilter && (
              <span className="w-4 h-4 rounded-full bg-[#0E7C5A] text-white text-[10px] flex items-center justify-center">
                {filterStatusCount}
              </span>
            )}
          </button>
        )}

        {onBulanChange && (
          <select
            value={selectedBulan}
            onChange={(e) => onBulanChange(e.target.value)}
            aria-label="Filter Bulan"
            className="px-3.5 py-2.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#14201C] bg-white focus:ring-2 focus:ring-[#0E7C5A] outline-none cursor-pointer"
          >
            {bulanOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {onTahunChange && (
          <select
            value={selectedTahun}
            onChange={(e) => onTahunChange(e.target.value)}
            aria-label="Filter Tahun"
            className="px-3.5 py-2.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#14201C] bg-white focus:ring-2 focus:ring-[#0E7C5A] outline-none cursor-pointer"
          >
            {resolvedTahunOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {onSearchChange && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSearchSubmit?.(event);
            }}
            className="relative"
          >
            <Search className="w-4 h-4 text-[#8A9A95] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className={`w-64 sm:w-72 pl-10 py-2.5 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:ring-2 focus:ring-[#0E7C5A] focus:border-transparent outline-none bg-white placeholder-[#8A9A95] ${
                onClearSearch ? 'pr-9' : 'pr-4'
              }`}
            />
            {onClearSearch && searchValue && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8A9A95] hover:text-[#14201C] rounded-md cursor-pointer"
                aria-label="Bersihkan pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        )}

        {children}

        {showResetButton && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#5C6E68] hover:text-[#14201C] hover:bg-[#F4F7F6] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Reset Filter
          </button>
        )}
      </div>

      {total != null && <span className="text-xs text-[#8A9A95] font-medium">{total}</span>}
    </div>
  );
};

export default TableToolbar;
