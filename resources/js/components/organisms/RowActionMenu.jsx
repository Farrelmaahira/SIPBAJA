import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function RowActionMenu({
    item,
    viewHref,
    onEdit = null,
    onDelete = null,
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const targetHref = viewHref || (item?.status === 'menunggu_persetujuan'
        ? `/pp/pengajuan/${item?.id}/review`
        : `/pp/pengajuan/${item?.id}`);

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-8 h-8 rounded-lg border border-[#E4EBE8] bg-white text-[#5F6F6A] hover:bg-[#F4F7F5] hover:text-[#14201C] inline-flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Menu aksi"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {open && (
                <div className="absolute right-0 mt-1.5 w-40 rounded-2xl bg-white border border-[#E4EBE8] shadow-[0_12px_28px_rgba(13,51,38,0.12)] py-1.5 z-40 animate-scale-up">
                    <Link
                        href={targetHref}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-[#14201C] hover:bg-[#F4F7F5] transition-colors"
                    >
                        <Eye className="w-4 h-4 text-[#5F6F6A]" />
                        <span>Lihat</span>
                    </Link>

                    {onEdit ? (
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onEdit(item);
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-[#14201C] hover:bg-[#F4F7F5] transition-colors cursor-pointer text-left"
                        >
                            <Pencil className="w-4 h-4 text-[#5F6F6A]" />
                            <span>Edit</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-[#C5D2CD] cursor-not-allowed select-none">
                            <Pencil className="w-4 h-4 text-[#C5D2CD]" />
                            <span>Edit</span>
                        </div>
                    )}

                    <div className="border-t border-[#F0F4F2] my-1" />

                    {onDelete ? (
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onDelete(item);
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-[#D92D20] hover:bg-[#FEE4E2]/50 transition-colors cursor-pointer text-left"
                        >
                            <Trash2 className="w-4 h-4 text-[#D92D20]" />
                            <span>Hapus</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-[#C5D2CD] cursor-not-allowed select-none">
                            <Trash2 className="w-4 h-4 text-[#C5D2CD]" />
                            <span>Hapus</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
