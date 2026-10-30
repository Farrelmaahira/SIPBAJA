import React from 'react';

export default function PermohonanShowMakList({ makList = [] }) {
    if (!makList || makList.length === 0) {
        return (
            <p className="text-sm text-[#8A9A95] italic">
                Belum ada MAK yang ditentukan untuk permohonan ini.
            </p>
        );
    }

    return (
        <ul className="flex flex-col gap-2.5" aria-label="Daftar Mata Anggaran Kegiatan">
            {makList.map((mak, index) => (
                <li
                    key={`${mak.kode}-${index}`}
                    className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-[#F8FAF9] border border-[#E4EBE8]"
                >
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#EAF5F1] text-[#0A5C43] text-xs font-mono font-semibold">
                        {mak.kode}
                    </span>
                    <span className="text-sm text-[#14201C] font-medium">
                        {mak.nama}
                    </span>
                </li>
            ))}
        </ul>
    );
}
