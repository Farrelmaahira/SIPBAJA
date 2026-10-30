import type { FC } from 'react';
import ErrorTemplate from '../../components/templates/ErrorTemplate';

export interface Error419Props {
  status?: number;
}

export const Error419: FC<Error419Props> = ({ status = 419 }) => {
  return (
    <ErrorTemplate
      status={status}
      title="Sesi Kedaluwarsa"
      message="Sesi habis. Buka kembali halaman login lalu coba lagi."
      actionHref="/"
      actionLabel="Kembali ke Login"
    />
  );
};

export default Error419;
