function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

export default function normalizeAdminStats(stats) {
    if (Array.isArray(stats)) {
        const findValue = (keyword) => {
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

    const obj = stats ?? {};
    return {
        totalPengguna: toNumber(obj.totalPengguna ?? obj.total_pengguna),
        totalUnit: toNumber(obj.totalUnit ?? obj.total_unit),
        totalMak: toNumber(obj.totalMak ?? obj.total_mak),
    };
}
