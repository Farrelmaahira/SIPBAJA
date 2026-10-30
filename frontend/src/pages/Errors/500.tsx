import type { FC } from 'react';
import ErrorTemplate from '../../components/templates/ErrorTemplate';

export interface Error500Props {
  status?: number;
}

export const Error500: FC<Error500Props> = ({ status = 500 }) => {
  return (
    <ErrorTemplate
      status={status}
      title="Gangguan Server"
      message="Terjadi kesalahan di server. Coba lagi. Bila berlanjut, hubungi admin."
    />
  );
};

export default Error500;
