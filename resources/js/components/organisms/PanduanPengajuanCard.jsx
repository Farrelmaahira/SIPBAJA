import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PanduanPengajuanCard() {
    const checklistItems = [
        'Judul sesuai kebutuhan pengadaan',
        'Estimasi anggaran sesuai RAB',
        'Surat permohonan berformat PDF dan terbaca jelas',
    ];

    return (
        <div className="rounded-2xl border border-[#A3D9C9]/50 bg-[#F2F9F6] p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-[#A3D9C9]/40 flex items-center justify-center text-[#0E7C5A] shrink-0">
                    <ShieldCheck className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-[#1D2939]">Sebelum Mengirim</h3>
                    <p className="text-xs text-[#667085] mt-0.5">Pastikan data sudah benar</p>
                </div>
            </div>

            <ul className="space-y-3 pt-1">
                {checklistItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs text-[#344054] font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-[#0E7C5A] shrink-0 mt-0.5" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
