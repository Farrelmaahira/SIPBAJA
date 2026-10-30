import React from 'react';
import PpReview from '../../Pp/Pengajuan/Review';
import { PPK_NAV_ITEMS } from '../Dashboard';

export default function Review(props) {
    return (
        <PpReview
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
}
