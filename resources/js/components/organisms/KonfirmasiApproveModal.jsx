import { CheckCircle2, Check } from 'lucide-react';

export default function KonfirmasiApproveModal({
    isOpen,
    onClose,
    onConfirm,
    pengadaan,
    isSubmitting = false,
}) {
    if (!isOpen || !pengadaan) return null;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-[#E4EBE8] animate-scale-up">
                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#0E7C5A] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="text-center mb-5">
                    <h3 className="text-base font-bold text-[#14201C]">
                        Setujui Dokumen Pengadaan?
                    </h3>
                    <p className="text-xs text-[#5F6F6A] mt-1.5 leading-relaxed">
                        Pastikan dokumen pengadaan, MAK, dan penanggung jawab sudah benar. Setelah disetujui, pengadaan diteruskan ke tahap berikutnya.
                    </p>
                </div>

                {/* Info Card */}
                <div className="bg-[#F8FAF9] rounded-2xl p-4 border border-[#E4EBE8] space-y-2.5 text-xs mb-6">
                    <div className="flex justify-between items-start gap-2">
                        <span className="text-[#8A9A95]">Nomor</span>
                        <span className="font-bold text-[#0E7C5A] text-right truncate">
                            {pengadaan.permohonan?.nomor_surat || '-'}
                        </span>
                    </div>
                    <div className="flex justify-between items-start gap-2">
                        <span className="text-[#8A9A95]">Judul</span>
                        <span className="font-bold text-[#14201C] text-right truncate max-w-[180px]">
                            {pengadaan.permohonan?.judul || '-'}
                        </span>
                    </div>
                    <div className="flex justify-between items-start gap-2">
                        <span className="text-[#8A9A95]">Nominal</span>
                        <span className="font-bold text-[#14201C] text-right">
                            {formatCurrency(pengadaan.nominal)}
                        </span>
                    </div>
                    <div className="flex justify-between items-start gap-2">
                        <span className="text-[#8A9A95]">Dokumen</span>
                        <span className="font-medium text-[#14201C] text-right truncate max-w-[180px]">
                            Dokumen_Pengadaan.pdf
                        </span>
                    </div>
                    <div className="flex justify-between items-start gap-2 pt-1 border-t border-[#EAEFEA]">
                        <span className="text-[#8A9A95]">MAK</span>
                        <span className="font-medium text-[#14201C] text-right truncate max-w-[180px]">
                            532111 - Belanja Modal
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-4 rounded-xl border border-[#E4EBE8] text-xs font-bold text-[#5F6F6A] hover:bg-[#F4F7F5] transition-colors cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#0E7C5A] hover:bg-[#0B6549] text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                        <Check className="w-4 h-4" />
                        <span>{isSubmitting ? 'Memproses...' : 'Ya, Setujui'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
