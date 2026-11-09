import { useState, useRef, useEffect, type FC } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface RowActionMenuItem {
  id?: number | string;
  status?: string;
  [key: string]: unknown;
}

export interface RowActionMenuProps {
  item?: RowActionMenuItem;
  viewHref?: string;
  onEdit?: ((item?: RowActionMenuItem) => void) | null;
  onDelete?: ((item?: RowActionMenuItem) => void) | null;
}

export const RowActionMenu: FC<RowActionMenuProps> = ({
  item,
  viewHref,
  onEdit = null,
  onDelete = null,
}) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 160; // w-40 = 160px
    const menuHeight = 145; // perkiraan tinggi dropdown

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

  const targetHref =
    viewHref ||
    (item?.status === 'menunggu_persetujuan'
      ? `/pp/pengajuan/${item?.id}/review`
      : `/pp/pengajuan/${item?.id}`);

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
            <Link
              to={targetHref}
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
          </div>,
          document.body
        )}
    </div>
  );
};

export default RowActionMenu;
