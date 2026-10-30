import { useState, type FC, type FormEvent } from 'react';
import { XCircle, X, Info } from 'lucide-react';

export interface TolakPengadaanData {
  permohonan?: {
    nomor_surat?: string;
  };
  [key: string]: unknown;
}

export interface TolakPengadaanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (alasan: string) => void;
  pengadaan?: TolakPengadaanData | null;
  isSubmitting?: boolean;
  errorMessage?: string;
}

export const TolakPengadaanModal: FC<TolakPengadaanModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  pengadaan,
  isSubmitting = false,
  errorMessage = '',
}) => {
  const [alasan, setAlasan] = useState<string>('');

  if (!isOpen || !pengadaan) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!alasan.trim()) return;
    onConfirm(alasan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#E4EBE8] animate-scale-up">
        {/* Header */}
        <div className="flex items-start justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FDECEC] flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6 text-[#E5484D]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14201C]">
                Tolak Dokumen Pengadaan
              </h3>
              <p className="text-xs text-[#8A9A95] mt-0.5">
                Nomor {pengadaan.permohonan?.nomor_surat || '-'} • Dokumen Pengadaan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#8A9A95] hover:text-[#14201C] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#14201C] mb-1.5">
              Alasan Penolakan <span className="text-[#E5484D]">*</span>
            </label>
            <textarea
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tuliskan alasan penolakan agar PPBJ dapat memperbaiki dokumen pengadaan..."
              className="w-full rounded-2xl border border-[#CFDBD5] p-3 text-xs text-[#14201C] focus:ring-2 focus:ring-[#0E7C5A] focus:border-transparent outline-none resize-none leading-relaxed"
              required
            />
            <div className="flex justify-between items-center text-[10px] text-[#8A9A95] mt-1">
              <span>Alasan dikirim ke PPBJ sebagai dasar revisi dokumen pengadaan.</span>
              <span>{alasan.length}/500</span>
            </div>
            {errorMessage && (
              <p className="text-xs text-[#E5484D] font-medium mt-1">{errorMessage}</p>
            )}
          </div>

          {/* Notice box */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E4EBE8] text-xs text-[#5F6F6A]">
            <Info className="w-4 h-4 text-[#8A9A95] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Dokumen akan dikembalikan ke PPBJ untuk direvisi dan diunggah ulang.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl border border-[#E4EBE8] text-xs font-bold text-[#5F6F6A] hover:bg-[#F4F7F5] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !alasan.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-[#E5484D] hover:bg-[#D4383D] text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses...' : 'Tolak Dokumen'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TolakPengadaanModal;
