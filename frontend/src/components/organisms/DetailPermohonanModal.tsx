import { useEffect, type FC } from 'react';
import { X, FileText, Download, Calendar, DollarSign, Tag } from 'lucide-react';
import StatusPill from '../atoms/StatusPill';
import { formatRupiah, formatTanggal, labelStatusPermohonan } from '../../utils/formatPermohonan';

export interface PermohonanDetailData {
  id?: number | string;
  nomor_surat?: string | null;
  judul?: string | null;
  estimasi_anggaran?: number | string | null;
  created_at?: string | null;
  status?: string | null;
  ringkasan_tujuan?: string | null;
  dokumen?: Array<any>;
  [key: string]: unknown;
}

export interface DetailPermohonanModalProps {
  isOpen: boolean;
  onClose: () => void;
  permohonan?: PermohonanDetailData | null;
}

export const DetailPermohonanModal: FC<DetailPermohonanModalProps> = ({
  isOpen,
  onClose,
  permohonan,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !permohonan) return null;

  const { label, variant } = labelStatusPermohonan(permohonan.status);
  const dokumen = permohonan.dokumen?.[0] || null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-permohonan-title"
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl border border-[#E4EBE8] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#F2F4F7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E4F6EC] text-[#0E7C5A] flex items-center justify-center">
              <FileText className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 id="modal-permohonan-title" className="text-base font-bold text-[#1D2939]">
                Detail Permohonan
              </h3>
              <p className="text-xs text-[#667085] mt-0.5">{permohonan.nomor_surat}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg text-[#667085] hover:text-[#1D2939] hover:bg-[#F2F4F7] flex items-center justify-center transition-colors"
            aria-label="Tutup jendela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <span className="text-xs text-[#8A9A95] font-medium uppercase tracking-wider">
              Judul Pengadaan
            </span>
            <p className="text-sm font-semibold text-[#14201C] mt-1">{permohonan.judul}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#F2F4F7]">
            <div>
              <span className="text-xs text-[#8A9A95] font-medium flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-[#0E7C5A]" />
                Nilai Pengajuan
              </span>
              <p className="text-sm font-bold text-[#14201C]">
                {formatRupiah(permohonan.estimasi_anggaran)}
              </p>
            </div>

            <div>
              <span className="text-xs text-[#8A9A95] font-medium flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#0E7C5A]" />
                Tanggal Diajukan
              </span>
              <p className="text-sm font-semibold text-[#14201C]">
                {formatTanggal(permohonan.created_at)}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F2F4F7]">
            <span className="text-xs text-[#8A9A95] font-medium flex items-center gap-1.5 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-[#0E7C5A]" />
              Status Saat Ini
            </span>
            <div>
              <StatusPill status={variant} label={label} />
            </div>
          </div>

          {permohonan.ringkasan_tujuan && (
            <div className="pt-2 border-t border-[#F2F4F7]">
              <span className="text-xs text-[#8A9A95] font-medium uppercase tracking-wider">
                Ringkasan Tujuan
              </span>
              <p className="text-xs text-[#5F6F6A] mt-1 leading-relaxed bg-[#F8FAFA] p-3 rounded-xl border border-[#E4EBE8]">
                {permohonan.ringkasan_tujuan}
              </p>
            </div>
          )}

          {/* Lampiran Surat Permohonan */}
          <div className="pt-2 border-t border-[#F2F4F7]">
            <span className="text-xs text-[#8A9A95] font-medium uppercase tracking-wider block mb-2">
              Surat Permohonan
            </span>
            {dokumen ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#A3D9C9] bg-[#F2F9F6]">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText className="w-5 h-5 text-[#0E7C5A] shrink-0" />
                  <span
                    className="text-xs font-semibold text-[#1D2939] truncate"
                    title={dokumen.nama_asli}
                  >
                    {dokumen.nama_asli}
                  </span>
                </div>
                <a
                  href={`/api/v1/pemohon/permohonan/${permohonan.id}/dokumen`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E7C5A] text-white text-xs font-semibold hover:bg-[#0B6348] transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh</span>
                </a>
              </div>
            ) : (
              <p className="text-xs text-[#8A9A95] italic">Tidak ada dokumen terlampir.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-[#F2F4F7] bg-[#F8FAFA]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-[#344054] hover:bg-[#EEF5F2] rounded-xl border border-[#D0D5DD] bg-white transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailPermohonanModal;
