import { useState, useRef, useEffect, type ComponentType, type Key, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Pencil, Trash2, MoreVertical, Loader2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface CrudColumn<T = Record<string, unknown>> {
  key: string;
  header: ReactNode;
  render?: (row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  width?: string;
}

export interface CrudActionItem<T = any> {
  key: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onClick?: (row: T, index: number) => void;
  href?: string | ((row: T, index: number) => string);
  variant?: 'default' | 'danger';
  hidden?: boolean | ((row: T, index: number) => boolean);
  disabled?: boolean | ((row: T, index: number) => boolean);
}

export interface CrudTableProps<T extends Record<string, any> = Record<string, any>> {
  columns?: CrudColumn<T>[];
  rows?: T[];
  keyOf?: (row: T, index: number) => Key;
  // Header slots inside card
  title?: ReactNode;
  subtitle?: ReactNode;
  toolbar?: ReactNode; // Slot for search + filter + total count badge
  // Actions
  actions?: CrudActionItem<T>[] | ((row: T, index: number) => CrudActionItem<T>[]);
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  renderActions?: (row: T, index: number) => ReactNode;
  actionsHeader?: ReactNode;
  actionsAlign?: 'left' | 'center' | 'right';
  // State handling
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  emptyIcon?: ComponentType<{ className?: string }>;
  isLoading?: boolean;
  loadingText?: string;
  footer?: ReactNode; // Slot for pagination
  className?: string;
}

interface TableRowDropdownProps {
  items: CrudActionItem<any>[];
  row: any;
  rowIndex: number;
}

function TableRowDropdown({ items, row, rowIndex }: TableRowDropdownProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 160;
    const menuHeight = items.length * 40 + 16;

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

  const visibleItems = items.filter((action) => {
    if (typeof action.hidden === 'function') {
      return !action.hidden(row, rowIndex);
    }
    return !action.hidden;
  });

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-8 h-8 rounded-lg border border-[#E4EBE8] bg-white text-[#5F6F6A] hover:bg-[#F4F7F5] hover:text-[#14201C] inline-flex items-center justify-center transition-colors cursor-pointer"
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
            className="w-40 rounded-2xl bg-white border border-[#E4EBE8] shadow-[0_12px_28px_rgba(13,51,38,0.12)] py-1.5 z-50 animate-scale-up"
          >
            {visibleItems.map((action, idx) => {
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
                  {Icon && (
                    <Icon
                      className={`w-4 h-4 ${
                        isDisabled
                          ? 'text-[#C5D2CD]'
                          : isDanger
                          ? 'text-[#D92D20]'
                          : 'text-[#5F6F6A]'
                      }`}
                    />
                  )}
                  <span>{action.label}</span>
                </>
              );

              if (isDisabled) {
                return (
                  <div
                    key={action.key || idx}
                    className="flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-[#C5D2CD] cursor-not-allowed select-none"
                  >
                    {content}
                  </div>
                );
              }

              if (resolvedHref) {
                return (
                  <Link
                    key={action.key || idx}
                    to={resolvedHref}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2 text-xs font-semibold transition-colors ${
                      isDanger
                        ? 'text-[#D92D20] hover:bg-[#FEE4E2]/50'
                        : 'text-[#14201C] hover:bg-[#F4F7F5]'
                    }`}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={action.key || idx}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    action.onClick?.(row, rowIndex);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                    isDanger
                      ? 'text-[#D92D20] hover:bg-[#FEE4E2]/50'
                      : 'text-[#14201C] hover:bg-[#F4F7F5]'
                  }`}
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

export function CrudTable<T extends Record<string, any> = Record<string, any>>({
  columns = [],
  rows = [],
  keyOf = (row: T) => row.id,
  title,
  subtitle,
  toolbar,
  actions,
  onView,
  onEdit,
  onDelete,
  renderActions,
  actionsHeader = 'Aksi',
  actionsAlign = 'center',
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Data yang ditambahkan akan muncul di sini.',
  emptyIcon: EmptyIcon = FileText,
  isLoading = false,
  loadingText = 'Memuat data...',
  footer,
  className = '',
}: CrudTableProps<T>) {
  const hasRows = rows && rows.length > 0;
  const hasStandardActions = Boolean(actions || onView || onEdit || onDelete);
  const hasActions = Boolean(renderActions || hasStandardActions);
  const totalColumns = columns.length + (hasActions ? 1 : 0);

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  const resolveActionsForRow = (row: T, index: number): CrudActionItem<T>[] => {
    if (actions) {
      return typeof actions === 'function' ? actions(row, index) : actions;
    }

    const defaultItems: CrudActionItem<T>[] = [];
    if (onView) {
      defaultItems.push({
        key: 'view',
        label: 'Lihat',
        icon: Eye,
        onClick: (r) => onView(r),
      });
    }
    if (onEdit) {
      defaultItems.push({
        key: 'edit',
        label: 'Edit',
        icon: Pencil,
        onClick: (r) => onEdit(r),
      });
    }
    if (onDelete) {
      defaultItems.push({
        key: 'delete',
        label: 'Hapus',
        icon: Trash2,
        variant: 'danger',
        onClick: (r) => onDelete(r),
      });
    }
    return defaultItems;
  };

  return (
    <section
      className={`bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-base font-bold text-[#14201C]">{title}</h3>}
          {subtitle && <p className="text-xs text-[#8A9A95] mt-0.5">{subtitle}</p>}
        </div>
      )}

      {toolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EEF3F0] text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider">
              {columns.map((col, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === columns.length - 1 && !hasActions;
                const roundedClass =
                  isFirst && isLast
                    ? 'rounded-xl'
                    : isFirst
                    ? 'rounded-l-xl'
                    : isLast
                    ? 'rounded-r-xl'
                    : '';

                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    className={`py-3.5 px-4 ${getAlignClass(col.align)} ${roundedClass} ${
                      col.headerClassName || ''
                    }`}
                  >
                    {col.header}
                  </th>
                );
              })}

              {hasActions && (
                <th
                  scope="col"
                  className={`py-3.5 px-4 rounded-r-xl ${getAlignClass(actionsAlign)}`}
                >
                  {actionsHeader}
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F0F4F2] text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={totalColumns} className="py-12 text-center text-[#8A9A95]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 border-2 border-[#0E7C5A] border-t-transparent rounded-full animate-spin text-[#0E7C5A]" />
                    <p className="text-xs text-[#5F6F6A]">{loadingText}</p>
                  </div>
                </td>
              </tr>
            ) : !hasRows ? (
              <tr>
                <td colSpan={totalColumns} className="py-12 text-center text-[#8A9A95]">
                  <EmptyIcon className="w-8 h-8 mx-auto mb-2 text-[#C5D2CD]" />
                  <p className="text-xs font-bold text-[#5F6F6A]">{emptyTitle}</p>
                  {emptyDescription && (
                    <p className="text-[11px] text-[#8A9A95] mt-0.5 max-w-sm mx-auto">
                      {emptyDescription}
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const rowActions = resolveActionsForRow(row, index);

                return (
                  <tr
                    key={keyOf(row, index)}
                    className="hover:bg-[#F9FBFA] transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-4 px-4 text-[#14201C] ${getAlignClass(col.align)} ${
                          col.className || ''
                        }`}
                      >
                        {col.render ? col.render(row, index) : ((row as any)[col.key] as ReactNode)}
                      </td>
                    ))}

                    {hasActions && (
                      <td className={`py-4 px-4 ${getAlignClass(actionsAlign)}`}>
                        {renderActions ? (
                          renderActions(row, index)
                        ) : rowActions.length > 0 ? (
                          <TableRowDropdown
                            items={rowActions}
                            row={row}
                            rowIndex={index}
                          />
                        ) : null}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {footer && <div className="mt-4">{footer}</div>}
    </section>
  );
}

export default CrudTable;
