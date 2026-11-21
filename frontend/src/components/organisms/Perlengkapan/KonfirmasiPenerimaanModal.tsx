import { useEffect, type FC } from 'react';
import { PackageCheck, AlertCircle, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';

export interface KonfirmasiPenerimaanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nomorPengadaan?: string;
  judulPengadaan?: string;
  totalDokumenBarang: number;
  totalDokumentasiFoto: number;
  isSubmitting?: boolean;
}

export const KonfirmasiPenerimaanModal: FC<KonfirmasiPenerimaanModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  nomorPengadaan = '-',
  judulPengadaan = '-',
  totalDokumenBarang,
  totalDokumentasiFoto,
  isSubmitting = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="konfirmasi-penerimaan-title"
    >
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#E4EBE8] z-10 transition-all">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center mx-auto mb-4 shadow-xs">
          <PackageCheck className="w-7 h-7" />
        </div>

        {/* Title & Description */}
        <div className="text-center mb-5">
          <h3
            id="konfirmasi-penerimaan-title"
            className="text-base sm:text-lg font-bold text-[#14201C]"
          >
            Kirim Dokumen Penerimaan Barang?
          </h3>
          <p className="text-xs text-[#5F6F6A] mt-1.5 leading-relaxed">
            Pastikan seluruh Berita Acara Serah Terima (BAST) telah ditandatangani dan foto fisik kondisi barang sudah lengkap.
          </p>
        </div>

        {/* Info Card Summary */}
        <div className="bg-[#F9FBFA] rounded-2xl p-4 border border-[#E4EBE8] space-y-2.5 text-xs mb-5">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[#8A9A95] shrink-0 font-medium">Nomor Pengadaan</span>
            <span className="font-bold text-[#0E7C5A] text-right truncate">
              {nomorPengadaan}
            </span>
          </div>

          <div className="flex justify-between items-start gap-2">
            <span className="text-[#8A9A95] shrink-0 font-medium">Judul Pengadaan</span>
            <span className="font-semibold text-[#14201C] text-right truncate max-w-[220px]">
              {judulPengadaan}
            </span>
          </div>

          <div className="pt-2 border-t border-[#EEF2F0] flex justify-between items-center gap-2">
            <span className="text-[#8A9A95] flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-[#0E7C5A]" />
              Dokumen BAST
            </span>
            <span className="font-bold text-[#14201C] bg-[#EEF5F2] text-[#0E7C5A] px-2.5 py-0.5 rounded-full text-[11px]">
              {totalDokumenBarang} Berkas
            </span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-[#8A9A95] flex items-center gap-1.5 font-medium">
              <ImageIcon className="w-3.5 h-3.5 text-[#0E7C5A]" />
              Dokumentasi Foto Fisik
            </span>
            <span className="font-bold text-[#14201C] bg-[#EEF5F2] text-[#0E7C5A] px-2.5 py-0.5 rounded-full text-[11px]">
              {totalDokumentasiFoto} Foto
            </span>
          </div>
        </div>

        {/* Notice Info */}
        <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] flex items-start gap-2.5 mb-6 text-xs text-[#92400E]">
          <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            Setelah dikirim, status paket pengadaan akan diperbarui menjadi <strong>Barang Diterima</strong> dan berkas akan dikunci secara permanen.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 min-h-[44px] rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#5F6F6A] hover:bg-[#F4F7F5] transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 min-h-[44px] rounded-xl bg-[#0E7C5A] hover:bg-[#09573E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengirim...</span>
              </>
            ) : (
              <span>Ya, Kirim Sekarang</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KonfirmasiPenerimaanModal;
