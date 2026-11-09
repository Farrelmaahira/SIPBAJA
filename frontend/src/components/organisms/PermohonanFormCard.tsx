import type { FC, FormEvent } from 'react';
import { FileText, Info, Send, Loader2 } from 'lucide-react';
import DropzoneUpload from '../atoms/DropzoneUpload';
import MoneyInput from '../molecules/MoneyInput';

export interface PermohonanFormData {
  judul: string;
  estimasi_anggaran: number | string;
  file_dokumen: File | null;
}

export interface PermohonanFormErrors {
  judul?: string;
  estimasi_anggaran?: string;
  file_dokumen?: string;
}

export interface PermohonanFormCardProps {
  data: PermohonanFormData;
  setData: (field: keyof PermohonanFormData, value: any) => void;
  errors: PermohonanFormErrors;
  processing?: boolean;
  onSubmit: (e: FormEvent) => void;
}

export const PermohonanFormCard: FC<PermohonanFormCardProps> = ({
  data,
  setData,
  errors,
  processing = false,
  onSubmit,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E4EBE8] p-6 lg:p-8 shadow-sm">
      {/* Header Section */}
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
        {/* Field: Judul Pengadaan */}
        <div>
          <label htmlFor="judul" className="block text-sm font-semibold text-[#344054] mb-1.5">
            Judul Pengadaan <span className="text-[#D92D20]">*</span>
          </label>
          <input
            id="judul"
            name="judul"
            type="text"
            value={data.judul}
            onChange={(e) => setData('judul', e.target.value)}
            placeholder="Contoh: Pengadaan Komputer Lab"
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

        {/* Field: Nominal / Estimasi Anggaran */}
        <div>
          <label htmlFor="estimasi_anggaran" className="block text-sm font-semibold text-[#344054] mb-1.5">
            Nominal / Estimasi Anggaran <span className="text-[#D92D20]">*</span>
          </label>
          <MoneyInput
            id="estimasi_anggaran"
            name="estimasi_anggaran"
            value={data.estimasi_anggaran}
            onChange={(val) => setData('estimasi_anggaran', val)}
            error={errors.estimasi_anggaran}
          />
        </div>

        {/* Field: Upload Surat Permohonan */}
        <div>
          <label htmlFor="file_dokumen" className="block text-sm font-semibold text-[#344054] mb-1.5">
            Upload Surat Permohonan <span className="text-[#D92D20]">*</span>
          </label>
          <DropzoneUpload
            id="file_dokumen"
            file={data.file_dokumen}
            onChange={(file) => setData('file_dokumen', file)}
            error={errors.file_dokumen}
            maxSizeMb={10}
          />
        </div>

        {/* Footer Bar: Petunjuk & Tombol Aksi */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#F2F4F7]">
          <div className="flex items-center gap-2 text-xs text-[#667085]">
            <Info className="w-4 h-4 text-[#98A2B3] shrink-0" />
            <span>Permohonan diteruskan ke tim verifikasi setelah dikirim.</span>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#0E7C5A] hover:bg-[#0B6348] active:bg-[#09503A] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] focus:ring-offset-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 stroke-[2]" />
                <span>Kirim Permohonan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PermohonanFormCard;
