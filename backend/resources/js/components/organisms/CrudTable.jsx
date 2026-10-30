import { Eye, Pencil, Trash2 } from 'lucide-react';
import IconButton from '../atoms/IconButton';

function SkeletonRows() {
    return (
        <div className="p-6 space-y-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-[#EEF5F2] animate-pulse" />
            ))}
        </div>
    );
}

export default function CrudTable({
    columns = [],
    rows = [],
    keyOf = (row) => row.id,
    onView,
    onEdit,
    onDelete,
    emptyTitle = 'Belum ada data',
    emptyDescription = 'Data yang ditambahkan akan ditampilkan di sini.',
    isLoading = false,
    className = '',
}) {
    const hasRows = rows && rows.length > 0;
    const hasActions = onView || onEdit || onDelete;

    return (
        <section
            className={`bg-white border border-[#E4EBE8] rounded-[20px] shadow-[0_1px_3px_rgba(20,32,28,0.04)] overflow-hidden ${className}`}
        >
            {isLoading ? (
                <SkeletonRows />
            ) : !hasRows ? (
                <div className="py-12 px-6 text-center">
                    <p className="text-sm font-semibold text-[#14201C]">{emptyTitle}</p>
                    <p className="text-xs text-[#5F6F6A] mt-1 max-w-sm mx-auto">
                        {emptyDescription}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F1F7F4] border-b border-[#E4EBE8] text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider">
                                {columns.map((col) => (
                                    <th key={col.key} scope="col" className="py-3.5 px-6">
                                        {col.header}
                                    </th>
                                ))}
                                {hasActions && (
                                    <th scope="col" className="py-3.5 px-6 text-right">
                                        Aksi
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={keyOf(row)}
                                    className="border-t border-[#E4EBE8] hover:bg-[#F7FAF9] transition-colors first:border-t-0"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className="py-4 px-6 text-sm text-[#14201C]"
                                        >
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                    {hasActions && (
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
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
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
