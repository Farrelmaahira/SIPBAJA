import { useRef, type FC, type ReactNode } from 'react';
import TableToolbar from './TableToolbar';
import FilterStatusPopover, { type FilterStatusOption } from './FilterStatusPopover';

export interface FilterStatusToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  selectedStatuses: string[];
  filterOpen: boolean;
  onToggleFilter: (open: boolean) => void;
  onApplyFilters: (statuses: string[]) => void;
  options: FilterStatusOption[];
  statusSectionTitle?: string;
  filterStatusLabel?: string;
  selectedBulan?: string;
  onBulanChange?: (value: string) => void;
  selectedTahun?: string;
  onTahunChange?: (value: string) => void;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
  children?: ReactNode;
}

export const FilterStatusToolbar: FC<FilterStatusToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  selectedStatuses,
  filterOpen,
  onToggleFilter,
  onApplyFilters,
  options,
  statusSectionTitle = 'STATUS',
  filterStatusLabel = 'Filter Status',
  selectedBulan,
  onBulanChange,
  selectedTahun,
  onTahunChange,
  onResetFilters,
  hasActiveFilters,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <TableToolbar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        filterStatusLabel={filterStatusLabel}
        filterStatusCount={selectedStatuses.length}
        onFilterStatusClick={() => onToggleFilter(true)}
        selectedBulan={selectedBulan}
        onBulanChange={onBulanChange}
        selectedTahun={selectedTahun}
        onTahunChange={onTahunChange}
        onResetFilters={onResetFilters}
        hasActiveFilters={hasActiveFilters}
      >
        {children}
      </TableToolbar>
      <FilterStatusPopover
        isOpen={filterOpen}
        onClose={() => onToggleFilter(false)}
        selectedStatuses={selectedStatuses}
        onApply={onApplyFilters}
        options={options}
        statusSectionTitle={statusSectionTitle}
        containerRef={containerRef}
      />
    </div>
  );
};

export default FilterStatusToolbar;
