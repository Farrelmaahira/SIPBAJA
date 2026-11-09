import { useEffect, type FC, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal: FC<ModalProps> = ({ open, onClose, title, children, footer }) => {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && onClose) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#14201C]/40 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E4EBE8] shadow-[0_12px_32px_rgba(13,51,38,0.08)] p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <h2 className="text-xl font-bold text-[#14201C]">{title}</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup dialog"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 -mr-2 -mt-2 rounded-xl text-[#5F6F6A] hover:bg-[#EEF5F2] hover:text-[#14201C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
