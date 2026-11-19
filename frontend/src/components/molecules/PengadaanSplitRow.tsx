import { useRef, useState, type FC, type ChangeEvent, type DragEvent } from 'react';
import {
  Trash2,
  Upload,
  FileText,
  Eye,
  X,
  PenLine,
  ChevronDown,
  AlertCircle,
  Layers,
  ListChecks,
  Package,
} from 'lucide-react';

export interface PengadaanItem {
  permohonan_mak_id?: string | number;
  isLevelOverridden?: boolean;
  level_id?: string | number;
  dokumen?: File | null;
  nominal?: string | number;
  jenis_id?: string | number;
  metode_id?: string | number;
  pp_id?: string | number;
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
  perlu_review_pp?: boolean;
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
    label: `${m.kode ? m.kode + ' · ' : ''}${m.nama}`,
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

  const formatLevelLabel = (lvl: ReferenceItem): string => {
    if (lvl.nama === '<50jt') return '< 50 Juta';
    if (lvl.nama === '50-200jt') return '50 - 200 Juta';
    if (lvl.nama === '>200jt') return '> 200 Juta';
    return lvl.nama;
  };

  const levelOptions = (referenceData.level || []).map((l) => ({
    value: String(l.id),
    label: formatLevelLabel(l),
  }));

  const selectedLevel = (referenceData.level || []).find(
    (lvl) => String(lvl.id) === String(item.level_id)
  );

  const isLevel50to200jt = Boolean(
    selectedLevel?.perlu_review_pp ||
    (selectedLevel?.nama && selectedLevel.nama.includes('50-200')) ||
    (Number(selectedLevel?.min_nominal) === 50000000)
  );

  const handleLevelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const matched = (referenceData.level || []).find((l) => String(l.id) === String(val));
    let nom = item.nominal;
    if (!nom || Number(nom) === 0) {
      if (matched?.min_nominal && Number(matched.min_nominal) > 0) {
        nom = matched.min_nominal;
      } else if (matched?.max_nominal) {
        nom = matched.max_nominal;
      } else {
        nom = 50000000;
      }
    }
    onChange(index, {
      level_id: val,
      isLevelOverridden: true,
      nominal: nom,
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
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
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

  const fileExt = item.dokumen?.name
    ? item.dokumen.name.split('.').pop()?.toUpperCase() || 'PDF'
    : 'PDF';

  return (
    <div className="bg-white rounded-[24px] border border-[#E4EBE8] p-6 sm:p-7 flex flex-col gap-5 shadow-[0_2px_12px_rgba(13,51,38,0.03)] transition-all hover:border-[#CFDAD6] w-full">
      {/* Header Card: Dokumen Pengadaan N & Tombol Hapus */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#14201C] tracking-tight">
            Dokumen Pengadaan {index + 1}
          </h3>
          <p className="text-xs text-[#5F6F6A] mt-0.5">
            Tentukan level, metode, dan jenis; unggah dokumen, lalu pilih MAK dan penanggung jawab
          </p>
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-10 h-10 rounded-xl border border-[#E4EBE8] bg-white flex items-center justify-center text-[#5F6F6A] hover:text-[#D92D20] hover:border-[#FECDCA] hover:bg-[#FEF3F2] transition-colors shrink-0"
            title="Hapus baris pengadaan ini"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Row 1: Grid 3 Kolom (Level Pengadaan, Metode Pengadaan, Jenis Pengadaan) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kolom 1: Level Pengadaan */}
        <div>
          <label
            htmlFor={`level_${index}`}
            className="block text-xs font-semibold text-[#14201C] mb-1.5"
          >
            Level Pengadaan *
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Layers className="w-4 h-4 text-[#0E7C5A]" />
            </div>
            <select
              id={`level_${index}`}
              value={String(item.level_id || '')}
              onChange={handleLevelChange}
              className={`w-full min-h-[46px] rounded-xl bg-white border pl-10 pr-10 py-2.5 text-sm font-medium transition-all focus:outline-none focus:border-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A]/20 hover:border-[#CFDAD6] cursor-pointer appearance-none ${
                !item.level_id ? 'text-[#8A9A95]' : 'text-[#14201C]'
              } ${
                errors[`items.${index}.level_id`]
                  ? 'border-[#E5484D]'
                  : 'border-[#E4EBE8]'
              }`}
            >
              <option value="">Pilih level pengadaan</option>
              {levelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-4 h-4 text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
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

        {/* Kolom 2: Metode Pengadaan */}
        <div>
          <label
            htmlFor={`metode_${index}`}
            className="block text-xs font-semibold text-[#14201C] mb-1.5"
          >
            Metode Pengadaan *
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <ListChecks className="w-4 h-4 text-[#0E7C5A]" />
            </div>
            <select
              id={`metode_${index}`}
              value={String(item.metode_id || '')}
              onChange={(e) => onChange(index, 'metode_id', e.target.value)}
              className={`w-full min-h-[46px] rounded-xl bg-white border pl-10 pr-10 py-2.5 text-sm font-medium transition-all focus:outline-none focus:border-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A]/20 hover:border-[#CFDAD6] cursor-pointer appearance-none ${
                !item.metode_id ? 'text-[#8A9A95]' : 'text-[#14201C]'
              } ${
                errors[`items.${index}.metode_id`]
                  ? 'border-[#E5484D]'
                  : 'border-[#E4EBE8]'
              }`}
            >
              <option value="">Pilih metode pengadaan</option>
              {metodeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-4 h-4 text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
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

        {/* Kolom 3: Jenis Pengadaan */}
        <div>
          <label
            htmlFor={`jenis_${index}`}
            className="block text-xs font-semibold text-[#14201C] mb-1.5"
          >
            Jenis Pengadaan *
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Package className="w-4 h-4 text-[#0E7C5A]" />
            </div>
            <select
              id={`jenis_${index}`}
              value={String(item.jenis_id || '')}
              onChange={(e) => onChange(index, 'jenis_id', e.target.value)}
              className={`w-full min-h-[46px] rounded-xl bg-white border pl-10 pr-10 py-2.5 text-sm font-medium transition-all focus:outline-none focus:border-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A]/20 hover:border-[#CFDAD6] cursor-pointer appearance-none ${
                !item.jenis_id ? 'text-[#8A9A95]' : 'text-[#14201C]'
              } ${
                errors[`items.${index}.jenis_id`]
                  ? 'border-[#E5484D]'
                  : 'border-[#E4EBE8]'
              }`}
            >
              <option value="">Pilih jenis pengadaan</option>
              {jenisOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-4 h-4 text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
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
      </div>

      {/* Row 2: Dokumen Pengadaan (Full Width) */}
      <div>
        <label className="block text-xs font-semibold text-[#14201C] mb-1.5">
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
            <div className="w-10 h-10 rounded-full bg-[#E5F2ED] text-[#0E7C5A] flex items-center justify-center mb-2">
              <Upload className="w-5 h-5 stroke-[2.2]" />
            </div>
            <p className="text-sm font-semibold text-[#14201C] mb-1">
              Seret &amp; lepas dokumen pengadaan di sini
            </p>
            <p className="text-xs text-[#5F6F6A] mb-3">
              Format PDF, DOC, atau DOCX, maksimal 20 MB
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="min-h-[34px] px-4 py-1.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] shadow-xs hover:bg-[#F9FAFB] transition-colors cursor-pointer"
            >
              Pilih File
            </button>
          </div>
        ) : (
          /* Preview file jika sudah diunggah sesuai screenshot */
          <div className="border border-[#E4EBE8] rounded-2xl bg-[#F8FAF9]/60 p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
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
              </div>

              <button
                type="button"
                onClick={() => onChange(index, 'dokumen', null)}
                className="w-8 h-8 rounded-lg text-[#5F6F6A] hover:text-[#D92D20] hover:bg-[#FEE4E2]/50 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                title="Hapus dokumen ini"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tombol Lihat dan Ganti File */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handlePreview(item.dokumen as File)}
                className="min-h-[42px] px-4 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-sm font-semibold text-[#344054] hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#0E7C5A]" />
                <span>Lihat</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[42px] px-4 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-sm font-semibold text-[#344054] hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#5F6F6A]" />
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

      {/* Row 3: Grid 3 Kolom (MAK, Penanggung Jawab MAK, Penanggung Jawab PP) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kolom 1: MAK */}
        <div>
          <label
            htmlFor={`mak_${index}`}
            className="block text-xs font-semibold text-[#14201C] mb-1.5"
          >
            MAK
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <PenLine className="w-4 h-4 text-[#0E7C5A]" />
            </div>
            <select
              id={`mak_${index}`}
              value={String(item.permohonan_mak_id || '')}
              onChange={(e) =>
                onChange(index, 'permohonan_mak_id', e.target.value)
              }
              className={`w-full min-h-[46px] rounded-xl bg-white border pl-10 pr-10 py-2.5 text-sm font-medium transition-all focus:outline-none focus:border-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A]/20 hover:border-[#CFDAD6] cursor-pointer appearance-none ${
                !item.permohonan_mak_id ? 'text-[#8A9A95]' : 'text-[#14201C]'
              } ${
                errors[`items.${index}.permohonan_mak_id`]
                  ? 'border-[#E5484D]'
                  : 'border-[#E4EBE8]'
              }`}
            >
              <option value="">Pilih MAK</option>
              {makOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-4 h-4 text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          </div>
          {errors[`items.${index}.permohonan_mak_id`] && (
            <p className="mt-1 text-xs text-[#D92D20] font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors[`items.${index}.permohonan_mak_id`]}</span>
            </p>
          )}
        </div>

        {/* Kolom 2: Penanggung Jawab MAK (PPK) */}
        <div>
          <label className="block text-xs font-semibold text-[#14201C] mb-1.5">
            Penanggung Jawab MAK (PPK)
          </label>
          <div className="relative">
            <div className="w-full min-h-[46px] rounded-xl bg-white border border-[#E4EBE8] pl-10 pr-10 py-2.5 flex items-center">
              <PenLine className="w-4 h-4 text-[#0E7C5A] absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
              <span
                className={`text-sm font-medium truncate ${
                  selectedMak ? 'text-[#14201C]' : 'text-[#8A9A95]'
                }`}
              >
                {selectedMak ? `${selectedMak.ppk_nama} · PPK` : 'Pilih MAK terlebih dahulu'}
              </span>
              <ChevronDown
                className="w-4 h-4 text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Kolom 3: Penanggung Jawab PP */}
        <div>
          <label className="block text-xs font-semibold text-[#14201C] mb-1.5">
            Penanggung Jawab PP
          </label>
          <div className="relative">
            {isLevel50to200jt ? (
              <div className="relative">
                <PenLine className="w-4 h-4 text-[#0E7C5A] absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                <select
                  value={String(item.pp_id || '')}
                  onChange={(e) => onChange(index, 'pp_id', e.target.value)}
                  className="w-full min-h-[46px] rounded-xl bg-white border border-[#E4EBE8] pl-10 pr-10 py-2.5 text-sm font-medium text-[#14201C] transition-all focus:outline-none focus:border-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A]/20 hover:border-[#CFDAD6] cursor-pointer appearance-none"
                >
                  <option value="">Pilih penanggung jawab PP</option>
                  <option value="pp_otomatis">Pejabat Pengadaan (PP)</option>
                </select>
                <ChevronDown
                  className="w-4 h-4 text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            ) : (
              <div className="w-full min-h-[46px] rounded-xl bg-[#F8FAF9] border border-[#E4EBE8] pl-10 pr-10 py-2.5 flex items-center cursor-not-allowed">
                <PenLine className="w-4 h-4 text-[#8A9A95] absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                <span className="text-sm font-medium text-[#8A9A95] truncate">
                  Pilih penanggung jawab PP
                </span>
                <ChevronDown
                  className="w-4 h-4 text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-[#5F6F6A] mt-1.5">
            Aktif jika level pengadaan 50-200 juta
          </p>
        </div>
      </div>
    </div>
  );
};

export default PengadaanSplitRow;
