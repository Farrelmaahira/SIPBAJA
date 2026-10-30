import { FileText, Package, Calendar, Eye, ArrowRight } from 'lucide-react';
import StatusPill from '../atoms/StatusPill';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';

export default function PpbjTabbedTable({
    activeTab = 'permohonan',
    onTabChange,
    searchQuery = '',
    onSearchChange,
    items = [],
    counts = { permohonan: 0, pengadaan: 0, termin: 0 },
}) {
    const tabs = [
        {
            key: 'permohonan',
            label: 'Permohonan Masuk',
            icon: FileText,
            count: counts.permohonan,
        },
        {
            key: 'pengadaan',
            label: 'Pengadaan Berjalan',
            icon: Package,
            count: counts.pengadaan,
        },
        {
            key: 'termin',
            label: 'Termin Kontrak',
            icon: Calendar,
            count: counts.termin,
        },
    ];

    return (
        <div className="bg-white rounded-[20px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] overflow-hidden">
            {/* Table / List Container */}
            <div className="overflow-x-auto">
                {items.length === 0 ? (
                    <div className="py-16 text-center text-[#8A9A95]">
                        <p className="text-base font-medium text-[#5F6F6A]">Tidak ada data yang ditemukan</p>
                        <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F1F7F4] border-b border-[#E4EBE8] text-[11px] font-semibold text-[#5F6F6A] uppercase tracking-[0.8px]">
                                {activeTab === 'permohonan' && (
                                    <>
                                        <th className="py-3 px-6">No Permohonan</th>
                                        <th className="py-3 px-6">Judul & Unit</th>
                                        <th className="py-3 px-6">Sumber Dana (MAK)</th>
                                        <th className="py-3 px-6">Estimasi Anggaran</th>
                                        <th className="py-3 px-6">Status</th>
                                        <th className="py-3 px-6 text-right">Aksi</th>
                                    </>
                                )}

                                {activeTab === 'pengadaan' && (
                                    <>
                                        <th className="py-3 px-6">No Surat</th>
                                        <th className="py-3 px-6">Paket Pengadaan</th>
                                        <th className="py-3 px-6">MAK & Level</th>
                                        <th className="py-3 px-6">Nominal Paket</th>
                                        <th className="py-3 px-6">Penanggung Jawab PPK</th>
                                        <th className="py-3 px-6">Status</th>
                                        <th className="py-3 px-6 text-right">Aksi</th>
                                    </>
                                )}

                                {activeTab === 'termin' && (
                                    <>
                                        <th className="py-3 px-6">No Kontrak / SPK</th>
                                        <th className="py-3 px-6">Pekerjaan</th>
                                        <th className="py-3 px-6">Termin</th>
                                        <th className="py-3 px-6">Nominal Termin</th>
                                        <th className="py-3 px-6">Jatuh Tempo</th>
                                        <th className="py-3 px-6">Status Bayar</th>
                                        <th className="py-3 px-6 text-right">Aksi</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4EBE8] text-sm">
                            {activeTab === 'permohonan' &&
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#F7FAF9] transition-colors">
                                        <td className="py-4 px-6 font-semibold text-[#0E7C5A]">
                                            {item.nomorSurat}
                                        </td>
                                        <td className="py-4 px-6 max-w-xs">
                                            <div className="font-medium text-[#14201C] line-clamp-1">{item.judul}</div>
                                            <div className="text-xs text-[#5F6F6A] mt-0.5">{item.unitNama}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-wrap gap-1">
                                                {item.makList?.length > 0 ? (
                                                    item.makList.map((mak, i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-block px-2 py-0.5 rounded-md bg-[#EAF5F1] text-[#0A5C43] text-xs font-medium"
                                                        >
                                                            {mak}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-[#8A9A95]">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-[#14201C]">
                                            {formatRupiah(item.estimasiAnggaran)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <StatusPill status={item.status} />
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF5F2] hover:bg-[#E1F0EA] text-[#0E7C5A] text-xs font-semibold transition-colors cursor-pointer"
                                            >
                                                <span>Paketkan</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                            {activeTab === 'pengadaan' &&
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#F7FAF9] transition-colors">
                                        <td className="py-4 px-6 font-semibold text-[#0E7C5A]">
                                            {item.nomorSurat}
                                        </td>
                                        <td className="py-4 px-6 max-w-xs">
                                            <div className="font-medium text-[#14201C] line-clamp-1">{item.judul}</div>
                                            <div className="text-xs text-[#5F6F6A] mt-0.5">{item.unitNama}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-[#14201C] text-xs">{item.makNama}</div>
                                            <div className="text-xs text-[#8A9A95]">{item.levelNama} ({item.metodeNama})</div>
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-[#14201C]">
                                            {formatRupiah(item.nominal)}
                                        </td>
                                        <td className="py-4 px-6 text-xs text-[#5F6F6A]">
                                            {item.ppkNama}
                                        </td>
                                        <td className="py-4 px-6">
                                            <StatusPill status={item.status} />
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                type="button"
                                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#EEF5F2] hover:bg-[#E1F0EA] text-[#0E7C5A] transition-colors cursor-pointer"
                                                title="Lihat Detail Paket"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                            {activeTab === 'termin' &&
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#F7FAF9] transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-[#0E7C5A]">{item.kontrakNomor}</div>
                                            <div className="text-xs text-[#8A9A95]">{item.kontrakTipe}</div>
                                        </td>
                                        <td className="py-4 px-6 max-w-xs">
                                            <div className="font-medium text-[#14201C] line-clamp-1">{item.judul}</div>
                                            <div className="text-xs text-[#5F6F6A] mt-0.5">{item.unitNama}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-block px-2.5 py-1 rounded-md bg-[#F1F7F4] text-[#0A5C43] text-xs font-semibold">
                                                Termin {item.terminKe}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-[#14201C]">
                                            {formatRupiah(item.nominalRencana)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-xs font-medium text-[#14201C]">
                                                {formatTanggalIndo(item.tanggalJatuhTempo)}
                                            </div>
                                            {item.reminderTanggal && (
                                                <div className="text-[11px] text-[#EAA023] mt-0.5">
                                                    Pengingat: {formatTanggalIndo(item.reminderTanggal)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <StatusPill status={item.pembayaranStatus} />
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                type="button"
                                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#EEF5F2] hover:bg-[#E1F0EA] text-[#0E7C5A] transition-colors cursor-pointer"
                                                title="Lihat Jadwal Termin"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
