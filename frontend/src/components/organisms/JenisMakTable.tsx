import type { FC } from 'react';
import { Pencil, Trash2, Tag, Loader2 } from 'lucide-react';
import type { JenisMakRow } from '../../types/perencanaan';

export interface JenisMakTableProps {
  rows: JenisMakRow[];
  isLoading?: boolean;
  onEdit: (row: JenisMakRow) => void;
  onDelete: (row: JenisMakRow) => void;
}

export const JenisMakTable: FC<JenisMakTableProps> = ({
  rows,
  isLoading = false,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#EEF3F0] border-b border-[#E2EAE6] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
            <th className="py-3.5 px-4 rounded-l-xl">KODE MAK</th>
            <th className="py-3.5 px-4">NAMA MAK</th>
            <th className="py-3.5 px-4">PENANGGUNG JAWAB</th>
            <th className="py-3.5 px-4">DIGUNAKAN</th>
            <th className="py-3.5 px-4 text-center rounded-r-xl">AKSI</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F4F2] text-xs">
          {isLoading ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-[#8A9A95]">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 border-2 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-[#5F6F6A]">Memuat data Jenis MAK...</p>
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-[#8A9A95]">
                <Tag className="w-8 h-8 mx-auto mb-2 text-[#C5D2CD]" />
                <p className="text-xs font-bold text-[#5F6F6A]">Belum ada data Jenis MAK.</p>
                <p className="text-[11px] text-[#8A9A95] mt-0.5">
                  Klik tombol &quot;Tambah Jenis MAK&quot; untuk menambahkan data baru.
                </p>
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-[#FAFDFB] transition-colors">
                <td className="py-4 px-4 font-bold text-[#0E7C5A] whitespace-nowrap">{row.kode}</td>
                <td className="py-4 px-4 font-bold text-[#14201C]">{row.nama}</td>
                <td className="py-4 px-4 text-[#5F6F6A]">{row.penanggung_jawab}</td>
                <td className="py-4 px-4 text-[#5F6F6A]">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F4F7F5] text-[#14201C]">
                    {row.digunakan} pengadaan
                  </span>
                </td>
                <td className="py-4 px-4 text-center whitespace-nowrap space-x-2">
                  <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className="p-1.5 rounded-lg border border-[#E4EBE8] hover:bg-[#F4F7F5] text-[#5F6F6A] hover:text-[#14201C] transition-colors cursor-pointer"
                    title="Edit MAK"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="p-1.5 rounded-lg border border-[#FECDCA] hover:bg-[#FEE4E2] text-[#D92D20] transition-colors cursor-pointer"
                    title="Hapus MAK"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default JenisMakTable;

