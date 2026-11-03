import { useState, useRef, type FC, type FormEvent, type DragEvent, type ChangeEvent } from 'react';
import {
  FileText,
  Eye,
  UploadCloud,
  RotateCcw,
  Loader2,
  Info,
  X,
  CheckCircle,
} from 'lucide-react';
import MoneyInput from '../molecules/MoneyInput';
import type { PermohonanRevisiFormData, PermohonanRevisiFormErrors, PermohonanDokumenDetail } from '../../types/permohonan';

export interface PermohonanEditFormCardProps {
  currentDokumen?: PermohonanDokumenDetail | null;
  onViewDokumen?: () => void;
  data: PermohonanRevisiFormData;
  setData: (field: keyof PermohonanRevisiFormData, value: any) => void;
  errors: PermohonanRevisiFormErrors;
  processing?: boolean;
  onSubmit: (e: FormEvent) => void;
}

export const PermohonanEditFormCard: FC<PermohonanEditFormCardProps> = ({
  currentDokumen,
  onViewDokumen,
  data,
  setData,
  errors,
  processing = false,
  onSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const validateAndSetFile = (selectedFile: File | undefined | null) => {
    setFileError(null);
    if (!selectedFile) return;

    if (
      selectedFile.type !== 'application/pdf' &&
      !selectedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setFileError('Surat permohonan harus berformat PDF (.pdf).');
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxBytes) {
      setFileError('Ukuran berkas surat permohonan maksimal 10 MB.');
      return;
    }

    setData('file_dokumen', selectedFile);
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

  const handleRemoveNewFile = () => {
    setData('file_dokumen', null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayedFileError = errors.file_dokumen || fileError;

  return (
    <div className="bg-white rounded-[24px] border border-[#E4EBE8] p-6 lg:p-8 shadow-sm">
      {/* Header Form */}
      <div className="flex items-center gap-3 pb-6 mb-6 border-b border-[#F2F4F7]">
        <div className="w-11 h-11 rounded-xl bg-[#E4F6EC] text-[#0E7C5A] flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1D2939]">Detail Pengadaan</h2>
          <p className="text-xs text-[#667085] mt-0.5">Kolom bertanda * wajib diisi.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Field Judul Pengadaan */}
        <div>
          <label htmlFor="edit-judul" className="block text-sm font-semibold text-[#344054] mb-1.5">
            Judul Pengadaan <span className="text-[#D92D20]">*</span>
          </label>
          <input
            id="edit-judul"
            name="judul"
            type="text"
            value={data.judul}
            onChange={(e) => setData('judul', e.target.value)}
            placeholder="Contoh: Pengadaan Printer Laboratorium"
            aria-invalid={Boolean(errors.judul)}
            aria-describedby={errors.judul ? 'judul-error' : 'judul-helper'}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#1D2939] placeholder-[#98A2B3] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] focus:ring-offset-1 ${
              errors.judul
                ? 'border-[#FDA29B]'
                : 'border-[#D0D5DD] focus:border-[#0E7C5A]'
            }`}
          />
          <p id="judul-helper" className="mt-1.5 text-xs text-[#667085]">
            Tulis judul yang singkat dan jelas sesuai barang atau jasa yang diajukan.
          </p>
          {errors.judul && (
            <p id="judul-error" className="mt-1.5 text-xs text-[#D92D20] font-medium" role="alert">
              {errors.judul}
            </p>
          )}
        </div>

        {/* Field Nominal / Estimasi Anggaran */}
        <div>
          <label htmlFor="edit-estimasi_anggaran" className="block text-sm font-semibold text-[#344054] mb-1.5">
            Nominal / Estimasi Anggaran <span className="text-[#D92D20]">*</span>
          </label>
          <MoneyInput
            id="edit-estimasi_anggaran"
            name="estimasi_anggaran"
            value={data.estimasi_anggaran}
            onChange={(val) => setData('estimasi_anggaran', val)}
            error={errors.estimasi_anggaran}
          />
        </div>

        {/* Field Upload Surat Permohonan */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-[#344054]">
            Upload Surat Permohonan <span className="text-[#D92D20]">*</span>
          </label>

          {/* Baris Berkas Saat Ini (Current File) */}
          {currentDokumen && (
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-[#E4EBE8] bg-[#F8FAF9]">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0 font-bold text-xs">
                  PDF
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold text-[#1D2939] truncate"
                    title={currentDokumen.nama_asli}
                  >
                    {currentDokumen.nama_asli}
                  </p>
                  <p className="text-xs text-[#667085]">
                    PDF · {formatBytes(currentDokumen.ukuran_bytes)}
                  </p>
                </div>
              </div>

              {onViewDokumen && (
                <button
                  type="button"
                  onClick={onViewDokumen}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F2F4F7] text-xs font-semibold text-[#344054] transition-colors shrink-0 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0E7C5A]"
                >
                  <Eye className="w-3.5 h-3.5 text-[#667085]" />
                  <span>Lihat</span>
                </button>
              )}
            </div>
          )}

          {/* Input File Tersembunyi */}
          <input
            ref={fileInputRef}
            id="edit-file_dokumen"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {/* Status Berkas Baru atau Dropzone */}
          {data.file_dokumen ? (
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-[#7FE0B8] bg-[#EEF5F2]">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-[#0E7C5A] text-white flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0E7C5A] text-white px-1.5 py-0.5 rounded">
                      File Baru
                    </span>
                    <p
                      className="text-sm font-semibold text-[#1D2939] truncate"
                      title={data.file_dokumen.name}
                    >
                      {data.file_dokumen.name}
                    </p>
                  </div>
                  <p className="text-xs text-[#667085] mt-0.5">
                    {formatBytes(data.file_dokumen.size)} · Berkas ini akan menggantikan versi sebelumnya
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pl-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-[#0E7C5A] hover:text-[#0B6348] px-2.5 py-1.5 rounded-lg border border-[#7FE0B8] bg-white transition-colors"
                >
                  Pilih Lain
                </button>
                <button
                  type="button"
                  onClick={handleRemoveNewFile}
                  className="w-8 h-8 rounded-lg text-[#667085] hover:text-[#B42318] hover:bg-[#FDECEC] flex items-center justify-center transition-colors"
                  title="Batalkan berkas baru"
                  aria-label="Batalkan berkas baru"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
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
              className={`flex flex-col items-center justify-center p-6 sm:p-7 rounded-2xl border-2 border-dashed transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] focus:ring-offset-2 ${
                isDragging
                  ? 'border-[#0E7C5A] bg-[#EEF5F2] scale-[0.99]'
                  : displayedFileError
                  ? 'border-[#FDA29B] bg-[#FDECEC]/30'
                  : 'border-[#7FE0B8] bg-[#EEF5F2]/50 hover:bg-[#EEF5F2]'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-2xs flex items-center justify-center text-[#0E7C5A] mb-2.5">
                <UploadCloud className="w-5 h-5 stroke-[2]" />
              </div>
              <p className="text-sm text-[#1D2939] text-center mb-1">
                <span className="font-semibold text-[#0E7C5A] hover:underline">
                  Klik untuk ganti file
                </span>{' '}
                atau drag & drop
              </p>
              <p className="text-xs text-[#5F6F6A] text-center">PDF (Maks 10MB)</p>
            </div>
          )}

          {displayedFileError && (
            <p className="mt-1.5 text-xs text-[#D92D20] font-medium" role="alert">
              {displayedFileError}
            </p>
          )}
        </div>

        {/* Footer Bar Formulir */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#F2F4F7]">
          <div className="flex items-center gap-2 text-xs text-[#5F6F6A]">
            <Info className="w-4 h-4 text-[#8A9A95] shrink-0" />
            <span>Permohonan akan diperiksa ulang oleh tim verifikasi.</span>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl font-semibold text-sm text-white bg-[#0E7C5A] hover:bg-[#0B6348] active:bg-[#09503A] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] focus:ring-offset-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengajukan Ulang...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 stroke-[2.2]" />
                <span>Ajukan Ulang</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PermohonanEditFormCard;

