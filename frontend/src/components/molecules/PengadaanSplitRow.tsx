import { useRef, useState, type FC, type ChangeEvent, type DragEvent } from 'react';
import {
  Trash2,
  Upload,
  FileText,
  Check,
  Eye,
  RefreshCw,
  X,
  PenLine,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

export interface PengadaanItem {
  permohonan_mak_id?: string | number;
  isLevelOverridden?: boolean;
  level_id?: string | number;
  dokumen?: File | null;
  nominal?: string | number;
  jenis_id?: string | number;
  metode_id?: string | number;
  [key: string]: unknown;
}

export interface AvailableMak {
  permohonan_mak_id: string | number;
  kode?: string;
  nama: string;
  ppk_nama?: string;
}

export interface ReferenceItem {
  id: string | number;
  nama: string;
  min_nominal?: number | string;
  max_nominal?: number | string | null;
}

export interface ReferenceData {
  jenis?: ReferenceItem[];
  metode?: ReferenceItem[];
  level?: ReferenceItem[];
}

export interface PengadaanSplitRowProps {
  index: number;
  item: PengadaanItem;
  availableMak?: AvailableMak[];
  referenceData?: ReferenceData;
  onChange: (index: number, fieldOrUpdates: string | Record<string, unknown>, value?: unknown) => void;
  onRemove: (index: number) => void;
  canRemove?: boolean;
  errors?: Record<string, string>;
}

export const PengadaanSplitRow: FC<PengadaanSplitRowProps> = ({
  index,
  item,
  availableMak = [],
  referenceData = {},
  onChange,
  onRemove,
  canRemove = false,
  errors = {},
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const selectedMak = availableMak.find(
    (m) => String(m.permohonan_mak_id) === String(item.permohonan_mak_id)
  );

  const makOptions = availableMak.map((m) => ({
    value: String(m.permohonan_mak_id),
    label: `${m.kode ? m.kode + ' - ' : ''}${m.nama}`,
    ppk: m.ppk_nama,
    kode: m.kode || m.nama,
  }));

  const jenisOptions = (referenceData.jenis || []).map((j) => ({
    value: String(j.id),
    label: j.nama,
  }));

  const metodeOptions = (referenceData.metode || []).map((m) => ({
    value: String(m.id),
    label: m.nama,
  }));

  const levelOptions = (referenceData.level || []).map((l) => ({
    value: String(l.id),
    label: `${l.nama} (${formatRupiah(l.min_nominal)}${
      l.max_nominal ? ' s.d. ' + formatRupiah(l.max_nominal) : ' ke atas'
    })`,
  }));

  const handleNominalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const updates: Record<string, unknown> = { nominal: rawValue };

    // Auto-resolve level jika pengguna belum meng-override secara eksplisit
    if (!item.isLevelOverridden && referenceData.level) {
      const num = parseFloat(rawValue) || 0;
      const matchedLevel = referenceData.level.find((lvl) => {
        const min = parseFloat(String(lvl.min_nominal ?? 0));
        const max = lvl.max_nominal !== null && lvl.max_nominal !== undefined ? parseFloat(String(lvl.max_nominal)) : null;
        return max !== null ? num >= min && num <= max : num >= min;
      });

      if (matchedLevel) {
        updates.level_id = String(matchedLevel.id);
      }
    }

    onChange(index, updates);
  };

  const handleLevelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(index, {
      isLevelOverridden: true,
      level_id: e.target.value,
    });
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    onChange(index, 'dokumen', file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  };

  const handlePreview = (file: File) => {
    if (!file) return;
    try {
      const blobUrl = URL.createObjectURL(file);
      window.open(blobUrl, '_blank');
    } catch {
      alert('Tidak dapat membuka pratinjau dokumen.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || isNaN(bytes)) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDisplayRupiah = (val?: string | number): string => {
    if (!val || val === '') return '';
    const num = parseFloat(String(val));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // Deteksi ekstensi file & ukuran valid
  const fileExt = item.dokumen?.name
    ? item.dokumen.name.split('.').pop()?.toUpperCase() || 'PDF'
    : 'PDF';
  const isUnder20Mb = item.dokumen?.size
    ? item.dokumen.size <= 20 * 1024 * 1024
    : true;

  return (
    <div className="bg-white rounded-[24px] border border-[#E4EBE8] p-6 flex flex-col gap-5 shadow-[0_2px_12px_rgba(13,51,38,0.03)] transition-all hover:border-[#CFDAD6]">
      {/* Header Card: Dokumen Pengadaan N & Tombol Hapus */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#14201C] tracking-tight">
            Dokumen Pengadaan {index + 1}
          </h3>
          <p className="text-xs text-[#5F6F6A] mt-0.5">
            Unggah dokumen, lalu pilih MAK dan penanggung jawab
          </p>
        </div>

        {canRemove ? (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-10 h-10 rounded-xl border border-[#E4EBE8] bg-white flex items-center justify-center text-[#5F6F6A] hover:text-[#D92D20] hover:border-[#FECDCA] hover:bg-[#FEF3F2] transition-colors"
            title="Hapus baris pengadaan ini"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-10 h-10 rounded-xl border border-[#F0F4F2] bg-[#FAFBFB] flex items-center justify-center text-[#D0D5DD] cursor-not-allowed">
            <Trash2 className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Field 1: Dokumen Pengadaan */}
      <div>
        <label className="block text-xs font-semibold text-[#14201C] mb-2">
          Dokumen Pengadaan
        </label>

        {/* Input file tersembunyi */}
        <input
          ref={fileInputRef}
          id={`dokumen_${index}`}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        {!item.dokumen ? (
          /* Dropzone jika belum ada file */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#0E7C5A] bg-[#EBF7F2]'
                : 'border-[#CFE4DC] bg-[#F7FAF8] hover:bg-[#F2F8F5]'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#E5F2ED] text-[#0E7C5A] flex items-center justify-center mb-3">
              <Upload className="w-5 h-5 stroke-[2.2]" />
            </div>
            <p className="text-sm font-semibold text-[#14201C] mb-1">
              Seret &amp; lepas dokumen pengadaan di sini
            </p>
            <p className="text-xs text-[#5F6F6A] mb-3.5">
              Format PDF, maksimal 20 MB
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="min-h-[34px] px-4 py-1.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] shadow-xs hover:bg-[#F9FAFB] transition-colors"
            >
              Pilih File
            </button>
          </div>
        ) : (
          /* Preview file jika sudah diunggah */
          <div className="border border-[#E4EBE8] rounded-2xl bg-white p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-bold text-[#14201C] truncate"
                  title={item.dokumen.name}
                >
                  {item.dokumen.name}
                </p>
                <p className="text-xs text-[#5F6F6A] mt-0.5">
                  {fileExt} • {formatFileSize(item.dokumen.size)} • Siap diunggah
                </p>
              </div>

              <button
                type="button"
                onClick={() => onChange(index, 'dokumen', null)}
                className="w-8 h-8 rounded-lg text-[#5F6F6A] hover:text-[#D92D20] hover:bg-[#FEE4E2]/50 flex items-center justify-center transition-colors"
                title="Hapus dokumen ini"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#027A48] bg-[#ECFDF3] border border-[#ABEFC6] px-2.5 py-0.5 rounded-full">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                Format {fileExt} valid
              </span>

              {isUnder20Mb ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#027A48] bg-[#ECFDF3] border border-[#ABEFC6] px-2.5 py-0.5 rounded-full">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  Ukuran sesuai batas 20 MB
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA] px-2.5 py-0.5 rounded-full">
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  Ukuran melebihi batas 20 MB
                </span>
              )}
            </div>

            {/* Action Buttons: Lihat & Ganti File */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handlePreview(item.dokumen as File)}
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Eye className="w-4 h-4 text-[#5F6F6A]" />
                <span>Lihat</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#5F6F6A]" />
                <span>Ganti File</span>
              </button>
            </div>
          </div>
        )}

        {errors[`items.${index}.dokumen`] && (
          <p className="mt-1.5 text-xs text-[#D92D20] font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors[`items.${index}.dokumen`]}</span>
          </p>
        )}
      </div>

      {/* Field 2: MAK */}
      <div>
        <label
          htmlFor={`mak_${index}`}
          className="block text-xs font-semibold text-[#14201C] mb-1.5"
        >
          MAK
        </label>
        <div className="relative">
          <div
            className={`w-full min-h-[44px] rounded-xl bg-white border pl-3.5 pr-10 py-2.5 flex items-center gap-2.5 transition-all focus-within:border-[#0E7C5A] focus-within:ring-2 focus-within:ring-[#0E7C5A]/20 hover:border-[#CFDAD6] ${
              errors[`items.${index}.permohonan_mak_id`]
                ? 'border-[#E5484D]'
                : 'border-[#E4EBE8]'
            }`}
          >
            {item.permohonan_mak_id && (
              <PenLine className="w-4 h-4 text-[#0E7C5A] shrink-0" />
            )}
            <select
              id={`mak_${index}`}
              value={String(item.permohonan_mak_id || '')}
              onChange={(e) =>
                onChange(index, 'permohonan_mak_id', e.target.value)
              }
              className={`w-full bg-transparent text-sm font-medium focus:outline-none cursor-pointer appearance-none ${
                !item.permohonan_mak_id
                  ? 'text-[#8A9A95]'
                  : 'text-[#14201C]'
              }`}
            >
              <option value="">Pilih MAK</option>
              {makOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <ChevronDown
            className="w-[18px] h-[18px] text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
        </div>
        <p className="text-[11px] text-[#5F6F6A] mt-1.5">
          Pilihan MAK terfilter dari Jenis MAK yang ditetapkan Perencanaan.
        </p>
        {errors[`items.${index}.permohonan_mak_id`] && (
          <p className="mt-1 text-xs text-[#D92D20] font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors[`items.${index}.permohonan_mak_id`]}</span>
          </p>
        )}
      </div>

      {/* Field 3: Penanggung Jawab */}
      <div>
        <label className="block text-xs font-semibold text-[#14201C] mb-1.5">
          Penanggung Jawab
        </label>
        <div className="w-full min-h-[44px] rounded-xl bg-[#F7FAF9] border border-[#E4EBE8] px-3.5 py-2.5 flex items-center gap-2.5">
          {selectedMak ? (
            <>
              <PenLine className="w-4 h-4 text-[#0E7C5A] shrink-0" />
              <span className="text-sm font-semibold text-[#14201C] truncate">
                {selectedMak.ppk_nama} - Penanggung Jawab MAK{' '}
                {selectedMak.kode || selectedMak.nama}
              </span>
            </>
          ) : (
            <span className="text-sm text-[#8A9A95]">
              Pilih MAK terlebih dahulu
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#5F6F6A] mt-1.5">
          Penanggung jawab terisi otomatis sesuai MAK yang dipilih.
        </p>
      </div>

      {/* Field 4: Nominal Paket Pengadaan (Rp) */}
      <div>
        <label
          htmlFor={`nominal_${index}`}
          className="block text-xs font-semibold text-[#14201C] mb-1.5"
        >
          Nominal Pengadaan (Rp) *
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#5F6F6A] pointer-events-none select-none">
            Rp
          </span>
          <input
            id={`nominal_${index}`}
            type="text"
            inputMode="numeric"
            value={formatDisplayRupiah(item.nominal)}
            onChange={handleNominalChange}
            placeholder="0"
            className={`w-full min-h-[44px] rounded-xl bg-white border pl-11 pr-3.5 py-2.5 text-sm font-semibold text-[#14201C] transition-all focus:outline-none focus:border-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A]/20 hover:border-[#CFDAD6] placeholder:text-[#8A9A95] ${
              errors[`items.${index}.nominal`]
                ? 'border-[#E5484D]'
                : 'border-[#E4EBE8]'
            }`}
          />
        </div>
        <p className="text-[11px] text-[#5F6F6A] mt-1.5">
          Nominal alokasi anggaran untuk paket pengadaan ini.
        </p>
        {errors[`items.${index}.nominal`] && (
          <p className="mt-1 text-xs text-[#D92D20] font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors[`items.${index}.nominal`]}</span>
          </p>
        )}
      </div>

      {/* Field 5 & 6: Jenis Pengadaan & Metode Pengadaan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Jenis Pengadaan */}
        <div>
          <label
            htmlFor={`jenis_${index}`}
            className="block text-xs font-semibold text-[#14201C] mb-1.5"
          >
            Jenis Pengadaan *
          </label>
          <div className="relative">
            <select
              id={`jenis_${index}`}
              value={String(item.jenis_id || '')}
              onChange={(e) => onChange(index, 'jenis_id', e.target.value)}
              className={`w-full min-h-[44px] appearance-none rounded-xl bg-white border pl-3.5 pr-10 py-2.5 text-sm font-medium transition-all focus:outline-none focus:border-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A]/20 hover:border-[#CFDAD6] cursor-pointer ${
                !item.jenis_id ? 'text-[#8A9A95]' : 'text-[#14201C]'
              } ${
                errors[`items.${index}.jenis_id`]
                  ? 'border-[#E5484D]'
                  : 'border-[#E4EBE8]'
              }`}
            >
              <option value="">Pilih Jenis</option>
              {jenisOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-[18px] h-[18px] text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          </div>
          {errors[`items.${index}.jenis_id`] && (
            <p className="mt-1 text-xs text-[#D92D20] font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors[`items.${index}.jenis_id`]}</span>
            </p>
          )}
        </div>

        {/* Metode Pengadaan */}
        <div>
          <label
            htmlFor={`metode_${index}`}
            className="block text-xs font-semibold text-[#14201C] mb-1.5"
          >
            Metode Pengadaan *
          </label>
          <div className="relative">
            <select
              id={`metode_${index}`}
              value={String(item.metode_id || '')}
              onChange={(e) =>
                onChange(index, 'metode_id', e.target.value)
              }
              className={`w-full min-h-[44px] appearance-none rounded-xl bg-white border pl-3.5 pr-10 py-2.5 text-sm font-medium transition-all focus:outline-none focus:border-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A]/20 hover:border-[#CFDAD6] cursor-pointer ${
                !item.metode_id ? 'text-[#8A9A95]' : 'text-[#14201C]'
              } ${
                errors[`items.${index}.metode_id`]
                  ? 'border-[#E5484D]'
                  : 'border-[#E4EBE8]'
              }`}
            >
              <option value="">Pilih Metode</option>
              {metodeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-[18px] h-[18px] text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          </div>
          {errors[`items.${index}.metode_id`] && (
            <p className="mt-1 text-xs text-[#D92D20] font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors[`items.${index}.metode_id`]}</span>
            </p>
          )}
        </div>
      </div>

      {/* Field 7: Level Pengadaan */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor={`level_${index}`}
            className="block text-xs font-semibold text-[#14201C]"
          >
            Level Pengadaan
          </label>
          {item.isLevelOverridden ? (
            <span className="text-[11px] font-semibold text-[#B54708] bg-[#FEF6EE] px-2 py-0.5 rounded-full border border-[#FECDCA]">
              Override Manual
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-[#0E7C5A] bg-[#EBF7F2] px-2 py-0.5 rounded-full border border-[#D0EAE0]">
              Otomatis Sesuai Nominal
            </span>
          )}
        </div>
        <div className="relative">
          <select
            id={`level_${index}`}
            value={String(item.level_id || '')}
            onChange={handleLevelChange}
            className={`w-full min-h-[44px] appearance-none rounded-xl bg-white border pl-3.5 pr-10 py-2.5 text-sm font-medium transition-all focus:outline-none focus:border-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A]/20 hover:border-[#CFDAD6] cursor-pointer ${
              !item.level_id ? 'text-[#8A9A95]' : 'text-[#14201C]'
            } ${
              errors[`items.${index}.level_id`]
                ? 'border-[#E5484D]'
                : 'border-[#E4EBE8]'
            }`}
          >
            <option value="">Pilih Level (Otomatis)</option>
            {levelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="w-[18px] h-[18px] text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
        </div>
        {errors[`items.${index}.level_id`] && (
          <p className="mt-1 text-xs text-[#D92D20] font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors[`items.${index}.level_id`]}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default PengadaanSplitRow;
