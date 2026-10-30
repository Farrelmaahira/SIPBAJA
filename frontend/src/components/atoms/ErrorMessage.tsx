import type { FC, ReactNode } from 'react';

export interface ErrorMessageProps {
  children: ReactNode;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ children }) => {
  return <p className="mt-2 text-sm text-slate-500">{children}</p>;
};

export default ErrorMessage;
