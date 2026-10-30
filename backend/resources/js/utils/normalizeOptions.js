export default function normalizeOptions(list = [], { valueKey = 'id', labelKey = 'nama', format = null } = {}) {
    return (list ?? []).map((item) => ({
        value: item?.[valueKey],
        label: typeof format === 'function' ? format(item) : (item?.[labelKey] ?? '-'),
    }));
}
