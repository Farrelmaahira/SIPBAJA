import type { FC } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import type { RkaklHistoryItem } from '../../types/perencanaan';

export interface RkaklHistoryCardProps {
  history: RkaklHistoryItem[];
  isLoading?: boolean;
  onSelectHistoryDoc?: (doc: RkaklHistoryItem) => void;
}

export const RkaklHistoryCard: FC<RkaklHistoryCardProps> = ({
  history,
  isLoading = false,
  onSelectHistoryDoc,
}) => {
  return (
    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
      <div className="pb-3 mb-4 border-b border-[#F0F4F2] flex items-center justify-between">
        <h3 className="text-base font-bold text-[#14201C]">
          Riwayat Versi Dokumen
        </h3>
        <span className="text-xs font-semibold text-[#8A9A95]">
          {history.length} Versi
        </span>
      </div>

      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 text-[#0E7C5A] animate-spin" />
          <p className="text-xs text-[#8A9A95]">Memuat riwayat versi...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#F4F7F5] text-[#8A9A95] flex items-center justify-center mx-auto mb-2">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-[#5F6F6A]">
            Belum ada arsip riwayat versi sebelumnya.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const displayName =
              item.nama_asli ||
              item.filename ||
              (item.path ? item.path.split('/').pop() : `RKAKL_TA_2026_Satker_v${item.versi ?? item.id}.pdf`);
            const metaInfo =
              item.meta ||
              (item.updated_at
                ? `PDF • Versi ${item.versi ?? '-'} • ${new Date(item.updated_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}`
                : `PDF • Arsip Versi ${item.versi ?? '-'}`);

            return (
              <div
                key={String(item.id)}
                onClick={() => onSelectHistoryDoc?.(item)}
                className={`p-3 rounded-xl border border-[#E4EBE8] bg-[#FAFCFB] flex items-center justify-between text-xs transition-colors ${
                  onSelectHistoryDoc ? 'cursor-pointer hover:border-[#0E7C5A] hover:bg-white' : ''
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-[#14201C] truncate" title={displayName}>
                    {displayName}
                  </p>
                  <p className="text-[11px] text-[#8A9A95] mt-0.5">{metaInfo}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E4EBE8] flex items-center justify-center text-[#8A9A95] shrink-0">
                  <Download className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RkaklHistoryCard;

