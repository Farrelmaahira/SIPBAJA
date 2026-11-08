import type { FC, FormEvent } from 'react';
import { X, Tag } from 'lucide-react';
import type { PpkOption } from '../../types/perencanaan';

export interface JenisMakFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  kode: string;
  nama: string;
  ppkUserId: number;
  ppkOptions?: PpkOption[];
  processing?: boolean;
  onClose: () => void;
  onKodeChange: (val: string) => void;
  onNamaChange: (val: string) => void;
  onPpkChange: (val: number) => void;
  onSubmit: (e: FormEvent) => void;
}

export const JenisMakFormModal: FC<JenisMakFormModalProps> = ({
  isOpen,
  isEdit,
  kode,
  nama,
  ppkUserId,
  ppkOptions = [],
  processing = false,
  onClose,
  onKodeChange,
  onNamaChange,
  onPpkChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-xl w-full max-w-[480px] p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#14201C]">
              {isEdit ? 'Edit Jenis MAK' : 'Tambah Jenis MAK'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8A9A95] hover:text-[#14201C] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#14201C] mb-1">Kode MAK</label>
          <input
            type="text"
            required
            value={kode}
            onChange={(e) => onKodeChange(e.target.value)}
            placeholder="Contoh: 532111"
            className="w-full px-3 py-2 border border-[#E4EBE8] rounded-xl text-xs bg-[#FAFCFB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E7C5A] text-[#14201C]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#14201C] mb-1">Nama MAK</label>
          <input
            type="text"
            required
            value={nama}
            onChange={(e) => onNamaChange(e.target.value)}
            placeholder="Contoh: Belanja Modal Peralatan dan Mesin"
            className="w-full px-3 py-2 border border-[#E4EBE8] rounded-xl text-xs bg-[#FAFCFB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E7C5A] text-[#14201C]"
          />
        </div>

        {ppkOptions.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-[#14201C] mb-1">
              PPK Penanggung Jawab
            </label>
            <select
              value={ppkUserId}
              onChange={(e) => onPpkChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[#E4EBE8] rounded-xl text-xs bg-[#FAFCFB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E7C5A] text-[#14201C]"
            >
              {ppkOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.nama} ({opt.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F4F2]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#5F6F6A] hover:bg-[#F4F7F5] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={processing}
            className="px-5 py-2 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
          >
            {processing ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JenisMakFormModal;

