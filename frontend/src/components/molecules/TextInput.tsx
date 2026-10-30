import type { FC, InputHTMLAttributes } from 'react';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | null;
}

export const TextInput: FC<TextInputProps> = ({
  id,
  value = '',
  onChange,
  placeholder = '',
  type = 'text',
  error,
  className = '',
  ...props
}) => {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-invalid={error ? 'true' : undefined}
      className={`w-full min-h-[44px] rounded-xl bg-[#F7FAF9] border px-3.5 py-2.5 text-sm text-[#14201C] placeholder-[#8A9A95] transition-all focus:outline-none focus:border-[#0E7C5A] focus:ring-2 focus:ring-[#0E7C5A]/20 hover:border-[#CFDAD6] disabled:bg-[#EEF2F0] disabled:text-[#8A9A95] ${
        error ? 'border-[#E5484D]' : 'border-[#E4EBE8]'
      } ${className}`}
      {...props}
    />
  );
};

export default TextInput;
