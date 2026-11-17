import type { FC } from 'react';
import { Calendar, Hash, Building2, Activity, Info } from 'lucide-react';
import type { Bidang2RkaklActiveDoc } from '../../../types/bidang2';

export interface Bidang2RkaklInfoCardProps {
  document: Bidang2RkaklActiveDoc;
}

export const Bidang2RkaklInfoCard: FC<Bidang2RkaklInfoCardProps> = ({ document }) => {
  const tahunAnggaran = document.tahun_anggaran || 2026;
  const versiLabel = `Versi ${document.versi || 3}`;
  const diperbaruiOleh = document.diperbarui_oleh || 'Unit Perencanaan';
  const terakhirDiperbarui = document.tanggal || '12 Okt 2026';
  const statusLabel = document.status || 'Aktif';

  const metadataItems = [
    {
      key: 'tahun',
      icon: Calendar,
      label: 'Tahun Anggaran',
      value: tahunAnggaran,
      isBadge: false,
    },
    {
      key: 'versi',
      icon: Hash,
      label: 'Versi Dokumen',
      value: versiLabel,
      isBadge: false,
    },
    {
      key: 'diperbarui_oleh',
      icon: Building2,
      label: 'Diperbarui Oleh',
      value: diperbaruiOleh,
      isBadge: false,
    },
    {
      key: 'terakhir_diperbarui',
      icon: Calendar,
      label: 'Terakhir Diperbarui',
      value: terakhirDiperbarui,
      isBadge: false,
    },
    {
      key: 'status',
      icon: Activity,
      label: 'Status',
      value: statusLabel,
      isBadge: true,
    },
  ];

  return (
    <aside
      className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] h-fit"
      aria-labelledby="rkakl-info-heading"
    >
      {/* Header Kartu */}
      <div className="pb-5 border-b border-[#F0F4F2]">
        <h2
          id="rkakl-info-heading"
          className="text-base font-bold text-[#14201C] tracking-tight"
        >
          Informasi Dokumen
        </h2>
        <p className="text-xs text-[#8A9A95] mt-0.5">
          Detail berkas RKAKL versi terbaru
        </p>
      </div>

      {/* Daftar Metadata Berikon */}
      <div className="mt-5 space-y-4">
        {metadataItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0 border border-[#C8E6C9]"
                aria-hidden="true"
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[#8A9A95] font-medium leading-tight">
                  {item.label}
                </p>
                {item.isBadge ? (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF6F1] text-[#0E7C5A] border border-[#C8E6C9]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C5A]" />
                      <span>{item.value}</span>
                    </span>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-[#14201C] leading-snug mt-0.5 truncate">
                    {item.value}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Kotak Info Acuan Perencanaan */}
      <div className="mt-6 p-4 rounded-xl bg-[#F9FBFA] border border-[#E4EBE8] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#8A9A95] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-[11px] text-[#5F6F6A] leading-relaxed">
          Dokumen ini dikelola Perencanaan. Bidang 2 hanya dapat melihat versi terbaru dan
          tidak dapat mengubah atau menghapusnya.
        </p>
      </div>
    </aside>
  );
};

export default Bidang2RkaklInfoCard;

