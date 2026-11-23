import type { FC } from 'react';
import { AlertTriangle, X, Calendar, FileCheck } from 'lucide-react';

export interface KonfirmasiPembayaranModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  tanggalPembayaran: string;
  totalFiles: number;
}

export const KonfirmasiPembayaranModal: FC<KonfirmasiPembayaranModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  tanggalPembayaran,
  totalFiles,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="konfirmasi-pembayaran-title"
    >
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-[#E4EBE8] animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEF6EE] text-[#D97706] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 id="konfirmasi-pembayaran-title" className="text-base font-bold text-[#14201C]">
              Konfirmasi Bukti Pembayaran
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg text-[#8A9A95] hover:text-[#14201C] hover:bg-[#F0F4F2] flex items-center justify-center transition-colors disabled:opacity-50"
            aria-label="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3.5 text-xs text-[#5F6F6A]">
          <p className="leading-relaxed">
            Apakah Anda yakin data tanggal pembayaran dan berkas bukti pembayaran yang dilampirkan sudah sesuai dan valid?
          </p>

          <div className="bg-[#F9FBFA] rounded-xl p-3.5 border border-[#EEF3F0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium text-[#8A9A95]">
                <Calendar className="w-3.5 h-3.5 text-[#0E7C5A]" />
                Tanggal Pembayaran:
              </span>
              <span className="font-bold text-[#14201C]">
                {tanggalPembayaran || '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium text-[#8A9A95]">
                <FileCheck className="w-3.5 h-3.5 text-[#0E7C5A]" />
                Jumlah Berkas Bukti:
              </span>
              <span className="font-bold text-[#0E7C5A]">
                {totalFiles} berkas
              </span>
            </div>
          </div>

          <div className="bg-[#FEF6EE] rounded-xl p-3 border border-[#FDE68A]/60 text-[11px] text-[#B45309] leading-relaxed">
            <strong>Penting:</strong> Setelah dikirim, status paket pengadaan akan berubah menjadi <strong>Selesai</strong> dan notifikasi penyelesaian akan otomatis disiarkan ke PPBJ, PPK, dan Pemohon.
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F0F4F2]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-[#5F6F6A] bg-white border border-[#E2E8F0] hover:bg-[#F9FBFA] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Periksa Kembali
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#0E7C5A] hover:bg-[#0A5C43] rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {isSubmitting ? 'Mengirim...' : 'Ya, Kirim Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KonfirmasiPembayaranModal;
