export interface AdminStatItem {
  label?: string;
  value?: number | string;
}

export interface RawAdminStatsObject {
  totalPengguna?: number | string;
  total_pengguna?: number | string;
  totalUnit?: number | string;
  total_unit?: number | string;
  totalMak?: number | string;
  total_mak?: number | string;
}

export interface NormalizedAdminStats {
  totalPengguna: number;
  totalUnit: number;
  totalMak: number;
}

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function normalizeAdminStats(
  stats: AdminStatItem[] | RawAdminStatsObject | null | undefined
): NormalizedAdminStats {
  if (Array.isArray(stats)) {
    const findValue = (keyword: string): number => {
      const item = stats.find((s) =>
        String(s?.label ?? '').toLowerCase().includes(keyword)
      );
      return toNumber(item?.value);
    };
    return {
      totalPengguna: findValue('pengguna'),
      totalUnit: findValue('unit'),
      totalMak: findValue('mak'),
    };
  }

  const obj = (stats ?? {}) as RawAdminStatsObject;
  return {
    totalPengguna: toNumber(obj.totalPengguna ?? obj.total_pengguna),
    totalUnit: toNumber(obj.totalUnit ?? obj.total_unit),
    totalMak: toNumber(obj.totalMak ?? obj.total_mak),
  };
}
