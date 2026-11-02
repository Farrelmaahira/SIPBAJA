import type { FC } from 'react';
import PpPengajuanReview, { type PpReviewProps } from '../../Pp/Pengajuan/Review';
import { PPK_NAV_ITEMS } from '../Dashboard';

export const PpkPengajuanReview: FC<PpReviewProps> = (props) => {
  return (
    <PpPengajuanReview
      {...props}
      basePath="/ppk"
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      navItems={PPK_NAV_ITEMS}
      keputusanTitle="Keputusan PPK"
      keputusanNote="Khusus penandatanganan PPK. Pastikan seluruh dokumen pengadaan telah sesuai sebelum disetujui."
    />
  );
};

export default PpkPengajuanReview;
