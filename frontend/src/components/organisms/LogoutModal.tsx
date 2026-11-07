import type { FC } from 'react';
import { XCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export const LogoutModal: FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { logout } = useAuth();

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    onClose();
    if (onConfirm) {
      onConfirm();
    } else {
      try {
        await logout();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        className="bg-white rounded-[28px] p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-[#E4EBE8] transform transition-all animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FEE4E2] flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6 text-[#D92D20]" />
          </div>
          <h3 id="logout-modal-title" className="text-[17px] font-bold text-[#14201C]">
            Keluar Dari Sesi?
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl border border-[#E4EBE8] bg-white text-xs font-bold text-[#5F6F6A] hover:bg-[#F4F7F5] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#E5484D] hover:bg-[#D92D20] text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <XCircle className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
