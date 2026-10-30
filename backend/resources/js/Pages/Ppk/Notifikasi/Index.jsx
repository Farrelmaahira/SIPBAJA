import React from 'react';
import PpNotifikasiIndex from '../../Pp/Notifikasi/Index';
import { PPK_NAV_ITEMS } from '../Dashboard';

export default function Index(props) {
    return (
        <PpNotifikasiIndex
            {...props}
            basePath="/ppk"
            roleInitials="PPK"
            roleTitle="PPK"
            roleSubtitle="Pejabat Pembuat Komitmen"
            navItems={PPK_NAV_ITEMS}
        />
    );
}
