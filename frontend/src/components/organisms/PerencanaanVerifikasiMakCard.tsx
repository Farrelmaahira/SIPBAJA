import type { FC } from 'react';
import { Plus, Trash2, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import type { PerencanaanMakItem } from '../../types/perencanaan';

export interface PerencanaanVerifikasiMakCardProps {
  maksList: PerencanaanMakItem[];
  selectedMakIds: number[];
  onAddMak: () => void;
  onRemoveMak: (index: number) => void;
  onChangeMak: (index: number, makId: number) => void;
  onApproveClick: () => void;
  onRejectClick: () => void;
  processing?: boolean;
}

export const PerencanaanVerifikasiMakCard: FC<PerencanaanVerifikasiMakCardProps> = ({
  maksList,
  selectedMakIds,
  onAddMak,
  onRemoveMak,
  onChangeMak,
  onApproveClick,
  onRejectClick,
  processing = false,
}) => {
  return (
    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
      <div className="pb-4 mb-4 border-b border-[#F0F4F2]">
        <h3 className="text-base font-bold text-[#14201C]">Verifikasi Anggaran</h3>
        <p className="text-xs text-[#8A9A95] mt-0.5">
          Tentukan Jenis MAK sebelum menyetujui permohonan
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#14201C]">
          Jenis MAK <span className="text-red-500">*</span>
        </label>

        {selectedMakIds.length === 0 ? (
          <p className="text-xs text-[#8A9A95] italic">Belum ada MAK yang dipilih.</p>
        ) : (
          selectedMakIds.map((selectedId, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedId}
                  onChange={(e) => onChangeMak(idx, Number(e.target.value))}
                  disabled={processing}
                  className="w-full appearance-none px-4 py-3 pr-9 rounded-xl border border-[#E4EBE8] bg-white text-xs font-medium text-[#14201C] focus:outline-none focus:border-[#0E7C5A] disabled:opacity-60 transition cursor-pointer"
                >
                  {maksList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {selectedMakIds.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveMak(idx)}
                  disabled={processing}
                  className="w-10 h-10 rounded-xl border border-[#FECDCA] bg-[#FEE4E2]/60 hover:bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                  title="Hapus Jenis MAK"
                  aria-label="Hapus Jenis MAK"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}

        <button
          type="button"
          onClick={onAddMak}
          disabled={processing || maksList.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F7F5] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-[#14201C] transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#0E7C5A]" />
          <span>Tambah Jenis MAK</span>
        </button>
      </div>

      <div className="pt-5 mt-5 border-t border-[#F0F4F2] grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRejectClick}
          disabled={processing}
          className="py-3 px-3 rounded-xl border border-[#FECDCA] bg-[#FEE4E2]/70 hover:bg-[#FEE4E2] text-xs font-bold text-[#D92D20] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <XCircle className="w-4 h-4 shrink-0" />
          <span>Tolak</span>
        </button>
        <button
          type="button"
          onClick={onApproveClick}
          disabled={processing || selectedMakIds.length === 0}
          className="py-3 px-3 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Setujui</span>
        </button>
      </div>
    </div>
  );
};

export default PerencanaanVerifikasiMakCard;
