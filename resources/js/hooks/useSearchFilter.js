import { useMemo, useState } from 'react';

export default function useSearchFilter(items = [], fields = []) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (!query.trim()) return items;
        const q = query.toLowerCase();
        return items.filter((item) =>
            fields.some((field) => {
                const value = item?.[field];
                return (
                    value !== null &&
                    value !== undefined &&
                    String(value).toLowerCase().includes(q)
                );
            })
        );
    }, [items, fields, query]);

    return { query, setQuery, filtered };
}
