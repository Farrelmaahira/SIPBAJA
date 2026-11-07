import { useState, type FC, type ChangeEvent } from 'react';
import { X, XCircle, Loader2 } from 'lucide-react';

export interface TolakPermohonanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (alasan: string) => Promise<void>;
  nomorSurat?: string;
  judul?: string;
}

export const TolakPermohonanModal: FC<TolakPermohonanModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  nomorSurat,
  judul,
}) => {
  const [alasan, setAlasan] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 500) {
      setAlasan(val);
      if (errorMessage) setErrorMessage(null);
    }
  };

  const handleSubmit = async () => {
    const trimmed = alasan.trim();
    if (!trimmed) {
      setErrorMessage('Catatan penolakan wajib diisi.');
      return;
    }

    if (trimmed.length < 5) {
      setErrorMessage('Catatan penolakan minimal 5 karakter.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onConfirm(trimmed);
      setAlasan('');
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal menolak permohonan. Silakan coba lagi.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setAlasan('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-tolak-title"
    >
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl border border-[#E4EBE8]">
        {/* Header Modal */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0 shadow-2xs"
              aria-hidden="true"
            >
              <XCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 id="modal-tolak-title" className="text-lg font-bold text-[#14201C] leading-snug">
                Tolak Permohonan
              </h3>
              <p className="text-xs text-[#5F6F6A] mt-0.5 truncate max-w-xs md:max-w-sm">
                Nomor {nomorSurat || '-'} · {judul || 'Pengadaan'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg text-[#5F6F6A] hover:bg-[#F3F6F5] hover:text-[#14201C] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Textarea Catatan Penolakan */}
        <div className="space-y-2">
          <label htmlFor="catatan-penolakan" className="block text-sm font-semibold text-[#344054]">
            Catatan Penolakan <span className="text-[#D92D20]">*</span>
          </label>
          <textarea
            id="catatan-penolakan"
            rows={4}
            value={alasan}
            onChange={handleTextareaChange}
            placeholder="Tuliskan alasan penolakan agar pemohon dapat memperbaiki permohonan..."
            aria-invalid={Boolean(errorMessage)}
            aria-describedby="catatan-helper"
            className={`w-full p-3.5 rounded-2xl border text-sm text-[#14201C] placeholder-[#8A9A95] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#D92D20] focus:ring-offset-1 resize-none ${
              errorMessage
                ? 'border-[#FDA29B]'
                : 'border-[#D0D5DD] focus:border-[#D92D20]'
            }`}
          />
          <div className="flex items-center justify-between gap-3 text-xs">
            <span id="catatan-helper" className="text-[#5F6F6A]">
              Catatan dikirim ke pemohon dan Tim Perencanaan sebagai dasar revisi.
            </span>
            <span className="text-[#8A9A95] shrink-0 font-medium">{alasan.length}/500</span>
          </div>

          {errorMessage && (
            <p className="text-xs font-medium text-[#D92D20] mt-1" role="alert">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 min-h-[44px] rounded-xl border border-[#D0D5DD] bg-white text-xs md:text-sm font-semibold text-[#344054] hover:bg-[#F2F4F7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !alasan.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#D92D20] text-xs md:text-sm font-semibold text-white hover:bg-[#B42318] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92D20] cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 stroke-[2.2]" />
                <span>Tolak Permohonan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TolakPermohonanModal;

