import React from 'react';
import PpShow from '../../Pp/Pengajuan/Show';
import { PPK_NAV_ITEMS } from '../Dashboard';

export default function Show(props) {
    return (
        <PpShow
            {...props}
            basePath="/ppk"
            roleInitials="PPK"
            roleTitle="PPK"
            roleSubtitle="Pejabat Pembuat Komitmen"
            navItems={PPK_NAV_ITEMS}
        />
    );
}
