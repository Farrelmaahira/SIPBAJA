import { Head, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth, stats, recentUsers } = usePage().props;

    return (
        <>
            <Head title="Dashboard Admin" />
            <div>Admin Dashboard scaffold — will wire template in Task 5.</div>
        </>
    );
}
