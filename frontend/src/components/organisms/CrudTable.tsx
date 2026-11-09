import type { ComponentType, Key, ReactNode } from 'react';
import { Eye, Pencil, Trash2, Loader2, FileText } from 'lucide-react';
import IconButton from '../atoms/IconButton';

export interface CrudColumn<T = Record<string, unknown>> {
  key: string;
  header: ReactNode;
  render?: (row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  width?: string;
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

export function CrudTable<T extends Record<string, any> = Record<string, any>>({
  columns = [],
  rows = [],
  keyOf = (row: T) => row.id,
  title,
  subtitle,
  toolbar,
  onView,
  onEdit,
  onDelete,
  renderActions,
  actionsHeader = 'Aksi',
  actionsAlign = 'right',
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Data yang ditambahkan akan muncul di sini.',
  emptyIcon: EmptyIcon = FileText,
  isLoading = false,
  loadingText = 'Memuat data...',
  footer,
  className = '',
}: CrudTableProps<T>) {
  const hasRows = rows && rows.length > 0;
  const hasActions = Boolean(renderActions || onView || onEdit || onDelete);
  const totalColumns = columns.length + (hasActions ? 1 : 0);

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
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
                const roundedClass = isFirst && isLast
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
                    className={`py-3.5 px-4 ${getAlignClass(col.align)} ${roundedClass} ${col.headerClassName || ''}`}
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
              rows.map((row, index) => (
                <tr
                  key={keyOf(row, index)}
                  className="hover:bg-[#F9FBFA] transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-4 px-4 text-[#14201C] ${getAlignClass(col.align)} ${col.className || ''}`}
                    >
                      {col.render ? col.render(row, index) : ((row as any)[col.key] as ReactNode)}
                    </td>
                  ))}

                  {hasActions && (
                    <td className={`py-4 px-4 ${getAlignClass(actionsAlign)}`}>
                      {renderActions ? (
                        renderActions(row, index)
                      ) : (
                        <div
                          className={`flex items-center gap-2 ${
                            actionsAlign === 'right'
                              ? 'justify-end'
                              : actionsAlign === 'center'
                              ? 'justify-center'
                              : 'justify-start'
                          }`}
                        >
                          {onView && (
                            <IconButton
                              ariaLabel="Lihat detail"
                              onClick={() => onView(row)}
                            >
                              <Eye className="w-[18px] h-[18px]" />
                            </IconButton>
                          )}
                          {onEdit && (
                            <IconButton
                              ariaLabel="Ubah data"
                              onClick={() => onEdit(row)}
                            >
                              <Pencil className="w-[18px] h-[18px]" />
                            </IconButton>
                          )}
                          {onDelete && (
                            <IconButton
                              ariaLabel="Hapus data"
                              onClick={() => onDelete(row)}
                              className="text-[#B42318] hover:bg-[#FDECEC] hover:text-[#B42318]"
                            >
                              <Trash2 className="w-[18px] h-[18px]" />
                            </IconButton>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {footer && <div className="mt-4">{footer}</div>}
    </section>
  );
}

export default CrudTable;
