const BAR_HEIGHT = 180;
const BAR_GAP = 6;

function SkeletonBars() {
    return (
        <div className="flex items-end gap-1.5 h-[180px] w-full px-2" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-[#E4EBE8] animate-pulse"
                    style={{ height: `${40 + Math.sin(i) * 30 + 30}px` }}
                />
            ))}
        </div>
    );
}

function BarChart({ data }) {
    const maxVal = Math.max(...data.map((d) => d.disetujui + d.ditolak), 1);
    // Round up to nearest 'nice' number for y-axis labels
    const yMax = Math.ceil(maxVal / 5) * 5 || 5;
    const ySteps = [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0];

    return (
        <div className="relative w-full" role="img" aria-label="Grafik batang statistik permohonan">
            {/* Y-axis labels */}
            <div className="flex">
                <div className="flex flex-col justify-between text-right pr-3 shrink-0" style={{ height: BAR_HEIGHT }}>
                    {ySteps.map((v) => (
                        <span key={v} className="text-[10px] text-[#8A9A95] leading-none">
                            {v}
                        </span>
                    ))}
                </div>

                {/* Chart area */}
                <div className="flex-1 min-w-0 relative">
                    {/* Horizontal guide lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {ySteps.map((v) => (
                            <div key={v} className="w-full border-t border-[#E4EBE8]" />
                        ))}
                    </div>

                    {/* Bars */}
                    <div
                        className="relative flex items-end gap-[3px] px-1"
                        style={{ height: BAR_HEIGHT }}
                    >
                        {data.map((item) => {
                            const hDisetujui = yMax > 0 ? Math.round((item.disetujui / yMax) * BAR_HEIGHT) : 0;
                            const hDitolak = yMax > 0 ? Math.round((item.ditolak / yMax) * BAR_HEIGHT) : 0;
                            return (
                                <div
                                    key={item.bulan}
                                    className="flex-1 flex items-end gap-px"
                                    title={`${item.label}: Disetujui ${item.disetujui}, Ditolak ${item.ditolak}`}
                                >
                                    <div
                                        className="flex-1 rounded-t-[3px] bg-[#0E7C5A] transition-all duration-300"
                                        style={{ height: hDisetujui || 2 }}
                                        aria-label={`${item.label} disetujui: ${item.disetujui}`}
                                    />
                                    <div
                                        className="flex-1 rounded-t-[3px] bg-[#F4C7C4] transition-all duration-300"
                                        style={{ height: hDitolak || 2 }}
                                        aria-label={`${item.label} ditolak: ${item.ditolak}`}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* X-axis labels */}
                    <div className="flex gap-[3px] px-1 mt-1.5">
                        {data.map((item) => (
                            <div key={item.bulan} className="flex-1 text-center">
                                <span className="text-[9px] text-[#8A9A95]">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function StatistikChart({ chartData, tahunAktif, gantiTahun, isLoading = false }) {
    const tahunSekarang = new Date().getFullYear();
    const tahunOptions = [tahunSekarang - 1, tahunSekarang];

    return (
        <section
            className="bg-white border border-[#E4EBE8] rounded-[18px] shadow-[0_1px_3px_rgba(20,32,28,0.04)] p-6"
            aria-labelledby="statistik-chart-title"
        >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                <div>
                    <h2
                        id="statistik-chart-title"
                        className="text-[15px] font-bold text-[#14201C] tracking-tight"
                    >
                        Statistik Permohonan
                    </h2>
                    <p className="text-[12px] text-[#5F6F6A] mt-0.5">
                        Disetujui vs ditolak per bulan {tahunAktif}
                    </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    {/* Legend */}
                    <div className="flex items-center gap-3 text-[11px] text-[#5F6F6A]">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-[#0E7C5A] shrink-0" aria-hidden="true" />
                            Disetujui
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-[#F4C7C4] shrink-0" aria-hidden="true" />
                            Ditolak
                        </span>
                    </div>

                    {/* Year toggle */}
                    <div
                        className="flex rounded-lg border border-[#E4EBE8] overflow-hidden"
                        role="group"
                        aria-label="Pilih tahun statistik"
                    >
                        {tahunOptions.map((tahun) => (
                            <button
                                key={tahun}
                                type="button"
                                onClick={() => gantiTahun(tahun)}
                                className={`px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0E7C5A] ${
                                    tahun === tahunAktif
                                        ? 'bg-[#0E7C5A] text-white'
                                        : 'bg-white text-[#5F6F6A] hover:bg-[#F3F6F5]'
                                }`}
                                aria-pressed={tahun === tahunAktif}
                            >
                                {tahun}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isLoading || !chartData ? (
                <SkeletonBars />
            ) : (
                <BarChart data={chartData} />
            )}
        </section>
    );
}
