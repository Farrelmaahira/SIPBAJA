import { type FC } from 'react';
import { Building2, Calendar, FileText, Bell, ExternalLink } from 'lucide-react';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';

export interface KontrakVendorCardProps {
  tipe?: string;
  nomor?: string;
  tanggal?: string | null;
  vendorNama?: string;
  nominalKontrak?: number;
  tanggalJatuhTempo?: string | null;
  tanggalReminder?: string | null;
  dokumenUrl?: string | null;
  dokumenNama?: string | null;
  bisaEdit?: boolean;
  onEdit?: () => void;
  onPreviewDokumen?: () => void;
}

export const KontrakVendorCard: FC<KontrakVendorCardProps> = ({
  tipe = 'Kontrak',
  nomor = '-',
  tanggal = null,
  vendorNama = '-',
  nominalKontrak = 0,
  tanggalJatuhTempo = null,
  tanggalReminder = null,
  dokumenNama = null,
  bisaEdit = false,
  onEdit,
  onPreviewDokumen,
}) => {
  return (
    <section className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-5 border-b border-[#F0F4F2] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#14201C]">
              Informasi Rekanan Vendor & Dokumen Pembelian
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF7F2] text-[#0E7C5A]">
              {tipe}
            </span>
          </div>
          <p className="text-xs text-[#5F6F6A] mt-0.5">
            Data penyedia barang/jasa terpilih, nilai kontrak riil, dan jadwal pengingat
          </p>
        </div>

        {bisaEdit && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#0E7C5A] text-white hover:bg-[#0B664A] text-xs font-semibold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            <span>Ubah Data Kontrak / Vendor</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-6 text-xs">
        <div>
          <span className="block text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider mb-1">
            Penyedia / Rekanan Vendor
          </span>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0E7C5A] shrink-0" />
            <p className="text-sm font-bold text-[#14201C]">{vendorNama}</p>
          </div>
        </div>

        <div>
          <span className="block text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider mb-1">
            Nomor {tipe}
          </span>
          <p className="text-sm font-semibold text-[#14201C]">{nomor}</p>
        </div>

        <div>
          <span className="block text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider mb-1">
            Nominal Riil ({tipe})
          </span>
          <p className="text-base font-extrabold text-[#0E7C5A] tabular-nums">
            {formatRupiah(nominalKontrak)}
          </p>
        </div>

        <div>
          <span className="block text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider mb-1">
            Tanggal Terbit
          </span>
          <p className="text-sm text-[#14201C]">
            {tanggal ? formatTanggalIndo(tanggal, true) : '-'}
          </p>
        </div>

        <div>
          <span className="block text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider mb-1">
            Jatuh Tempo Pembayaran
          </span>
          <div className="flex items-center gap-1.5 text-sm text-[#14201C]">
            <Calendar className="w-4 h-4 text-[#5F6F6A]" />
            <span>{tanggalJatuhTempo ? formatTanggalIndo(tanggalJatuhTempo, true) : '-'}</span>
          </div>
        </div>

        <div>
          <span className="block text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider mb-1">
            Jadwal Pengingat (Reminder)
          </span>
          <div className="flex items-center gap-1.5 text-sm font-medium text-[#B54708]">
            <Bell className="w-4 h-4 text-[#B54708]" />
            <span>{tanggalReminder ? formatTanggalIndo(tanggalReminder, true) : '-'}</span>
          </div>
        </div>

        {dokumenNama && (
          <div className="md:col-span-2 lg:col-span-3 pt-3 border-t border-[#F0F4F2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0E7C5A]" />
              <span className="text-xs font-semibold text-[#14201C]">
                Berkas Dokumen: {dokumenNama}
              </span>
            </div>
            {onPreviewDokumen && (
              <button
                type="button"
                onClick={onPreviewDokumen}
                className="text-xs font-semibold text-[#0E7C5A] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Dokumen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default KontrakVendorCard;
