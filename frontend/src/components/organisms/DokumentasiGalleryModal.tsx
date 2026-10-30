import { useState, type FC } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, FileText, Download } from 'lucide-react';

export interface DokumentasiGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  judul?: string;
  unitName?: string;
  tanggal?: string;
  totalPhotos?: number;
}

export const DokumentasiGalleryModal: FC<DokumentasiGalleryModalProps> = ({
  isOpen,
  onClose,
  judul = 'Pengadaan Komputer',
  unitName = 'Laboratorium Komputer',
  tanggal = '12 Okt 2026',
  totalPhotos = 6,
}) => {
  const [currentIdx, setCurrentIdx] = useState(1); // default Foto 2 seperti mockup

  if (!isOpen) return null;

  const photos = Array.from({ length: totalPhotos }, (_, idx) => ({
    index: idx + 1,
    filename: `IMG_000${idx + 1}.jpg`,
    caption: `Barang diterima di ${unitName}`,
    date: tanggal,
  }));

  const activePhoto = photos[currentIdx] || photos[0];

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
      <div
        className="bg-white rounded-[28px] p-6 sm:p-7 max-w-2xl w-full shadow-2xl border border-[#E4EBE8] animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14201C]">
                Dokumentasi Penerimaan Barang
              </h3>
              <p className="text-xs text-[#8A9A95] mt-0.5">
                Foto {activePhoto.index} dari {photos.length} &middot; {judul}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A9A95] hover:text-[#14201C] hover:bg-[#F4F7F5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Preview Area */}
        <div className="relative rounded-2xl bg-[#EFF3F1] border border-[#E4EBE8] h-64 sm:h-72 flex flex-col items-center justify-center mb-4 select-none">
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 w-10 h-10 rounded-full bg-white border border-[#E4EBE8] text-[#5F6F6A] hover:text-[#14201C] shadow-xs flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center px-12">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[#B42318] mb-2">
              <ImageIcon className="w-10 h-10 stroke-[1.75]" />
            </div>
            <p className="text-xs text-[#8A9A95] font-medium">
              Foto {activePhoto.index} &middot; Placeholder foto dokumentasi
            </p>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 w-10 h-10 rounded-full bg-white border border-[#E4EBE8] text-[#5F6F6A] hover:text-[#14201C] shadow-xs flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Foto berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <span className="absolute bottom-3.5 px-3 py-1 rounded-full bg-[#14201C] text-white text-[11px] font-bold">
            {activePhoto.index} / {photos.length}
          </span>
        </div>

        {/* Photo Meta */}
        <div className="mb-3">
          <p className="text-xs font-bold text-[#14201C]">{activePhoto.caption}</p>
          <p className="text-[11px] text-[#8A9A95] mt-0.5">
            {activePhoto.date} &middot; {activePhoto.filename}
          </p>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-6 gap-2.5 mb-6">
          {photos.map((p, idx) => {
            const isSelected = idx === currentIdx;
            return (
              <button
                key={p.index}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`h-14 rounded-xl bg-[#EFF3F1] flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[#B42318] text-[#14201C] bg-[#F7F9F8]'
                    : 'border border-transparent text-[#8A9A95] hover:border-[#CFDBD5]'
                }`}
              >
                {p.index}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F7F5] text-xs font-bold text-[#14201C] transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DokumentasiGalleryModal;
