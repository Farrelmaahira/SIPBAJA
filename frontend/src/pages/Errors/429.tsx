import type { FC } from 'react';
import ErrorTemplate from '../../components/templates/ErrorTemplate';

export interface Error429Props {
  status?: number;
}

export const Error429: FC<Error429Props> = ({ status = 429 }) => {
  return (
    <ErrorTemplate
      status={status}
      title="Terlalu Banyak Permintaan"
      message="Kurangi kecepatan lalu coba lagi sesaat."
    />
  );
};

export default Error429;
