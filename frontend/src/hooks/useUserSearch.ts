import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';

export interface SearchableUser {
  nama?: string | null;
  email?: string | null;
  unit?: string | { nama?: string | null; [key: string]: any } | null;
  role?: string | { nama?: string | null; [key: string]: any } | null;
  [key: string]: any;
}

export interface UseUserSearchReturn<T extends SearchableUser> {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  filteredUsers: T[];
}

/**
 * Custom hook for searching through users by name, email, unit, or role.
 *
 * @param users Array of users
 */
export function useUserSearch<T extends SearchableUser>(
  users: T[] = []
): UseUserSearchReturn<T> {
  const [query, setQuery] = useState<string>('');

  const filteredUsers = useMemo<T[]>(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();

    const resolveValue = (val: unknown): string => {
      if (typeof val === 'string') return val.toLowerCase();
      if (
        val &&
        typeof val === 'object' &&
        'nama' in val &&
        typeof (val as { nama?: unknown }).nama === 'string'
      ) {
        return ((val as { nama: string }).nama || '').toLowerCase();
      }
      return '';
    };

    return users.filter((u) => {
      const nama = (u.nama || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const unit = resolveValue(u.unit);
      const role = resolveValue(u.role);

      return (
        nama.includes(q) ||
        email.includes(q) ||
        unit.includes(q) ||
        role.includes(q)
      );
    });
  }, [users, query]);

  return { query, setQuery, filteredUsers };
}

export default useUserSearch;
