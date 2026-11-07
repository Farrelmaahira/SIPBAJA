import { useEffect, type FC, type ReactNode } from 'react';
import ErrorCode from '../atoms/ErrorCode';
import ErrorContent from '../molecules/ErrorContent';

export interface ErrorTemplateProps {
  status: number | string;
  title: ReactNode;
  message: ReactNode;
  actionHref?: string;
  actionLabel?: ReactNode;
}

export const ErrorTemplate: FC<ErrorTemplateProps> = ({
  status,
  title,
  message,
  actionHref = '/dashboard',
  actionLabel = 'Kembali ke Dashboard',
}) => {
  useEffect(() => {
    document.title = `Error ${status} | SIPBAJA`;
    document.getElementById('error-heading')?.focus();
  }, [status]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
          <ErrorCode code={status} />
          <ErrorContent
            title={title}
            message={message}
            actionHref={actionHref}
            actionLabel={actionLabel}
            titleId="error-heading"
            titlePrefix={`Galat ${status}`}
          />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Butuh bantuan? Hubungi admin.
        </p>
      </div>
    </div>
  );
};

export default ErrorTemplate;
