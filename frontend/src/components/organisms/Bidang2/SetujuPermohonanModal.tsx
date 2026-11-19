import { useState, useRef, type FC, type DragEvent, type ChangeEvent } from 'react';
import { FileText, X, UploadCloud, Loader2 } from 'lucide-react';

export interface SetujuPermohonanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File) => Promise<void>;
  nomorSurat?: string;
}

export const SetujuPermohonanModal: FC<SetujuPermohonanModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  nomorSurat,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${Math.round(kb)} KB`;
  };

  const validateAndSetFile = (file: File | undefined | null) => {
    setErrorMessage(null);
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Dokumen memo persetujuan harus berformat PDF (.pdf).');
      return;
    }

    const maxBytes = 20 * 1024 * 1024; // 20 MB
    if (file.size > maxBytes) {
      setErrorMessage('Ukuran berkas memo persetujuan maksimal 20 MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrorMessage('Dokumen memo persetujuan wajib dilampirkan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onConfirm(selectedFile);
      handleRemoveFile();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal menyetujui permohonan. Silakan coba lagi.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    handleRemoveFile();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-setuju-title"
    >
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl border border-[#E4EBE8]">
        {/* Header Modal */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl bg-[#E4F6EC] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs"
              aria-hidden="true"
            >
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 id="modal-setuju-title" className="text-lg font-bold text-[#14201C] leading-snug">
                Unggah Memo Persetujuan
              </h3>
              <p className="text-xs text-[#5F6F6A] mt-0.5">
                {nomorSurat ? `Nomor ${nomorSurat} · ` : ''}Lampirkan memo untuk menyetujui permohonan pengadaan
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

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Dropzone Area */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] focus:ring-offset-2 ${
            isDragging
              ? 'border-[#0E7C5A] bg-[#EEF5F2]'
              : errorMessage
              ? 'border-[#FDA29B] bg-[#FFF0ED]/40'
              : 'border-[#A3D9C9] bg-[#F2F9F6] hover:bg-[#EAF5F0]'
          }`}
        >
          <div className="w-11 h-11 rounded-full bg-[#E4F6EC] text-[#0E7C5A] flex items-center justify-center mb-3 shadow-2xs">
            <UploadCloud className="w-5 h-5 stroke-[2.2]" />
          </div>
          <p className="text-sm font-semibold text-[#14201C] text-center mb-1">
            Seret & lepas memo persetujuan di sini
          </p>
          <p className="text-xs text-[#5F6F6A] text-center mb-3">Format PDF, maksimal 20 MB</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="px-4 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] hover:bg-[#F2F4F7] transition-colors shadow-2xs"
          >
            Pilih File
          </button>
        </div>

        {/* Selected File Card */}
        {selectedFile && (
          <div className="p-3.5 sm:p-4 rounded-xl border border-[#A3D9C9] bg-[#F2F9F6] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0 font-bold text-xs">
                PDF
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-semibold text-[#14201C] truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-[#5F6F6A] mt-0.5">
                  PDF · {formatBytes(selectedFile.size)} · Siap diunggah
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveFile}
              className="w-8 h-8 rounded-lg text-[#5F6F6A] hover:text-[#B42318] hover:bg-[#FDECEC] flex items-center justify-center transition-colors shrink-0"
              aria-label="Batalkan berkas memo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error inline */}
        {errorMessage && (
          <p className="text-xs font-medium text-[#D92D20]" role="alert">
            {errorMessage}
          </p>
        )}

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
            disabled={isSubmitting || !selectedFile}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#0E7C5A] text-xs md:text-sm font-semibold text-white hover:bg-[#0A5C43] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Setujui Permohonan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetujuPermohonanModal;
