import type { FC } from 'react';
import { FileText, Eye, Download } from 'lucide-react';

export interface DocumentCardProps {
  category: string;
  filename: string;
  size?: string;
  onView?: () => void;
  onDownload?: () => void;
  className?: string;
}

export const DocumentCard: FC<DocumentCardProps> = ({
  category,
  filename,
  size = 'PDF • 2 MB',
  onView,
  onDownload,
  className = '',
}) => {
  return (
    <div className={`p-4 rounded-2xl border border-[#E4EBE8] bg-white flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#0E7C5A]">{category}</p>
            <p className="text-xs font-bold text-[#14201C] truncate mt-0.5">{filename}</p>
            <p className="text-[11px] text-[#8A9A95]">{size}</p>
          </div>
        </div>
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="w-9 h-9 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F7F5] text-[#5F6F6A] flex items-center justify-center shrink-0 cursor-pointer"
            title={`Unduh ${category}`}
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>

      {onView && (
        <button
          type="button"
          onClick={onView}
          className="w-full mt-3.5 py-2.5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F9F6] text-xs font-bold text-[#0E7C5A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Lihat Dokumen</span>
        </button>
      )}
    </div>
  );
};

export default DocumentCard;
