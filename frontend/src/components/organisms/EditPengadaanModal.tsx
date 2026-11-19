import { useState, type FC, type FormEvent, type ChangeEvent } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import FormField from '../molecules/FormField';
import type { PpbjUpdateKlasifikasiPayload, PpbjReferenceOption } from '../../types/ppbj';

export interface EditPengadaanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: PpbjUpdateKlasifikasiPayload) => Promise<void> | void;
  initialData?: {
    permohonan_mak_id?: number | string;
    jenis_id?: number | string;
    metode_id?: number | string;
    level_id?: number | string;
    nominal?: number | string;
  } | null;
  availableMak?: Array<{ id: number; nama: string; kode?: string }>;
  referenceData?: {
    jenis?: PpbjReferenceOption[];
    metode?: PpbjReferenceOption[];
    level?: PpbjReferenceOption[];
  };
  isSubmitting?: boolean;
}

export const EditPengadaanModal: FC<EditPengadaanModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  availableMak = [],
  referenceData = {},
  isSubmitting = false,
}) => {
  const [permohonanMakId, setPermohonanMakId] = useState<string>(
    String(initialData?.permohonan_mak_id || availableMak[0]?.id || '')
  );
  const [jenisId, setJenisId] = useState<string>(
    String(initialData?.jenis_id || referenceData.jenis?.[0]?.id || '')
  );
  const [metodeId, setMetodeId] = useState<string>(
    String(initialData?.metode_id || referenceData.metode?.[0]?.id || '')
  );
  const [levelId, setLevelId] = useState<string>(
    String(initialData?.level_id || referenceData.level?.[0]?.id || '')
  );
  const [fileDokumen, setFileDokumen] = useState<File | null>(null);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrorLocal('Dokumen pengadaan harus berupa PDF.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorLocal('Ukuran berkas dokumen pengadaan maksimal 10 MB.');
        return;
      }
      setErrorLocal(null);
      setFileDokumen(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!permohonanMakId) {
      setErrorLocal('Mata anggaran (MAK) wajib dipilih.');
      return;
    }
    if (!jenisId) {
      setErrorLocal('Jenis pengadaan wajib dipilih.');
      return;
    }
    if (!metodeId) {
      setErrorLocal('Metode pengadaan wajib dipilih.');
      return;
    }
    if (!levelId) {
      setErrorLocal('Tingkat level pengadaan wajib dipilih.');
      return;
    }

    setErrorLocal(null);
    await onSubmit({
      permohonan_mak_id: permohonanMakId,
      jenis_id: jenisId,
      metode_id: metodeId,
      level_id: levelId,
      dokumen: fileDokumen,
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Perbarui Klasifikasi & Dokumen Pengadaan"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorLocal && (
          <div className="p-3 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] flex items-center gap-2 text-xs font-semibold text-[#B42318]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorLocal}</span>
          </div>
        )}

        <FormField label="Mata Anggaran (MAK)">
          <select
            value={permohonanMakId}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setPermohonanMakId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-medium text-[#14201C] focus:outline-none focus:ring-2 focus:ring-[#0E7C5A]"
          >
            {availableMak.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {m.nama}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Jenis Pengadaan">
            <select
              value={jenisId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setJenisId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-medium text-[#14201C] focus:outline-none focus:ring-2 focus:ring-[#0E7C5A]"
            >
              {(referenceData.jenis || []).map((j) => (
                <option key={j.id} value={String(j.id)}>
                  {j.nama}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Metode Pengadaan">
            <select
              value={metodeId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setMetodeId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-medium text-[#14201C] focus:outline-none focus:ring-2 focus:ring-[#0E7C5A]"
            >
              {(referenceData.metode || []).map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.nama}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Level Pengadaan">
            <select
              value={levelId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setLevelId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-medium text-[#14201C] focus:outline-none focus:ring-2 focus:ring-[#0E7C5A]"
            >
              {(referenceData.level || []).map((l) => (
                <option key={l.id} value={String(l.id)}>
                  {l.nama}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#14201C] mb-1.5">
            Unggah Ulang Dokumen Pengadaan (Opsional, PDF max 10MB)
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
                <span className="text-xs font-semibold text-[#0E7C5A]">Pilih berkas dokumen pengadaan baru</span>
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
            {isSubmitting ? 'Menyimpan...' : 'Perbarui Pengadaan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPengadaanModal;
