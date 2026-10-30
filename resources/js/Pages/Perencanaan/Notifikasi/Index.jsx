import React from 'react';
import PpNotifikasiIndex from '../../Pp/Notifikasi/Index';
import { PERENCANAAN_NAV_ITEMS } from '../Dashboard';

export default function Index(props) {
    return (
        <PpNotifikasiIndex
            {...props}
            basePath="/perencanaan"
            roleInitials="PR"
            roleTitle="Perencanaan"
            roleSubtitle="Pejabat Perencanaan"
            navItems={PERENCANAAN_NAV_ITEMS}
        />
    );
}
