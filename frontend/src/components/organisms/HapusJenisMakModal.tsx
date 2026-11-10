import type { FC } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { JenisMakRow } from '../../types/perencanaan';

export interface HapusJenisMakModalProps {
  isOpen: boolean;
  targetMak?: JenisMakRow | null;
  processing?: boolean;
  deleteError?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const HapusJenisMakModal: FC<HapusJenisMakModalProps> = ({
  isOpen,
  targetMak,
  processing = false,
  deleteError = '',
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !targetMak) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
      <div className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-xl w-full max-w-[420px] p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#14201C]">Hapus Jenis MAK</h3>
            <p className="text-xs text-[#8A9A95] mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>

        <p className="text-xs text-[#5F6F6A] leading-relaxed">
          Apakah Anda yakin ingin menghapus data MAK{' '}
          <strong className="text-[#14201C]">{targetMak.kode}</strong> &mdash;{' '}
          <span className="text-[#14201C] font-semibold">{targetMak.nama}</span>?
        </p>

        {deleteError && (
          <div className="p-3 rounded-xl bg-[#FEE4E2]/70 border border-[#FECDCA] text-xs font-medium text-[#D92D20]">
            {deleteError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F4F2]">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#5F6F6A] hover:bg-[#F4F7F5] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={processing}
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-[#D92D20] hover:bg-[#B42318] text-xs font-bold text-white disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
          >
            {processing ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HapusJenisMakModal;
