import { useState, useRef, useEffect, type FC, type MouseEvent } from 'react';
import { MoreVertical, FileText, Download } from 'lucide-react';
import StatusPill from '../atoms/StatusPill';
import { formatRupiah, formatTanggal, labelStatusPermohonan } from '../../utils/formatPermohonan';

export interface PermohonanRowData {
  id?: number | string;
  nomor_surat?: string;
  judul?: string;
  created_at?: string;
  estimasi_anggaran?: number | string;
  status?: string;
  dokumen?: Array<{ id?: number | string; [key: string]: unknown }>;
  [key: string]: unknown;
}

export interface PermohonanRowProps {
  permohonan?: PermohonanRowData;
  nomorSurat?: string;
  judul?: string;
  tanggal?: string;
  nilaiPengajuan?: number | string;
  status?: string;
  onDetail?: (permohonan: PermohonanRowData) => void;
}

export const PermohonanRow: FC<PermohonanRowProps> = ({
  permohonan,
  nomorSurat,
  judul,
  tanggal,
  nilaiPengajuan,
  status,
  onDetail,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { label, variant } = labelStatusPermohonan(status ?? permohonan?.status);
  const resolvedPermohonan: PermohonanRowData = permohonan || {
    nomor_surat: nomorSurat,
    judul,
    created_at: tanggal,
    estimasi_anggaran: nilaiPengajuan,
    status,
  };
  const hasDokumen = Boolean(resolvedPermohonan.dokumen?.[0]);

  useEffect(() => {
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleDetailClick = (e: MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    if (onDetail) {
      onDetail(resolvedPermohonan);
    }
  };

  const displayNomorSurat = nomorSurat || resolvedPermohonan.nomor_surat;
  const displayJudul = judul || resolvedPermohonan.judul;
  const displayTanggal = tanggal || resolvedPermohonan.created_at;
  const displayNilai = nilaiPengajuan ?? resolvedPermohonan.estimasi_anggaran;

  return (
    <tr className="border-b border-[#E4EBE8] last:border-0 hover:bg-[#F9FBFA] transition-colors">
      <td className="py-3.5 px-4 text-sm font-semibold text-[#0E7C5A] whitespace-nowrap">
        <button
          type="button"
          onClick={handleDetailClick}
          className="text-left font-semibold text-[#0E7C5A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded cursor-pointer"
          aria-label={`Buka detail permohonan ${displayNomorSurat}`}
        >
          {displayNomorSurat}
        </button>
      </td>
      <td className="py-3.5 px-4 text-sm text-[#14201C] max-w-xs truncate" title={displayJudul}>
        {displayJudul}
      </td>
      <td className="py-3.5 px-4 text-sm text-[#5F6F6A] whitespace-nowrap">
        {formatTanggal(displayTanggal)}
      </td>
      <td className="py-3.5 px-4 text-sm font-medium text-[#14201C] whitespace-nowrap">
        {formatRupiah(displayNilai)}
      </td>
      <td className="py-3.5 px-4">
        <StatusPill status={variant} label={label} />
      </td>
      <td className="py-3.5 px-4 text-right relative">
        <div className="relative inline-block" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#5F6F6A] hover:bg-[#EEF5F2] hover:text-[#14201C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
            aria-label={`Opsi permohonan ${displayNomorSurat}`}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-[#E4EBE8] shadow-lg py-1 z-30">
              <button
                type="button"
                onClick={handleDetailClick}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#344054] hover:bg-[#F2F9F6] hover:text-[#0E7C5A] transition-colors cursor-pointer text-left"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lihat Detail</span>
              </button>

              {hasDokumen && (
                <a
                  href={`/pemohon/permohonan/${resolvedPermohonan.id}/dokumen`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#344054] hover:bg-[#F2F9F6] hover:text-[#0E7C5A] transition-colors text-left"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Berkas</span>
                </a>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PermohonanRow;
