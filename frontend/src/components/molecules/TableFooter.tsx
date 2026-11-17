import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TableFooterProps {
  currentPage?: number;
  lastPage?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
}

export const TableFooter: FC<TableFooterProps> = ({
  currentPage = 1,
  lastPage = 1,
  isLoading = false,
  onPageChange,
}) => {
  if (!onPageChange || lastPage <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between pt-5 border-t border-[#F0F4F2]">
      <span className="text-xs text-[#8A9A95]">
        Halaman <strong className="text-[#14201C]">{currentPage}</strong> dari{' '}
        <strong className="text-[#14201C]">{lastPage}</strong>
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#14201C] hover:bg-[#F4F7F5] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Sebelumnya</span>
        </button>
        <button
          type="button"
          disabled={currentPage >= lastPage || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#14201C] hover:bg-[#F4F7F5] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default TableFooter;
