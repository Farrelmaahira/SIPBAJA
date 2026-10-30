import type { FC } from 'react';
import ErrorTemplate from '../../components/templates/ErrorTemplate';

export interface Error404Props {
  status?: number;
}

export const Error404: FC<Error404Props> = ({ status = 404 }) => {
  return (
    <ErrorTemplate
      status={status}
      title="Halaman Tidak Ditemukan"
      message="Alamat yang dibuka tidak tersedia atau sudah dipindahkan."
    />
  );
};

export default Error404;
