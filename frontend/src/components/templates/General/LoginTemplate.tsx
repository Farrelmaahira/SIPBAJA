import { useState, type FC, type FormEvent } from 'react';
import { Package, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface LoginFormState {
  data: {
    login?: string;
    password?: string;
    remember?: boolean;
    [key: string]: unknown;
  };
  setData: (fieldOrObj: any, value?: any) => void;
  processing?: boolean;
  errors?: Record<string, string>;
}

export interface LoginTemplateProps {
  form: LoginFormState;
  onSubmit: (e: FormEvent) => void;
}

export const LoginTemplate: FC<LoginTemplateProps> = ({ form, onSubmit }) => {
  const { data, setData, processing = false, errors = {} } = form;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F3F6F5] font-sans antialiased text-[#14201C]">
      {/* Sisi Kiri: Panel Hero & Visual Branding */}
      <div className="w-full lg:w-1/2 min-h-[500px] lg:min-h-screen bg-[#0E7C5A] relative overflow-hidden flex flex-col justify-between p-8 sm:p-12 lg:p-16 text-white shrink-0">
        {/* Elemen Dekoratif Geometris */}
        <div
          className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-[#0A5C43] opacity-60 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/4 -right-16 w-[360px] h-[360px] rounded-full bg-[#12A06B] opacity-25 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-48 -left-48 w-[640px] h-[640px] rounded-full bg-[#074733] opacity-80 pointer-events-none"
          aria-hidden="true"
        />
        {/* Aksen lingkaran putih melayang */}
        <div
          className="absolute top-[58%] right-10 w-11 h-11 rounded-full bg-white shadow-md pointer-events-none hidden xl:block"
          aria-hidden="true"
        />

        {/* Header Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#0E7C5A] shadow-sm shrink-0">
            <Package className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="block text-base font-bold text-white tracking-tight leading-tight">
              SIPBAJA
            </span>
            <span className="block text-xs text-white/80 font-medium">
              Pengadaan Barang &amp; Jasa
            </span>
          </div>
        </div>

        {/* Bagian Tengah: Headline & Kartu Status Progres */}
        <div className="relative z-10 my-auto py-8">
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-white tracking-tight leading-[1.25] max-w-lg">
            Ajukan, pantau, dan selesaikan pengadaan dalam satu tempat.
          </h1>
          <p className="text-sm sm:text-base text-white/85 font-normal leading-relaxed mt-4 max-w-md">
            Alur pengajuan hingga barang diterima tercatat rapi, transparan, dan mudah ditelusuri.
          </p>

          {/* Kartu Simulasi Status Pengadaan */}
          <div className="mt-8 bg-white rounded-2xl p-5 shadow-[0_16px_36px_rgba(10,40,30,0.2)] max-w-sm border border-white/40 relative">
            {/* Badge Mengambang Kanan Atas */}
            <div className="absolute -top-3.5 right-4 bg-[#E4F6EC] text-[#0B7A4E] border border-[#ABEFC6] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Dokumen disetujui</span>
            </div>

            {/* Judul & Status Paket */}
            <div className="flex items-start justify-between gap-2 mb-4 pt-1">
              <div>
                <h2 className="text-xs font-bold text-[#14201C] leading-snug">
                  Pengadaan Komputer Lab
                </h2>
                <p className="text-[11px] font-medium text-[#8A9A95] mt-0.5">
                  No. 01010-FF-11
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#B54708] bg-[#FEF6EE] border border-[#FECDCA] px-2.5 py-0.5 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F79009]" />
                <span>Sedang Diproses</span>
              </span>
            </div>

            {/* Garis Stepper Progress Alur */}
            <div className="flex items-center w-full px-1">
              {/* Step 1 */}
              <div className="w-5 h-5 rounded-full bg-[#0E7C5A] text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </div>
              <div className="h-[2px] flex-1 bg-[#0E7C5A]" />

              {/* Step 2 */}
              <div className="w-5 h-5 rounded-full bg-[#0E7C5A] text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </div>
              <div className="h-[2px] flex-1 bg-[#0E7C5A]" />

              {/* Step 3 (Aktif) */}
              <div className="w-5 h-5 rounded-full border-2 border-[#0E7C5A] bg-white flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#0E7C5A]" />
              </div>
              <div className="h-[2px] flex-1 bg-[#E4EBE8]" />

              {/* Step 4 */}
              <div className="w-5 h-5 rounded-full border-2 border-[#E4EBE8] bg-white shrink-0" />
              <div className="h-[2px] flex-1 bg-[#E4EBE8]" />

              {/* Step 5 */}
              <div className="w-5 h-5 rounded-full border-2 border-[#E4EBE8] bg-white shrink-0" />
            </div>

            <p className="text-[11px] font-medium text-[#5F6F6A] mt-3">
              Tahap 3 dari 5 • Pembelian Barang
            </p>
          </div>
        </div>

        {/* Footer Kiri */}
        <div className="relative z-10 pt-4 text-xs text-white/75 font-normal">
          &copy; 2026 SIPBAJA &bull; Sistem Informasi Pengadaan Barang dan Jasa
        </div>
      </div>

      {/* Sisi Kanan: Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[440px] bg-white rounded-[24px] sm:rounded-[28px] border border-[#E4EBE8] shadow-[0_12px_32px_rgba(13,51,38,0.06)] p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-[#14201C] tracking-tight">
            Masuk ke SIPBAJA
          </h2>
          <p className="text-xs sm:text-sm text-[#5F6F6A] mt-1.5 mb-6">
            Gunakan akun Anda untuk melanjutkan.
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {/* Input Email / Username */}
            <div>
              <label
                htmlFor="login"
                className="block text-xs font-semibold text-[#14201C] mb-2"
              >
                Email / Username
              </label>
              <input
                id="login"
                type="text"
                value={data.login || ''}
                onChange={(e) => setData('login', e.target.value)}
                placeholder="Masukkan email atau username"
                autoComplete="username"
                autoFocus
                className={`w-full min-h-[46px] rounded-xl bg-white border px-3.5 py-2.5 text-sm text-[#14201C] placeholder:text-[#8A9A95] focus:outline-none focus:border-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A]/20 transition-all hover:border-[#CFDAD6] ${
                  errors.login ? 'border-[#E5484D]' : 'border-[#E4EBE8]'
                }`}
              />
              {errors.login && (
                <p className="mt-1.5 text-xs text-[#D92D20] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.login}</span>
                </p>
              )}
            </div>

            {/* Input Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#14201C] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={data.password || ''}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className={`w-full min-h-[46px] rounded-xl bg-white border pl-3.5 pr-10 py-2.5 text-sm text-[#14201C] placeholder:text-[#8A9A95] focus:outline-none focus:border-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A]/20 transition-all hover:border-[#CFDAD6] ${
                    errors.password ? 'border-[#E5484D]' : 'border-[#E4EBE8]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A9A95] hover:text-[#5F6F6A] transition-colors p-1"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-[#D92D20] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Baris Opsi Ingat Saya & Lupa Password */}
            <div className="flex items-center justify-between text-xs mt-1 mb-2">
              <label className="flex items-center gap-2 cursor-pointer text-[#5F6F6A] font-medium select-none">
                <input
                  type="checkbox"
                  checked={Boolean(data.remember)}
                  onChange={(e) => setData('remember', e.target.checked)}
                  className="w-4 h-4 rounded border-[#CFDBD5] text-[#0E7C5A] focus:ring-[#0E7C5A] focus:ring-offset-0 cursor-pointer"
                />
                <span>Ingat saya</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  alert('Silakan hubungi administrator unit kerja Anda untuk reset kata sandi.')
                }
                className="font-semibold text-[#0E7C5A] hover:underline"
              >
                Lupa password?
              </button>
            </div>

            {/* Tombol Masuk */}
            <button
              type="submit"
              disabled={processing}
              className="w-full min-h-[48px] rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white text-sm font-semibold flex items-center justify-center transition-all shadow-[0_8px_18px_rgba(13,51,38,0.25)] hover:shadow-[0_10px_22px_rgba(13,51,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {processing ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Bantuan */}
          <p className="text-center text-xs text-[#8A9A95] mt-6">
            Butuh bantuan? Hubungi admin unit Anda.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginTemplate;
