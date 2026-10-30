import type { FC, ChangeEvent } from 'react';

export interface MoneyInputProps {
  id?: string;
  name?: string;
  value?: number | string;
  onChange: (value: number | '') => void;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
}

export const MoneyInput: FC<MoneyInputProps> = ({
  id = 'estimasi_anggaran',
  name = 'estimasi_anggaran',
  value,
  onChange,
  placeholder = 'Contoh: 888.000.000',
  error,
  disabled = false,
}) => {
  // Format angka ke string ribuan (contoh: 1500000 -> 1.500.000)
  const formatDisplay = (val?: number | string): string => {
    if (val === undefined || val === null || val === '') return '';
    const clean = String(val).replace(/\D/g, '');
    if (!clean) return '';
    return Number(clean).toLocaleString('id-ID');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    onChange(raw ? Number(raw) : '');
  };

  return (
    <div className="w-full">
      <div
        className={`flex items-stretch rounded-xl border bg-white overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-[#0E7C5A] focus-within:ring-offset-1 ${
          error ? 'border-[#FDA29B]' : 'border-[#D0D5DD] focus-within:border-[#0E7C5A]'
        }`}
      >
        <div className="flex items-center justify-center px-4 bg-[#E4F6EC] border-r border-[#D0D5DD] text-[#0E7C5A] font-semibold text-sm select-none">
          Rp
        </div>
        <input
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={formatDisplay(value)}
          onChange={handleChange}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full px-3.5 py-2.5 text-sm text-[#1D2939] placeholder-[#98A2B3] bg-transparent border-0 focus:outline-none focus:ring-0 disabled:bg-[#F2F4F7] disabled:cursor-not-allowed"
        />
      </div>

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-[#D92D20] font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default MoneyInput;
