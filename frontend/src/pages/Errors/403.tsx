import type { FC } from 'react';
import ErrorTemplate from '../../components/templates/ErrorTemplate';

export interface Error403Props {
  status?: number;
}

export const Error403: FC<Error403Props> = ({ status = 403 }) => {
  return (
    <ErrorTemplate
      status={status}
      title="Akses Ditolak"
      message="Akun ini tidak punya izin membuka halaman tersebut."
    />
  );
};

export default Error403;
