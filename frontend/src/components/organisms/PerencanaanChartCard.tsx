import type { FC } from 'react';

export interface ChartDataItem {
  label: string;
  disetujui: number;
  ditolak: number;
}

export interface PerencanaanChartCardProps {
  viewMode: 'bulan' | 'tahun';
  onViewModeChange: (mode: 'bulan' | 'tahun') => void;
  data?: ChartDataItem[];
  totalDisetujui?: number;
  totalDitolak?: number;
}

const DEFAULT_YEARLY_DATA: ChartDataItem[] = [
  { label: '2021', disetujui: 165, ditolak: 38 },
  { label: '2022', disetujui: 205, ditolak: 46 },
  { label: '2023', disetujui: 245, ditolak: 52 },
  { label: '2024', disetujui: 280, ditolak: 60 },
  { label: '2025', disetujui: 315, ditolak: 68 },
  { label: '2026', disetujui: 315, ditolak: 68 },
];

const DEFAULT_MONTHLY_DATA: ChartDataItem[] = [
  { label: 'Jan', disetujui: 140, ditolak: 30 },
  { label: 'Feb', disetujui: 180, ditolak: 35 },
  { label: 'Mar', disetujui: 210, ditolak: 35 },
  { label: 'Apr', disetujui: 160, ditolak: 50 },
  { label: 'Mei', disetujui: 240, ditolak: 50 },
  { label: 'Jun', disetujui: 270, ditolak: 60 },
  { label: 'Jul', disetujui: 230, ditolak: 40 },
  { label: 'Agu', disetujui: 280, ditolak: 65 },
  { label: 'Sep', disetujui: 250, ditolak: 45 },
  { label: 'Okt', disetujui: 300, ditolak: 35 },
  { label: 'Nov', disetujui: 190, ditolak: 30 },
  { label: 'Des', disetujui: 240, ditolak: 40 },
];

const Y_TICKS = [480, 360, 240, 120, 0];

export const PerencanaanChartCard: FC<PerencanaanChartCardProps> = ({
  viewMode,
  onViewModeChange,
  data,
  totalDisetujui,
  totalDitolak,
}) => {
  const activeData =
    data && data.length > 0
      ? data
      : viewMode === 'bulan'
        ? DEFAULT_MONTHLY_DATA
        : DEFAULT_YEARLY_DATA;

  const resolvedDisetujui =
    totalDisetujui !== undefined
      ? totalDisetujui
      : viewMode === 'bulan'
        ? 337
        : 1529;

  const resolvedDitolak =
    totalDitolak !== undefined
      ? totalDitolak
      : viewMode === 'bulan'
        ? 81
        : 342;

  const currentYear = new Date().getFullYear();
  const subtitle =
    viewMode === 'tahun'
      ? `Disetujui vs ditolak per tahun • 2021–${currentYear}`
      : `Disetujui vs ditolak per bulan ${currentYear}`;

  return (
    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
        <div>
          <h3 className="text-base font-bold text-[#14201C]">Statistik Permohonan</h3>
          <p className="text-xs text-[#8A9A95] mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#5F6F6A]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0E7C5A]" />
              Disetujui <strong className="font-bold text-[#14201C] ml-0.5">{resolvedDisetujui}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#5F6F6A]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5484D]" />
              Ditolak <strong className="font-bold text-[#14201C] ml-0.5">{resolvedDitolak}</strong>
            </span>
          </div>

          <div className="inline-flex p-0.5 rounded-xl bg-[#F3F6F5] border border-[#E4EBE8] text-xs">
            <button
              type="button"
              onClick={() => onViewModeChange('bulan')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'bulan'
                  ? 'bg-white text-[#0E7C5A] border border-[#0E7C5A]/30 shadow-2xs'
                  : 'text-[#5F6F6A] hover:text-[#14201C]'
              }`}
            >
              Bulan
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('tahun')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'tahun'
                  ? 'bg-white text-[#0E7C5A] border border-[#0E7C5A]/30 shadow-2xs'
                  : 'text-[#5F6F6A] hover:text-[#14201C]'
              }`}
            >
              Tahun
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <div className="relative flex gap-3">
          {/* Sumbu Y Ticks */}
          <div className="flex flex-col justify-between h-52 text-[11px] text-[#8A9A95] font-medium pr-2 select-none pb-6">
            {Y_TICKS.map((tick) => (
              <span key={tick} className="leading-none text-right w-7">
                {tick}
              </span>
            ))}
          </div>

          {/* Area Grafik */}
          <div className="flex-1 relative h-52 overflow-x-auto">
            {/* Garis Horizontal Panduan */}
            <div className="absolute inset-0 bottom-6 flex flex-col justify-between pointer-events-none">
              {Y_TICKS.map((tick) => (
                <div key={tick} className="w-full border-b border-[#F0F4F2]" />
              ))}
            </div>

            {/* Kolom Batang Berdampingan */}
            <div className="relative z-10 h-full flex items-end justify-between sm:justify-around gap-1 sm:gap-2 pt-2 min-w-[500px] sm:min-w-0">
              {activeData.map((item, idx) => {
                const hApprove = Math.min(172, Math.max(2, Math.round((item.disetujui / 480) * 172)));
                const hReject = Math.min(172, Math.max(2, Math.round((item.ditolak / 480) * 172)));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-[176px]">
                      <div
                        style={{ height: `${hApprove}px` }}
                        className="w-3.5 sm:w-5 md:w-6 bg-[#99DFC5] group-hover:bg-[#0E7C5A] rounded-t-sm sm:rounded-t-md transition-all cursor-pointer"
                        title={`${item.label} - Disetujui: ${item.disetujui}`}
                      />
                      <div
                        style={{ height: `${hReject}px` }}
                        className="w-3.5 sm:w-5 md:w-6 bg-[#F7B2AD] group-hover:bg-[#E5484D] rounded-t-sm sm:rounded-t-md transition-all cursor-pointer"
                        title={`${item.label} - Ditolak: ${item.ditolak}`}
                      />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-medium text-[#8A9A95] h-4 leading-none">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerencanaanChartCard;
