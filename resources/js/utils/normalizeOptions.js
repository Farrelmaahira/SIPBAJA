export default function normalizeOptions(list = [], { valueKey = 'id', labelKey = 'nama' } = {}) {
    return (list ?? []).map((item) => ({
        value: item?.[valueKey],
        label: item?.[labelKey] ?? '-',
    }));
}
