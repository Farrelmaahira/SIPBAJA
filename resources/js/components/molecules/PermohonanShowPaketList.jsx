import React from 'react';
import StatusPill from '../atoms/StatusPill';
import { formatRupiah } from '../../utils/formatters';

export default function PermohonanShowPaketList({ paketList = [] }) {
    if (!paketList || paketList.length === 0) {
        return (
            <p className="text-sm text-[#8A9A95] italic">
                Belum ada paket pengadaan yang dibuat dari permohonan ini.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-[#E4EBE8]">
            <table className="w-full text-left text-sm border-collapse">
                <thead>
                    <tr className="bg-[#F1F7F4] border-b border-[#E4EBE8] text-[11px] font-semibold text-[#5F6F6A] uppercase tracking-[0.8px]">
                        <th scope="col" className="py-3 px-4 w-12 text-center">No</th>
                        <th scope="col" className="py-3 px-4">MAK</th>
                        <th scope="col" className="py-3 px-4">Nominal</th>
                        <th scope="col" className="py-3 px-4 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F2] bg-white">
                    {paketList.map((paket, index) => (
                        <tr key={paket.id} className="hover:bg-[#F8FAF9] transition-colors">
                            <td className="py-3.5 px-4 text-center text-xs font-medium text-[#5F6F6A]">
                                {index + 1}
                            </td>
                            <td className="py-3.5 px-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EAF5F1] text-[#0A5C43] text-xs font-mono font-semibold">
                                    {paket.makKode}
                                </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-[#14201C] tabular-nums">
                                {formatRupiah(paket.nominal)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                                <StatusPill status={paket.status} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
