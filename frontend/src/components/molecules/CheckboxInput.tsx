import type { FC, InputHTMLAttributes } from 'react';

export interface CheckboxInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const CheckboxInput: FC<CheckboxInputProps> = ({
  id,
  checked = false,
  onChange,
  label,
  className = '',
  ...props
}) => {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2.5 min-h-[44px] cursor-pointer ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 shrink-0 rounded-md border-[#E4EBE8] accent-[#0E7C5A] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A]"
        {...props}
      />
      {label && <span className="text-sm text-[#14201C]">{label}</span>}
    </label>
  );
};

export default CheckboxInput;
