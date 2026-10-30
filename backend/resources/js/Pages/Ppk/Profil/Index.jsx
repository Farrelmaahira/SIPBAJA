import React from 'react';
import PpProfilIndex from '../../Pp/Profil/Index';
import { PPK_NAV_ITEMS } from '../Dashboard';

export default function Index(props) {
    return (
        <PpProfilIndex
            {...props}
            basePath="/ppk"
            roleInitials="PP"
            roleTitle="PPK"
            roleSubtitle="Unit PPK"
            navItems={PPK_NAV_ITEMS}
        />
    );
}
