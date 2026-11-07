import type { FC, ReactNode } from 'react';

export interface ErrorTitleProps {
  id?: string;
  prefix?: string;
  children: ReactNode;
}

export const ErrorTitle: FC<ErrorTitleProps> = ({ id, prefix, children }) => {
  return (
    <h1
      id={id}
      tabIndex={-1}
      className="mt-4 text-lg font-semibold text-slate-900 focus:outline-none"
    >
      {prefix ? <span className="sr-only">{prefix}: </span> : null}
      {children}
    </h1>
  );
};

export default ErrorTitle;
