import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';

export interface UseSearchFilterReturn<T> {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  filtered: T[];
}

/**
 * Generic search filter hook for client-side collection filtering.
 *
 * @param items Array of items to filter
 * @param fields Array of object keys to match query against
 */
export function useSearchFilter<T extends Record<string, any>>(
  items: T[] = [],
  fields: (keyof T | string)[] = []
): UseSearchFilterReturn<T> {
  const [query, setQuery] = useState<string>('');

  const filtered = useMemo<T[]>(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) =>
      fields.some((field) => {
        const value = (item as any)?.[field];
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

export default useSearchFilter;
