import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#F3F6F5] font-sans text-[#14201C] flex flex-col lg:flex-row">
            <Head title="Login - SIPBAJA" />

            {/* Decorative Accent Circles on Right Canvas */}
            <div
                className="pointer-events-none hidden lg:block absolute top-20 right-24 w-[90px] h-[90px] rounded-full bg-[#12A06B]/18"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none hidden lg:block absolute bottom-24 right-1/3 w-[56px] h-[56px] rounded-full bg-[#0E7C5A]/10"
                aria-hidden="true"
            />

            {/* Left Hero Panel (Desktop Half-Circle & Mobile Top Band) */}
            <div className="relative lg:w-5/12 xl:w-1/2 flex items-center justify-center lg:justify-start px-6 py-10 lg:py-0 lg:pl-16 xl:pl-24 bg-[#0E7C5A] lg:bg-transparent overflow-hidden lg:overflow-visible shrink-0">
                {/* Desktop 1000px Half-Circle */}
                <div
                    className="pointer-events-none hidden lg:flex items-center justify-center absolute -left-[460px] xl:-left-[420px] top-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-[#0E7C5A] shadow-[0_10px_24px_rgba(13,51,38,0.14)]"
                    aria-hidden="true"
                >
                    {/* Concentric Ring 700px */}
                    <div className="w-[700px] h-[700px] rounded-full border-2 border-white/12 flex items-center justify-center">
                        {/* Glow Circle 420px */}
                        <div className="w-[420px] h-[420px] rounded-full bg-white/7" />
                    </div>
                </div>

                {/* Mobile Decorative Circles */}
                <div
                    className="pointer-events-none lg:hidden absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/8"
                    aria-hidden="true"
                />
                <div
                    className="pointer-events-none lg:hidden absolute -left-10 -bottom-16 w-36 h-36 rounded-full border-2 border-white/12"
                    aria-hidden="true"
                />

                {/* Brand Block */}
                <div className="relative z-10 max-w-[320px] text-center lg:text-left text-white">
                    <div className="inline-flex items-center justify-center w-[56px] h-[56px] rounded-[16px] bg-white text-[#0E7C5A] shadow-[0_8px_20px_rgba(13,51,38,0.2)] mb-5">
                        <svg
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                    </div>

                    <h2 className="text-[32px] lg:text-[40px] font-bold tracking-[-0.5px] leading-tight">
                        <span>SIP</span>
                        <span className="text-[#7FE0B8]">BAJA</span>
                    </h2>

                    <p className="mt-3 text-sm lg:text-base text-white/85 leading-relaxed font-normal">
                        Sistem Informasi Pengadaan Barang dan Jasa Terpadu di Lingkungan Kampus PNJ.
                    </p>
                </div>
            </div>

            {/* Right Login Card Area */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
                <div className="w-full max-w-[440px] rounded-[24px] bg-white border border-[#E4EBE8] p-6 sm:p-10 shadow-[0_12px_32px_rgba(13,51,38,0.08)]">
                    {/* Card Header */}
                    <div className="text-center mb-7">
                        <div className="w-14 h-14 rounded-[16px] bg-[#E4F6EC] text-[#0E7C5A] flex items-center justify-center mx-auto mb-4">
                            <LogIn className="w-[26px] h-[26px]" strokeWidth={2} />
                        </div>

                        <h1 className="text-2xl font-bold text-[#14201C] tracking-tight">
                            Selamat Datang di SIPBAJA
                        </h1>
                        <p className="mt-1.5 text-sm text-[#5F6F6A]">
                            Sistem Pengadaan Barang dan Jasa di PNJ
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={submit} className="space-y-5">
                        {/* Email / Username */}
                        <div>
                            <label
                                htmlFor="login"
                                className="block text-[13px] font-semibold text-[#14201C] mb-2"
                            >
                                Email/Username
                            </label>
                            <div className="relative">
                                <Mail
                                    className="w-[18px] h-[18px] text-[#8A9A95] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                    strokeWidth={2}
                                />
                                <input
                                    id="login"
                                    type="text"
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    placeholder="Masukkan email atau username"
                                    autoComplete="username"
                                    autoFocus
                                    className={`w-full rounded-[12px] bg-[#F7FAF9] pl-11 pr-4 py-[13px] text-sm text-[#14201C] placeholder:text-[#8A9A95] border transition-all outline-none ${
                                        errors.login
                                            ? 'border-[#E5484D] focus:border-[#E5484D] focus:ring-3 focus:ring-[#E5484D]/15'
                                            : 'border-[#E4EBE8] hover:border-[#CFDAD6] focus:border-[#0E7C5A] focus:ring-3 focus:ring-[#0E7C5A]/15'
                                    }`}
                                />
                            </div>
                            {errors.login && (
                                <p className="mt-1.5 text-xs font-medium text-[#B42318]">
                                    {errors.login}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-[13px] font-semibold text-[#14201C] mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock
                                    className="w-[18px] h-[18px] text-[#8A9A95] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                    strokeWidth={2}
                                />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Masukkan password Anda"
                                    autoComplete="current-password"
                                    className={`w-full rounded-[12px] bg-[#F7FAF9] pl-11 pr-11 py-[13px] text-sm text-[#14201C] placeholder:text-[#8A9A95] border transition-all outline-none ${
                                        errors.password
                                            ? 'border-[#E5484D] focus:border-[#E5484D] focus:ring-3 focus:ring-[#E5484D]/15'
                                            : 'border-[#E4EBE8] hover:border-[#CFDAD6] focus:border-[#0E7C5A] focus:ring-3 focus:ring-[#0E7C5A]/15'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A9A95] hover:text-[#14201C] transition-colors cursor-pointer"
                                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-[18px] h-[18px]" strokeWidth={2} />
                                    ) : (
                                        <Eye className="w-[18px] h-[18px]" strokeWidth={2} />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs font-medium text-[#B42318]">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-[12px] bg-[#0E7C5A] hover:bg-[#0A5C43] active:bg-[#0A5C43] py-[14px] px-4 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(13,51,38,0.28)] hover:shadow-[0_6px_14px_rgba(13,51,38,0.24)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E7C5A]/40 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            {processing ? 'Memproses...' : 'Login'}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-[13px] text-[#5F6F6A]">
                        Lupa Password?{' '}
                        <span className="font-semibold text-[#0E7C5A]">
                            Reset Password
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
