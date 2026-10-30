import React from 'react';
import PpProfilIndex from '../../Pp/Profil/Index';
import { PERENCANAAN_NAV_ITEMS } from '../Dashboard';

export default function Index(props) {
    return (
        <PpProfilIndex
            {...props}
            basePath="/perencanaan"
            roleInitials="PR"
            roleTitle="Perencanaan"
            roleSubtitle="Unit Perencanaan"
            navItems={PERENCANAAN_NAV_ITEMS}
        />
    );
}
