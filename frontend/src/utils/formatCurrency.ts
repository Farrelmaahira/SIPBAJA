
export const formatCurrency = (val?: number | string) => {
    const numVal = typeof val === 'string' ? Number(val) : val || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number.isNaN(numVal) ? 0 : numVal);
};
