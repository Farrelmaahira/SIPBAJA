import type { FC } from 'react';
import ErrorTemplate from '../../components/templates/ErrorTemplate';

export interface Error503Props {
  status?: number;
}

export const Error503: FC<Error503Props> = ({ status = 503 }) => {
  return (
    <ErrorTemplate
      status={status}
      title="Perawatan Sistem"
      message="SIPBAJA sedang perawatan. Coba lagi nanti."
    />
  );
};

export default Error503;
