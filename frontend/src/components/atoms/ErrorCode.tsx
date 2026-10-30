import type { FC } from 'react';

export interface ErrorCodeProps {
  code: number | string;
}

export const ErrorCode: FC<ErrorCodeProps> = ({ code }) => {
  return (
    <p aria-hidden="true" className="text-6xl font-bold tracking-tight text-slate-900">
      {code}
    </p>
  );
};

export default ErrorCode;
