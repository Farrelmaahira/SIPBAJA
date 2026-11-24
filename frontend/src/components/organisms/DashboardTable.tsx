import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { MoreVertical, Inbox } from 'lucide-react';

export interface DashboardTableAction<T = any> {
  key?: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: (row: T, rowIndex: number) => void;
  href?: string | ((row: T, rowIndex: number) => string);
  variant?: 'default' | 'danger';
  hidden?: boolean | ((row: T, rowIndex: number) => boolean);
  disabled?: boolean | ((row: T, rowIndex: number) => boolean);
}

export interface DashboardTableColumn<T = any> {
  key: string;
  header: ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render: (row: T, rowIndex: number) => ReactNode;
}

export interface DashboardTableProps<T = any> {
  title?: string;
  subtitle?: ReactNode;
  headerRight?: ReactNode;
  viewAllLink?: {
    label?: string;
    href: string;
  };
  columns: DashboardTableColumn<T>[];
  data: T[];
  actions?: DashboardTableAction<T>[] | ((row: T, rowIndex: number) => DashboardTableAction<T>[]);
  keyExtractor?: (row: T, index: number) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyState?: {
    icon?: React.ComponentType<{ className?: string }>;
    title?: string;
    description?: ReactNode;
    action?: ReactNode;
  };
  skeletonRowCount?: number;
  className?: string;
}

interface ActionDropdownProps<T> {
  actions: DashboardTableAction<T>[];
  row: T;
  rowIndex: number;
}

function ActionDropdown<T>({ actions, row, rowIndex }: ActionDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const visibleActions = actions.filter((action) => {
    if (typeof action.hidden === 'function') {
      return !action.hidden(row, rowIndex);
    }
    return !action.hidden;
  });

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 160;
    const menuHeight = visibleActions.length * 38 + 16;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;
    const top = openUpwards ? rect.top - menuHeight - 6 : rect.bottom + 6;

    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    setCoords({ top, left });
  };

  const handleToggle = () => {
    if (!open) {
      updatePosition();
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleScroll(e: Event) {
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-8 h-8 rounded-lg text-[#5F6F6A] hover:bg-[#EEF5F2] hover:text-[#14201C] inline-flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A]"
        aria-label="Menu aksi"
        aria-expanded={open}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className="w-44 rounded-xl bg-white border border-[#E4EBE8] shadow-[0_12px_28px_rgba(13,51,38,0.12)] py-1.5 z-50 animate-scale-up"
          >
            {visibleActions.map((action, idx) => {
              const Icon = action.icon;
              const isDanger = action.variant === 'danger';
              const isDisabled =
                typeof action.disabled === 'function'
                  ? action.disabled(row, rowIndex)
                  : Boolean(action.disabled);

              const resolvedHref =
                typeof action.href === 'function'
                  ? action.href(row, rowIndex)
                  : action.href;

              const content = (
                <>
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{action.label}</span>
                </>
              );

              const baseClass = `w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors text-left ${
                isDanger
                  ? 'text-[#B42318] hover:bg-[#FEF3F2]'
                  : 'text-[#344054] hover:bg-[#F2F9F6] hover:text-[#0E7C5A]'
              } ${isDisabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`;

              if (resolvedHref && !isDisabled) {
                return (
                  <Link
                    key={action.key || idx}
                    to={resolvedHref}
                    onClick={() => setOpen(false)}
                    className={baseClass}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={action.key || idx}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    setOpen(false);
                    action.onClick?.(row, rowIndex);
                  }}
                  className={baseClass}
                >
                  {content}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}

export function DashboardTable<T = any>({
  title,
  subtitle,
  headerRight,
  viewAllLink,
  columns,
  data,
  actions,
  keyExtractor,
  isLoading = false,
  isError = false,
  errorMessage = 'Gagal memuat data tabel.',
  emptyState,
  skeletonRowCount = 3,
  className = '',
}: DashboardTableProps<T>) {
  const hasActions = Boolean(actions);
  const totalCols = columns.length + (hasActions ? 1 : 0);

  const defaultKey = (row: T, index: number) => {
    if (keyExtractor) return keyExtractor(row, index);
    if (typeof row === 'object' && row !== null && 'id' in row) {
      return String((row as any).id);
    }
    return index;
  };

  const EmptyIcon = emptyState?.icon || Inbox;

  return (
    <section
      className={`bg-white border border-[#E4EBE8] rounded-[18px] shadow-[0_1px_3px_rgba(20,32,28,0.04)] overflow-hidden ${className}`}
      aria-busy={isLoading || undefined}
    >
      {/* Header Panel */}
      {(title || subtitle || headerRight || viewAllLink) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4EBE8]">
          <div>
            {title && (
              <h2 className="text-[15px] font-bold text-[#14201C] tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <div className="text-[12px] text-[#5F6F6A] mt-0.5">
                {subtitle}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {headerRight}
            {viewAllLink && (
              <Link
                to={viewAllLink.href}
                className="text-sm font-semibold text-[#0E7C5A] hover:text-[#0B6B4D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded"
              >
                {viewAllLink.label || 'Lihat Semua'}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Table Area (overflow-x-auto only, vertical dropdown handled by React Portal) */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-[#E4EBE8] bg-[#FAFBFB]">
              {columns.map((col) => {
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                      ? 'text-center'
                      : 'text-left';

                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ width: col.width }}
                    className={`py-3.5 px-4 text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider whitespace-nowrap ${alignClass} ${col.className || ''}`}
                  >
                    {col.header}
                  </th>
                );
              })}
              {hasActions && (
                <th
                  scope="col"
                  className="py-3.5 px-4 text-right text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider whitespace-nowrap w-14"
                >
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: skeletonRowCount }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-[#E4EBE8] animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={`skel-col-${cIdx}`} className="py-4 px-4">
                      <div className="h-4 bg-[#EEF5F2] rounded w-3/4" />
                    </td>
                  ))}
                  {hasActions && (
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 w-8 bg-[#EEF5F2] rounded-lg ml-auto" />
                    </td>
                  )}
                </tr>
              ))}

            {!isLoading && isError && (
              <tr>
                <td colSpan={totalCols} className="py-12 px-4 text-center">
                  <p className="text-sm font-medium text-[#B42318]">{errorMessage}</p>
                  <p className="text-xs text-[#8A9A95] mt-1">
                    Coba muat ulang halaman untuk mencoba lagi.
                  </p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && data.length === 0 && (
              <tr>
                <td colSpan={totalCols} className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center mx-auto mb-3">
                    <EmptyIcon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-[#14201C]">
                    {emptyState?.title || 'Belum ada data'}
                  </p>
                  {emptyState?.description && (
                    <div className="text-xs text-[#5F6F6A] mt-1 mb-4 max-w-sm mx-auto">
                      {emptyState.description}
                    </div>
                  )}
                  {emptyState?.action}
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              data.map((row, rIdx) => {
                const resolvedActions =
                  typeof actions === 'function' ? actions(row, rIdx) : actions;

                return (
                  <tr
                    key={defaultKey(row, rIdx)}
                    className="border-b border-[#E4EBE8] last:border-0 hover:bg-[#F9FBFA] transition-colors"
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                            ? 'text-center'
                            : 'text-left';

                      return (
                        <td
                          key={col.key}
                          className={`py-3.5 px-4 text-sm text-[#14201C] ${alignClass} ${col.className || ''}`}
                        >
                          {col.render(row, rIdx)}
                        </td>
                      );
                    })}
                    {hasActions && (
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {resolvedActions && (
                          <ActionDropdown
                            actions={resolvedActions}
                            row={row}
                            rowIndex={rIdx}
                          />
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DashboardTable;
