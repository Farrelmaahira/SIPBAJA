import { useState, useRef, type FC, type FormEvent, type ChangeEvent, type DragEvent } from 'react';
import {
  Building2,
  Calendar,
  Upload,
  FileText,
  Eye,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import type { PpbjSimpanKontrakPayload } from '../../../types/ppbj';
import type { DokumenItem } from '../../../types/dokumen';
import MoneyInput from '../../molecules/MoneyInput';

export interface PelengkapPengadaanInlineFormProps {
  initialVendorNama?: string;
  initialBiayaRiil?: number | string;
  initialTanggalPengingat?: string;
  initialDokumenList?: Array<{
    id: number;
    nama_asli: string;
    tipe_dokumen: string;
    ukuran_bytes?: number;
    mime_type?: string;
    download_url?: string;
  }>;
  existingSingleDokumen?: {
    id: number;
    nama_asli: string;
    download_url?: string;
    tipe_dokumen?: string;
    ukuran_bytes?: number;
  } | null;
  isSubmitting?: boolean;
  onSubmit: (payload: PpbjSimpanKontrakPayload) => Promise<void> | void;
  onPreviewDokumen?: (doc: DokumenItem) => void;
  onCancel?: () => void;
  isUpdate?: boolean;
}

interface DocSlotConfig {
  key: 'surat_kontrak' | 'spk' | 'surat_pemesanan' | 'kwitansi' | 'invoice';
  payloadKey: 'dokumen_surat_kontrak' | 'dokumen_spk' | 'dokumen_surat_pemesanan' | 'dokumen_kwitansi' | 'dokumen_invoice';
  title: string;
  desc: string;
  matchTypes: string[];
}

const DOC_SLOTS: DocSlotConfig[] = [
  {
    key: 'surat_kontrak',
    payloadKey: 'dokumen_surat_kontrak',
    title: 'Surat Kontrak',
    desc: 'Dokumen perjanjian kontrak kerja',
    matchTypes: ['surat_kontrak', 'kontrak', 'dokumen_kontrak'],
  },
  {
    key: 'spk',
    payloadKey: 'dokumen_spk',
    title: 'SPK',
    desc: 'Surat Perintah Kerja (SPK)',
    matchTypes: ['spk', 'surat_spk'],
  },
  {
    key: 'surat_pemesanan',
    payloadKey: 'dokumen_surat_pemesanan',
    title: 'Surat Pemesanan',
    desc: 'Surat pemesanan barang / jasa',
    matchTypes: ['surat_pemesanan', 'surat_pesanan'],
  },
  {
    key: 'kwitansi',
    payloadKey: 'dokumen_kwitansi',
    title: 'Kwitansi',
    desc: 'Bukti pembayaran dari vendor',
    matchTypes: ['kwitansi', 'kuitansi'],
  },
  {
    key: 'invoice',
    payloadKey: 'dokumen_invoice',
    title: 'Invoice',
    desc: 'Tagihan resmi dari vendor',
    matchTypes: ['invoice', 'faktur'],
  },
];

export const PelengkapPengadaanInlineForm: FC<PelengkapPengadaanInlineFormProps> = ({
  initialVendorNama = '',
  initialBiayaRiil = '',
  initialTanggalPengingat = '',
  initialDokumenList = [],
  existingSingleDokumen = null,
  isSubmitting = false,
  onSubmit,
  onPreviewDokumen,
  onCancel,
  isUpdate = false,
}) => {
  const [vendorNama, setVendorNama] = useState<string>(initialVendorNama);
  const [biayaRiil, setBiayaRiil] = useState<number | string>(initialBiayaRiil || '');
  const [tanggalPengingat, setTanggalPengingat] = useState<string>(initialTanggalPengingat || '');

  // Files terpilih (baru)
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({
    dokumen_surat_kontrak: null,
    dokumen_spk: null,
    dokumen_surat_pemesanan: null,
    dokumen_kwitansi: null,
    dokumen_invoice: null,
  });

  // State drag-over per slot
  const [isDragOver, setIsDragOver] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRefs = {
    surat_kontrak: useRef<HTMLInputElement>(null),
    spk: useRef<HTMLInputElement>(null),
    surat_pemesanan: useRef<HTMLInputElement>(null),
    kwitansi: useRef<HTMLInputElement>(null),
    invoice: useRef<HTMLInputElement>(null),
  };

  // Helper mencari dokumen server yang cocok dengan slot
  const findExistingDoc = (slot: DocSlotConfig) => {
    const foundInList = initialDokumenList.find((doc) =>
      slot.matchTypes.some((mt) => doc.tipe_dokumen?.toLowerCase().includes(mt))
    );
    if (foundInList) return foundInList;

    // Fallback jika hanya ada 1 dokumen_kontrak default dan slot adalah surat_kontrak
    if (slot.key === 'surat_kontrak' && existingSingleDokumen) {
      return existingSingleDokumen;
    }
    return null;
  };

  const handleValidateAndSetFile = (payloadKey: string, file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMessage('Dokumen harus berformat PDF.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('Ukuran file maksimal 20 MB.');
      return;
    }
    setErrorMessage(null);
    setSelectedFiles((prev) => ({ ...prev, [payloadKey]: file }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, payloadKey: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleValidateAndSetFile(payloadKey, file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, payloadKey: string, slotKey: string) => {
    e.preventDefault();
    setIsDragOver((prev) => ({ ...prev, [slotKey]: false }));
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleValidateAndSetFile(payloadKey, file);
    }
  };

  const handleRemoveSelectedFile = (payloadKey: string) => {
    setSelectedFiles((prev) => ({ ...prev, [payloadKey]: null }));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${Math.round(kb)} KB`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!vendorNama.trim()) {
      setErrorMessage('Nama Rekanan Vendor wajib diisi.');
      return;
    }
    const nominalNum = Number(biayaRiil);
    if (!nominalNum || nominalNum <= 0) {
      setErrorMessage('Biaya Riil Pengadaan wajib diisi dan bernilai lebih dari 0.');
      return;
    }

    setErrorMessage(null);

    // Otomatis tentukan tipe utama berdasarkan dokumen yang ada / diupload
    let detectedType: string = 'SPK';
    if (selectedFiles.dokumen_surat_kontrak || findExistingDoc(DOC_SLOTS[0])) {
      detectedType = 'Kontrak';
    } else if (selectedFiles.dokumen_spk || findExistingDoc(DOC_SLOTS[1])) {
      detectedType = 'SPK';
    } else if (selectedFiles.dokumen_surat_pemesanan || findExistingDoc(DOC_SLOTS[2])) {
      detectedType = 'Surat Pesanan';
    } else if (selectedFiles.dokumen_kwitansi || findExistingDoc(DOC_SLOTS[3])) {
      detectedType = 'Kwitansi';
    } else if (selectedFiles.dokumen_invoice || findExistingDoc(DOC_SLOTS[4])) {
      detectedType = 'Invoice';
    }

    await onSubmit({
      tipe: detectedType,
      vendor_nama: vendorNama.trim(),
      nominal_kontrak: nominalNum,
      tanggal_reminder: tanggalPengingat || undefined,
      tanggal_jatuh_tempo: tanggalPengingat || undefined,
      dokumen_surat_kontrak: selectedFiles.dokumen_surat_kontrak,
      dokumen_spk: selectedFiles.dokumen_spk,
      dokumen_surat_pemesanan: selectedFiles.dokumen_surat_pemesanan,
      dokumen_kwitansi: selectedFiles.dokumen_kwitansi,
      dokumen_invoice: selectedFiles.dokumen_invoice,
    });
  };

  return (
    <section className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] p-6 transition-all">
      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] text-xs text-[#B42318] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SECTION 1: Data Pengadaan */}
        <div>
          <div className="pb-3 border-b border-[#F0F4F2] mb-4">
            <h3 className="text-base font-bold text-[#14201C]">Data Pengadaan</h3>
            <p className="text-xs text-[#5F6F6A] mt-0.5">Nama vendor dan biaya riil pengadaan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nama Vendor */}
            <div>
              <label className="block text-xs font-semibold text-[#14201C] mb-1.5">
                Nama Vendor <span className="text-[#D92D20]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#8A9A95]">
                  <Building2 className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={vendorNama}
                  onChange={(e) => setVendorNama(e.target.value)}
                  placeholder="Contoh: PT Sumber Teknologi Mandiri"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D0DDD7] bg-[#FAFCFB] text-sm text-[#14201C] placeholder:text-[#8A9A95] focus:outline-none focus:border-[#0E7C5A] focus:bg-white focus:ring-2 focus:ring-[#0E7C5A]/10 transition-all disabled:opacity-60"
                  required
                />
              </div>
            </div>

            {/* Biaya Riil */}
            <div>
              <label htmlFor="biaya_riil" className="block text-xs font-semibold text-[#14201C] mb-1.5">
                Biaya Riil <span className="text-[#D92D20]">*</span>
              </label>
              <MoneyInput
                id="biaya_riil"
                name="biaya_riil"
                value={biayaRiil}
                onChange={(val) => setBiayaRiil(val)}
                placeholder="Contoh: 888.000.000"
                disabled={isSubmitting}
              />
              </div>
          </div>
        </div>

        {/* SECTION 2: Dokumen Pengadaan & Pengingat */}
        <div>
          <div className="pb-3 border-b border-[#F0F4F2] mb-4">
            <h3 className="text-base font-bold text-[#14201C]">Dokumen Pengadaan</h3>
            <p className="text-xs text-[#5F6F6A] mt-0.5">
              Semua dokumen bersifat opsional. Atur juga waktu pengingat pengadaan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 5 Slot Dokumen */}
            {DOC_SLOTS.map((slot) => {
              const existingDoc = findExistingDoc(slot);
              const newFile = selectedFiles[slot.payloadKey];
              const isUploaded = Boolean(newFile || existingDoc);
              const dragActive = Boolean(isDragOver[slot.key]);

              return (
                <div
                  key={slot.key}
                  className="rounded-2xl border border-[#E4EBE8] bg-white p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(13,51,38,0.03)] hover:border-[#CFDDD7] transition-all"
                >
                  {/* Header Slot */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-[#14201C]">{slot.title}</h4>
                      {isUploaded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF7F2] text-[#0E7C5A]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Terunggah</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F0F4F2] text-[#5F6F6A]">
                          Belum diunggah
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5F6F6A] mb-3">{slot.desc}</p>
                  </div>

                  {/* Body Slot */}
                  <input
                    type="file"
                    ref={fileInputRefs[slot.key]}
                    accept=".pdf,application/pdf"
                    onChange={(e) => handleFileChange(e, slot.payloadKey)}
                    className="hidden"
                  />

                  {/* Jika sudah ada file yang dipilih (baru) atau sudah terunggah di server */}
                  {isUploaded ? (
                    <div className="rounded-xl border border-[#D0DDD7] bg-[#F7FBF9] p-3 flex flex-col justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-xs font-semibold text-[#14201C] truncate"
                            title={newFile?.name || existingDoc?.nama_asli}
                          >
                            {newFile?.name || existingDoc?.nama_asli}
                          </p>
                          <p className="text-[10px] text-[#5F6F6A] mt-0.5">
                            PDF •{' '}
                            {newFile
                              ? formatFileSize(newFile.size)
                              : formatFileSize(existingDoc?.ukuran_bytes) || 'Tersimpan'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#E4EBE8]">
                        {existingDoc && onPreviewDokumen && !newFile && (
                          <button
                            type="button"
                            onClick={() =>
                              onPreviewDokumen({
                                id: existingDoc.id,
                                nama_asli: existingDoc.nama_asli,
                                tipe_dokumen: existingDoc.tipe_dokumen || 'dokumen_kontrak',
                                ukuran_bytes: existingDoc.ukuran_bytes || 0,
                                mime_type: 'application/pdf',
                                download_url: existingDoc.download_url,
                              })
                            }
                            className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-[#D0DDD7] text-xs font-medium text-[#14201C] hover:bg-[#F0F4F2] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#5F6F6A]" />
                            <span>Lihat</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => fileInputRefs[slot.key].current?.click()}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-[#D0DDD7] text-xs font-medium text-[#0E7C5A] hover:bg-[#EBF7F2] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-[#0E7C5A]" />
                          <span>Ganti File</span>
                        </button>

                        {newFile && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectedFile(slot.payloadKey)}
                            className="p-1.5 rounded-lg bg-white border border-[#FECDCA] text-[#D92D20] hover:bg-[#FEF3F2] cursor-pointer transition-colors"
                            title="Batal pilih file"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Area Upload Drag & Drop */
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver((prev) => ({ ...prev, [slot.key]: true }));
                      }}
                      onDragLeave={() => {
                        setIsDragOver((prev) => ({ ...prev, [slot.key]: false }));
                      }}
                      onDrop={(e) => handleDrop(e, slot.payloadKey, slot.key)}
                      onClick={() => fileInputRefs[slot.key].current?.click()}
                      className={`h-[90px] rounded-xl border border-dashed flex flex-col items-center justify-center text-center p-3 cursor-pointer transition-all ${dragActive
                          ? 'border-[#0E7C5A] bg-[#EBF7F2]'
                          : 'border-[#D0DDD7] bg-[#FAFCFB] hover:border-[#0E7C5A] hover:bg-[#F7FBF9]'
                        }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-[#EBF7F2] text-[#0E7C5A] flex items-center justify-center mb-1">
                        <Upload className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[11px] font-semibold text-[#14201C]">
                        Klik untuk upload <span className="font-normal text-[#5F6F6A]">atau drag & drop</span>
                      </p>
                      <p className="text-[10px] text-[#8A9A95] mt-0.5">PDF, maksimal 20 MB</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Slot 6: Tanggal Pengingat */}
            <div className="rounded-2xl border border-[#E4EBE8] bg-white p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(13,51,38,0.03)] hover:border-[#CFDDD7] transition-all">
              <div>
                <h4 className="text-sm font-bold text-[#14201C] mb-1">Tanggal Pengingat</h4>
                <p className="text-[11px] text-[#5F6F6A] mb-3">
                  Atur pengingat untuk masa berlaku kontrak
                </p>
              </div>

              <div className="rounded-xl border border-[#D0DDD7] bg-[#FAFCFB] p-3 flex flex-col justify-center">
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#0E7C5A]">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    value={tanggalPengingat}
                    onChange={(e) => setTanggalPengingat(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D0DDD7] bg-white text-xs font-semibold text-[#14201C] focus:outline-none focus:border-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A]/10 transition-all cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-[#5F6F6A] text-center mt-2">
                  Pengingat dikirim pada tanggal ini
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#F0F4F2] flex items-center justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-[#D0DDD7] text-xs font-semibold text-[#5F6F6A] hover:bg-[#F0F4F2] hover:text-[#14201C] transition-colors cursor-pointer disabled:opacity-60"
            >
              Batal
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0B664A] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isUpdate ? 'Perbarui Data Pengadaan' : 'Simpan Data Pengadaan'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default PelengkapPengadaanInlineForm;
