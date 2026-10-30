import { useMemo, useState } from 'react';

export default function useUserSearch(users = []) {
    const [query, setQuery] = useState('');

    const filteredUsers = useMemo(() => {
        if (!query.trim()) return users;
        const q = query.toLowerCase();
        return users.filter(
            (u) =>
                (u.nama && u.nama.toLowerCase().includes(q)) ||
                (u.email && u.email.toLowerCase().includes(q)) ||
                (u.unit && u.unit.toLowerCase().includes(q)) ||
                (u.role && u.role.toLowerCase().includes(q))
        );
    }, [users, query]);

    return { query, setQuery, filteredUsers };
}
