import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
  per_page?: number;
}

export interface PaginationProps {
  meta?: PaginationMeta | null;
  currentPage?: number;
  lastPage?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: FC<PaginationProps> = ({
  meta,
  currentPage: propCurrentPage,
  lastPage: propLastPage,
  total: propTotal,
  from: propFrom,
  to: propTo,
  onPageChange,
  className = '',
}) => {
  const current = meta?.current_page ?? propCurrentPage ?? 1;
  const last = meta?.last_page ?? propLastPage ?? 1;
  const total = meta?.total ?? propTotal ?? 0;
  const from = meta?.from ?? propFrom ?? (total > 0 ? (current - 1) * (meta?.per_page ?? 10) + 1 : 0);
  const to = meta?.to ?? propTo ?? Math.min(current * (meta?.per_page ?? 10), total);

  if (last <= 1 && total <= (to - from + 1)) {
    return null;
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5F6F6A] pt-4 select-none ${className}`}
      aria-label="Navigasi Halaman"
    >
      <span>
        Menampilkan <span className="font-semibold text-[#14201C]">{from ?? 0}</span>-
        <span className="font-semibold text-[#14201C]">{to ?? 0}</span> dari{' '}
        <span className="font-semibold text-[#14201C]">{total}</span> data
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={current <= 1}
          onClick={() => onPageChange(Math.max(1, current - 1))}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E4EBE8] bg-white font-medium text-[#14201C] transition-all hover:bg-[#EEF5F2] hover:border-[#D0DDD7] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Sebelumnya</span>
        </button>

        <span className="px-3 py-1 text-xs font-semibold text-[#14201C] bg-[#EEF5F2] rounded-lg">
          {current} / {last}
        </span>

        <button
          type="button"
          disabled={current >= last}
          onClick={() => onPageChange(Math.min(last, current + 1))}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E4EBE8] bg-white font-medium text-[#14201C] transition-all hover:bg-[#EEF5F2] hover:border-[#D0DDD7] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Halaman selanjutnya"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

