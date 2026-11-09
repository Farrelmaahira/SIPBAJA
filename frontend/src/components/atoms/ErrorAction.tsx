import type { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface ErrorActionProps {
  to?: string;
  href?: string;
  children: ReactNode;
}

export const ErrorAction: FC<ErrorActionProps> = ({ to, href, children }) => {
  const target = to || href || '/';
  return (
    <Link
      to={target}
      className="mt-6 inline-block w-full rounded-md bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  );
};

export default ErrorAction;
