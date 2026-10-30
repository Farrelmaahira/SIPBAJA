import { Link } from '@inertiajs/react';

export default function ErrorAction({ href, children }) {
    return (
        <Link
            href={href}
            className="mt-6 inline-block w-full rounded-md bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
            {children}
        </Link>
    );
}
