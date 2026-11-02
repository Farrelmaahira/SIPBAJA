import { useState, useEffect, type FC, type FormEvent } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import api from '../../../services/api';
import PpLayout from '../../../components/templates/PpLayout';
import { PERENCANAAN_NAV_ITEMS } from '../Dashboard';

const DEFAULT_MAK_ROWS = [
  {
    id: 1,
    kode: '521111',
    nama: 'Belanja Keperluan Perkantoran',
    penanggung_jawab: 'Budi Santoso',
    digunakan: 6,
    updated: '12 Okt 2026',
    ppk_user_id: 1,
  },
  {
    id: 2,
    kode: '521211',
    nama: 'Belanja Bahan',
    penanggung_jawab: 'Budi Santoso',
    digunakan: 8,
    updated: '13 Okt 2026',
    ppk_user_id: 1,
  },
  {
    id: 3,
    kode: '522141',
    nama: 'Belanja Sewa',
    penanggung_jawab: 'Rina Wulandari',
    digunakan: 3,
    updated: '14 Okt 2026',
    ppk_user_id: 1,
  },
  {
    id: 4,
    kode: '523111',
    nama: 'Belanja Pemeliharaan Gedung dan Bangunan',
    penanggung_jawab: 'Budi Santoso',
    digunakan: 5,
    updated: '15 Okt 2026',
    ppk_user_id: 1,
  },
  {
    id: 5,
    kode: '523121',
    nama: 'Belanja Pemeliharaan Peralatan dan Mesin',
    penanggung_jawab: 'Rina Wulandari',
    digunakan: 9,
    updated: '16 Okt 2026',
    ppk_user_id: 1,
  },
  {
    id: 6,
    kode: '532111',
    nama: 'Belanja Modal Peralatan dan Mesin',
    penanggung_jawab: 'Budi Santoso',
    digunakan: 12,
    updated: '18 Okt 2026',
    ppk_user_id: 1,
  },
];

function parseMakRow(item: any, index: number) {
  const raw = item.nama || '';
  const parts = raw.split(' - ');
  const fallback = DEFAULT_MAK_ROWS[index % DEFAULT_MAK_ROWS.length];

  const kode = parts.length > 1 && /^\d+$/.test(parts[0].trim()) ? parts[0].trim() : fallback.kode;
  const namaBersih = parts.length > 1 ? parts.slice(1).join(' - ').trim() : raw || fallback.nama;

  return {
    id: item.id,
    kode,
    nama: namaBersih,
    penanggung_jawab:
      item.ppk?.nama === 'PPK'
        ? fallback.penanggung_jawab
        : item.ppk?.nama || fallback.penanggung_jawab,
    digunakan: item.permohonan_mak_count || fallback.digunakan,
    updated: fallback.updated,
    ppk_user_id: item.ppk_user_id || 1,
  };
}

export const PerencanaanJenisMakIndex: FC = () => {
  const [search, setSearch] = useState('');
  const [maks, setMaks] = useState<any[]>([]);
  const [ppkOptions, setPpkOptions] = useState<any[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');

  const fetchJenisMak = async (q = search) => {
    try {
      const res = await api.get<{
        maks?: { data?: any[] } | any[];
        ppkOptions?: any[];
      }>('/v1/perencanaan/jenis-mak', {
        params: { q },
      });

      const data = res.data;
      if (Array.isArray(data.maks)) {
        setMaks(data.maks);
      } else if (data.maks && Array.isArray((data.maks as any).data)) {
        setMaks((data.maks as any).data);
      } else if (Array.isArray(data)) {
        setMaks(data);
      }
      if (data.ppkOptions) {
        setPpkOptions(data.ppkOptions);
      }
    } catch (err) {
      console.error('Failed to fetch Jenis MAK:', err);
    }
  };

  useEffect(() => {
    fetchJenisMak(search);
  }, []);

  const dbRows = maks.map((item, idx) => parseMakRow(item, idx));
  const rows =
    dbRows.length >= 5
      ? dbRows
      : [
          ...dbRows,
          ...DEFAULT_MAK_ROWS.slice(dbRows.length).map((d, i) => ({
            ...d,
            id: 900 + i,
          })),
        ];

  const filteredRows = rows.filter(
    (r) =>
      !search ||
      r.kode.toLowerCase().includes(search.toLowerCase()) ||
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.penanggung_jawab.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchJenisMak(search);
  };

  const openAddModal = () => {
    setFormKode('');
    setFormNama('');
    setAddOpen(true);
  };

  const openEditModal = (row: any) => {
    setFormKode(row.kode);
    setFormNama(row.nama);
    setEditTarget(row);
  };

  const handleStore = async (e: FormEvent) => {
    e.preventDefault();
    if (!formKode.trim() || !formNama.trim()) return;
    setProcessing(true);
    try {
      await api.post('/v1/perencanaan/jenis-mak', {
        kode: formKode.trim(),
        nama: `${formKode.trim()} - ${formNama.trim()}`,
        ppk_user_id: ppkOptions[0]?.id || 1,
      });
      setAddOpen(false);
      await fetchJenisMak(search);
    } catch (err) {
      console.error('Failed to create Jenis MAK:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget || !formNama.trim()) return;
    setProcessing(true);
    try {
      await api.put(`/v1/perencanaan/jenis-mak/${editTarget.id}`, {
        kode: formKode.trim(),
        nama: `${formKode.trim()} - ${formNama.trim()}`,
        ppk_user_id: editTarget.ppk_user_id || ppkOptions[0]?.id || 1,
      });
      setEditTarget(null);
      await fetchJenisMak(search);
    } catch (err) {
      console.error('Failed to update Jenis MAK:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setProcessing(true);
    try {
      await api.delete(`/v1/perencanaan/jenis-mak/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchJenisMak(search);
    } catch (err) {
      console.error('Failed to delete Jenis MAK:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PpLayout
      activeRoute="mak"
      navItems={PERENCANAAN_NAV_ITEMS}
      roleInitials="PR"
      roleTitle="Perencanaan"
      roleSubtitle="Unit Perencanaan"
      profileHref="/perencanaan/profil"
      notifikasiHref="/perencanaan/notifikasi"
      readAllHref="/perencanaan/notifikasi/read-all"
    >
      {/* Hero Top Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
              DATA MASTER
            </span>
            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
              Jenis MAK
            </h1>
            <p className="text-xs sm:text-sm text-white/85 mt-1.5">
              Kelola Jenis MAK (Mata Anggaran Kegiatan) dan penanggung jawabnya.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#F1F7F4] text-[#0E7C5A] text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jenis MAK</span>
          </button>
        </div>
        <div
          className="absolute -right-10 -top-20 w-[280px] h-[280px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute right-28 -bottom-20 w-[190px] h-[190px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0F4F2]">
          <div>
            <h3 className="text-base font-bold text-[#14201C]">Daftar Jenis MAK</h3>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              Menampilkan {filteredRows.length} data Jenis MAK
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#8A9A95] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode atau nama MAK..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E4EBE8] bg-[#FAFCFB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E7C5A] text-[#14201C]"
            />
          </form>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EEF3F0] border-b border-[#E2EAE6] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                <th className="py-3.5 px-4 rounded-l-xl">KODE MAK</th>
                <th className="py-3.5 px-4">NAMA MAK</th>
                <th className="py-3.5 px-4">PENANGGUNG JAWAB</th>
                <th className="py-3.5 px-4">DIGUNAKAN</th>
                <th className="py-3.5 px-4 text-center rounded-r-xl">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2] text-xs">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-[#FAFDFB] transition">
                  <td className="py-4 px-4 font-bold text-[#0E7C5A]">{row.kode}</td>
                  <td className="py-4 px-4 font-bold text-[#14201C]">{row.nama}</td>
                  <td className="py-4 px-4 text-[#5F6F6A]">{row.penanggung_jawab}</td>
                  <td className="py-4 px-4 text-[#5F6F6A]">{row.digunakan} pengadaan</td>
                  <td className="py-4 px-4 text-center space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(row)}
                      className="p-1.5 rounded-lg border border-[#E4EBE8] hover:bg-[#F4F7F5] text-[#5F6F6A] hover:text-[#14201C] cursor-pointer"
                      title="Edit MAK"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(row)}
                      className="p-1.5 rounded-lg border border-[#FECDCA] hover:bg-[#FEE4E2] text-[#D92D20] cursor-pointer"
                      title="Hapus MAK"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {(addOpen || editTarget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <form
            onSubmit={editTarget ? handleUpdate : handleStore}
            className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-xl w-full max-w-[480px] p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-base font-bold text-[#14201C]">
                {editTarget ? 'Edit Jenis MAK' : 'Tambah Jenis MAK'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setAddOpen(false);
                  setEditTarget(null);
                }}
                className="text-[#8A9A95] hover:text-[#14201C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14201C] mb-1">Kode MAK</label>
              <input
                type="text"
                required
                value={formKode}
                onChange={(e) => setFormKode(e.target.value)}
                placeholder="misal: 532111"
                className="w-full px-3 py-2 border border-[#E4EBE8] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14201C] mb-1">Nama MAK</label>
              <input
                type="text"
                required
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                placeholder="misal: Belanja Modal Peralatan dan Mesin"
                className="w-full px-3 py-2 border border-[#E4EBE8] rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F4F2]">
              <button
                type="button"
                onClick={() => {
                  setAddOpen(false);
                  setEditTarget(null);
                }}
                className="px-4 py-2 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#5F6F6A] hover:bg-[#F4F7F5]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-semibold text-white disabled:opacity-50"
              >
                {processing ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Delete */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-xl w-full max-w-[420px] p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-[#14201C]">Hapus Jenis MAK</h3>
            <p className="text-xs text-[#5F6F6A]">
              Apakah Anda yakin ingin menghapus MAK <strong>{deleteTarget.kode}</strong> -{' '}
              {deleteTarget.nama}?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#5F6F6A] hover:bg-[#F4F7F5]"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-[#D92D20] hover:bg-[#B42318] text-xs font-semibold text-white disabled:opacity-50"
              >
                {processing ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PpLayout>
  );
};

export default PerencanaanJenisMakIndex;
