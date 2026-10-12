import { Head, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    const inputClass = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15';

    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
            <Head title="Login" />
            <div className="w-full max-w-sm">
                <div className="rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm">
                    <div className="mb-5 flex justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="36"
                            height="36"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-slate-900"
                            aria-hidden="true"
                        >
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" x2="3" y1="12" y2="12" />
                        </svg>
                    </div>

                    <h1 className="text-center text-lg font-semibold text-slate-900">
                        Selamat Datang di SIPBAJA
                    </h1>
                    <p className="mt-1 text-center text-xs text-slate-500">
                        Sistem Pengadaan Barang dan Jasa di PNJ
                    </p>

                    <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
                        <div>
                            <label
                                htmlFor="login"
                                className="mb-1 block text-xs font-medium text-slate-700"
                            >
                                Email/Username
                            </label>
                            <input
                                id="login"
                                type="text"
                                value={data.login}
                                onChange={(e) => setData('login', e.target.value)}
                                placeholder="Email/Username"
                                autoComplete="username"
                                autoFocus
                                className={inputClass}
                            />
                            {errors.login && (
                                <p className="mt-1 text-xs text-red-600">{errors.login}</p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1 block text-xs font-medium text-slate-700"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password"
                                autoComplete="current-password"
                                className={inputClass}
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-1 w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {processing ? 'Memproses...' : 'Login'}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-slate-500">
                    Lupa Password? <span>Hubungi admin untuk reset.</span>
                </p>
            </div>
        </div>
    );
}
