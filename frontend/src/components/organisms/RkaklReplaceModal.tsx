import { useRef, type FC, type FormEvent, type ChangeEvent } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

export interface RkaklReplaceModalProps {
  isOpen: boolean;
  selectedFile: string;
  fileError?: string;
  isFileValid?: boolean;
  tahunAnggaran?: number;
  processing?: boolean;
  onClose: () => void;
  onFileChange: (file: File) => void;
  onTahunAnggaranChange?: (val: number) => void;
  onSubmit: (e: FormEvent) => void;
  title?: string;
  submitLabel?: string;
}

export const RkaklReplaceModal: FC<RkaklReplaceModalProps> = ({
  isOpen,
  selectedFile,
  fileError = '',
  isFileValid = true,
  tahunAnggaran,
  processing = false,
  onClose,
  onFileChange,
  onTahunAnggaranChange,
  onSubmit,
  title = 'Ganti Dokumen RKAKL',
  submitLabel = 'Perbarui Dokumen',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-xl w-full max-w-[480px] p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
          <h3 className="text-base font-bold text-[#14201C]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8A9A95] hover:text-[#14201C] p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {onTahunAnggaranChange && tahunAnggaran !== undefined && (
          <div>
            <label className="block text-xs font-bold text-[#14201C] mb-1.5">
              Tahun Anggaran <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={2020}
              max={2099}
              value={tahunAnggaran}
              onChange={(e) => onTahunAnggaranChange(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#14201C] bg-[#FAFCFB] focus:bg-white focus:outline-none focus:border-[#0E7C5A]"
            />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-2xl bg-[#F5F8F6] border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            fileError
              ? 'border-[#D92D20] bg-[#FEE4E2]/30'
              : 'border-[#D2DFD8] hover:border-[#0E7C5A]'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-[#14201C] truncate px-2">
            {selectedFile || 'Belum ada berkas dipilih'}
          </p>
          <p className="text-[11px] text-[#8A9A95] mt-1">
            Klik untuk memilih berkas format PDF, JPG, atau PNG (maksimal 10 MB)
          </p>
        </div>

        {fileError && (
          <p className="text-xs font-semibold text-[#D92D20] -mt-2">{fileError}</p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5] transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={processing || !selectedFile || !isFileValid}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{processing ? 'Menyimpan...' : submitLabel}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RkaklReplaceModal;
