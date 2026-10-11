import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
            <Head title="Dashboard" />
            <header className="border-b border-slate-200">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                    <p className="text-sm font-semibold">SIPBAJA</p>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="rounded-md border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                    >
                        Logout
                    </Link>
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-16">
                <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                    <h1 className="text-xl font-semibold">Selamat datang, {auth.user.nama}</h1>
                    <p className="mt-2 text-sm text-slate-500">Role: {auth.user.role ?? '-'}</p>
                    <p className="mt-4 text-sm text-slate-500">
                        Dashboard masih kosong dan siap dikembangkan.
                    </p>
                </div>
            </main>
        </div>
    );
}
