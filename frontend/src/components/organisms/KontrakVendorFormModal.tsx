import { useState, type FC, type FormEvent, type ChangeEvent } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import FormField from '../molecules/FormField';
import MoneyInput from '../molecules/MoneyInput';
import type { PpbjSimpanKontrakPayload } from '../../types/ppbj';

export interface KontrakVendorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: PpbjSimpanKontrakPayload) => Promise<void> | void;
  initialData?: Partial<PpbjSimpanKontrakPayload> | null;
  isUpdate?: boolean;
  isSubmitting?: boolean;
}

export const KontrakVendorFormModal: FC<KontrakVendorFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isUpdate = false,
  isSubmitting = false,
}) => {
  const [tipe, setTipe] = useState<'Kontrak' | 'SPK' | 'Surat Pesanan' | 'Kwitansi'>(
    (initialData?.tipe as any) || 'SPK'
  );
  const [nomor, setNomor] = useState<string>(initialData?.nomor || '');
  const [tanggal, setTanggal] = useState<string>(initialData?.tanggal || '');
  const [vendorNama, setVendorNama] = useState<string>(initialData?.vendor_nama || '');
  const [nominalKontrak, setNominalKontrak] = useState<number>(
    Number(initialData?.nominal_kontrak) || 0
  );
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState<string>(
    initialData?.tanggal_jatuh_tempo || ''
  );
  const [tanggalReminder, setTanggalReminder] = useState<string>(
    initialData?.tanggal_reminder || ''
  );
  const [fileDokumen, setFileDokumen] = useState<File | null>(null);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrorLocal('Berkas instrumen pembelian harus berformat PDF.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorLocal('Ukuran berkas tidak boleh melebihi 10 MB.');
        return;
      }
      setErrorLocal(null);
      setFileDokumen(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nomor.trim()) {
      setErrorLocal('Nomor surat/kontrak wajib diisi.');
      return;
    }
    if (!vendorNama.trim()) {
      setErrorLocal('Nama rekanan vendor wajib diisi.');
      return;
    }
    if (nominalKontrak <= 0) {
      setErrorLocal('Nominal biaya riil harus lebih dari 0.');
      return;
    }
    if (!tanggal) {
      setErrorLocal('Tanggal dokumen pembelian wajib diisi.');
      return;
    }
    if (!tanggalJatuhTempo) {
      setErrorLocal('Tanggal jatuh tempo pembayaran wajib diisi.');
      return;
    }
    if (!tanggalReminder) {
      setErrorLocal('Tanggal pengingat (reminder) wajib diisi.');
      return;
    }

    setErrorLocal(null);
    await onSubmit({
      tipe,
      nomor,
      tanggal,
      vendor_nama: vendorNama,
      nominal_kontrak: nominalKontrak,
      tanggal_jatuh_tempo: tanggalJatuhTempo,
      tanggal_reminder: tanggalReminder,
      dokumen: fileDokumen,
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={isUpdate ? 'Perbarui Data Rekanan & Dokumen Pembelian' : 'Input Rekanan & Dokumen Pembelian'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorLocal && (
          <div className="p-3 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] flex items-center gap-2 text-xs font-semibold text-[#B42318]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorLocal}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tipe Instrumen Pembelian">
            <select
              value={tipe}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setTipe(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-medium text-[#14201C] focus:outline-none focus:ring-2 focus:ring-[#0E7C5A]"
            >
              <option value="SPK">Surat Perintah Kerja (SPK)</option>
              <option value="Kontrak">Surat Perjanjian / Kontrak</option>
              <option value="Surat Pesanan">Surat Pesanan</option>
              <option value="Kwitansi">Kwitansi / Bukti Pembelian</option>
            </select>
          </FormField>

          <FormField label={`Nomor ${tipe}`}>
            <input
              type="text"
              value={nomor}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNomor(e.target.value)}
              placeholder={`Contoh: 001/SPK/PBJ/${new Date().getFullYear()}`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-medium text-[#14201C] focus:outline-none focus:ring-2 focus:ring-[#0E7C5A]"
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nama Rekanan / Vendor">
            <input
              type="text"
              value={vendorNama}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setVendorNama(e.target.value)}
              placeholder="Contoh: PT Sumber Berkah Jaya"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-medium text-[#14201C] focus:outline-none focus:ring-2 focus:ring-[#0E7C5A]"
              required
            />
          </FormField>

          <FormField label="Biaya Riil / Nilai Kontrak (Rp)">
            <MoneyInput
              value={nominalKontrak}
              onChange={(val) => setNominalKontrak(typeof val === 'number' ? val : 0)}
              placeholder="Masukkan nominal biaya riil"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Tanggal Terbit">
            <input
              type="date"
              value={tanggal}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTanggal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-medium text-[#14201C] focus:outline-none focus:ring-2 focus:ring-[#0E7C5A]"
              required
            />
          </FormField>

          <FormField label="Jatuh Tempo Pembayaran">
            <input
              type="date"
              value={tanggalJatuhTempo}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTanggalJatuhTempo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-medium text-[#14201C] focus:outline-none focus:ring-2 focus:ring-[#0E7C5A]"
              required
            />
          </FormField>

          <FormField label="Jadwal Pengingat (Reminder)">
            <input
              type="date"
              value={tanggalReminder}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTanggalReminder(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-medium text-[#14201C] focus:outline-none focus:ring-2 focus:ring-[#0E7C5A]"
              required
            />
          </FormField>
        </div>

        {/* Upload Dokumen Pembelian (Opsional namun terstruktur) */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-[#14201C] mb-1.5">
            Unggah Berkas {tipe} (PDF, Opsional)
          </label>
          <div className="border-2 border-dashed border-[#CFDAD6] hover:border-[#0E7C5A] rounded-2xl p-4 transition-colors bg-[#F8FAF9] text-center">
            {fileDokumen ? (
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E4EBE8]">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0E7C5A]" />
                  <span className="text-xs font-semibold text-[#14201C] truncate max-w-[280px]">
                    {fileDokumen.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFileDokumen(null)}
                  className="p-1 text-[#5F6F6A] hover:text-[#B42318] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-6 h-6 text-[#0E7C5A]" />
                <span className="text-xs font-semibold text-[#0E7C5A]">Pilih berkas PDF atau seret ke sini</span>
                <span className="text-[11px] text-[#5F6F6A]">Maksimal 10 MB</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F4F2]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#0E7C5A] text-white hover:bg-[#0B664A] text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default KontrakVendorFormModal;
