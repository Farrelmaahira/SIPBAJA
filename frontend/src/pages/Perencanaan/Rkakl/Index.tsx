import { useState, useRef, useEffect, type FC, type FormEvent } from 'react';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Pencil,
  X,
} from 'lucide-react';
import api from '../../../services/api';
import PpLayout from '../../../components/templates/PpLayout';
import DocumentPreviewModal from '../../../components/organisms/DocumentPreviewModal';
import { PERENCANAAN_NAV_ITEMS } from '../Dashboard';

export const PerencanaanRkaklIndex: FC = () => {
  const [rkakl, setRkakl] = useState<any>({});
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState('RKAKL_TA_2026_Satker_Politeknik_v4.pdf');
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRkakl = async () => {
    try {
      const res = await api.get<{ rkakl?: any; data?: any }>('/v1/perencanaan/rkakl');
      setRkakl(res.data.rkakl || res.data.data || res.data);
    } catch (err) {
      console.error('Failed to fetch RKAKL:', err);
    }
  };

  useEffect(() => {
    fetchRkakl();
  }, []);

  const activeFilename =
    rkakl.active_doc?.nama_asli ||
    (rkakl.active_doc?.path
      ? rkakl.active_doc.path.split('/').pop()
      : 'RKAKL_TA_2026_Satker_Politeknik_v3.pdf');

  const activeVersion = rkakl.active_doc?.versi || 3;

  const historyList =
    rkakl.history && rkakl.history.length > 0
      ? rkakl.history.map((h: any, i: number) => ({
          id: h.id || i,
          filename:
            h.nama_asli ||
            (h.path ? h.path.split('/').pop() : `RKAKL_TA_2026_Satker_Politeknik_v${2 - i}.pdf`),
          meta:
            i === 0 ? 'PDF • 5 MB • Diganti 02 Sep 2026' : 'PDF • 5 MB • Diganti 14 Agu 2026',
        }))
      : [
          {
            id: 'h-1',
            filename: 'RKAKL_TA_2026_Satker_Politeknik_v2.pdf',
            meta: 'PDF • 5 MB • Diganti 02 Sep 2026',
          },
          {
            id: 'h-2',
            filename: 'RKAKL_TA_2026_Satker_Politeknik_v1.pdf',
            meta: 'PDF • 5 MB • Diganti 14 Agu 2026',
          },
        ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };

  const handleReplaceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await api.post('/v1/perencanaan/rkakl', {
        filename: selectedFile || 'RKAKL_TA_2026_Satker_Politeknik_v4.pdf',
      });
      setReplaceModalOpen(false);
      await fetchRkakl();
    } catch (err) {
      console.error('Failed to update RKAKL:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PpLayout
      activeRoute="rkakl"
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
              Dokumen RKAKL
            </h1>
            <p className="text-xs sm:text-sm text-white/85 mt-1.5">
              Kelola dokumen RKAKL yang dipakai sebagai acuan verifikasi anggaran.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setReplaceModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#F1F7F4] text-[#0E7C5A] text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Ganti Dokumen</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 cols): Dokumen RKAKL Aktif Live Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F4F2]">
              <div>
                <h2 className="text-base font-bold text-[#14201C]">Dokumen RKAKL Aktif</h2>
                <p className="text-xs text-[#8A9A95] mt-0.5">
                  Pratinjau dokumen RKAKL yang dipakai sebagai acuan verifikasi
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EAF6F1] text-[#0E7C5A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C5A]" />
                Live Preview
              </span>
            </div>

            {/* File Action Bar */}
            <div className="p-3.5 rounded-2xl bg-[#F4F7F5] border border-[#E4EBE8] flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#14201C] truncate">{activeFilename}</p>
                  <p className="text-[11px] text-[#8A9A95]">PDF • 5 MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setFullPreviewOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#14201C] hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#5F6F6A]" />
                  <span>Lihat</span>
                </button>
              </div>
            </div>

            {/* Simulated Paper Sheet */}
            <div className="rounded-2xl bg-[#EFF3F1] p-5 sm:p-7">
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs min-h-[300px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-[#0E7C5A]">
                    <div>
                      <p className="text-xs font-extrabold text-[#14201C] uppercase tracking-wide">
                        RKA-K/L TAHUN ANGGARAN 2026
                      </p>
                      <p className="text-[11px] text-[#8A9A95]">Pengadaan Barang &amp; Jasa</p>
                    </div>
                  </div>

                  <div className="py-4 space-y-1 text-xs text-[#5F6F6A]">
                    <p>
                      <span className="inline-block w-24 text-[#8A9A95]">Versi Dokumen</span>:{' '}
                      <strong className="text-[#14201C]">Versi {activeVersion}</strong>
                    </p>
                    <p>
                      <span className="inline-block w-24 text-[#8A9A95]">Status</span>:{' '}
                      <strong className="text-[#0E7C5A]">Aktif Digunakan</strong>
                    </p>
                  </div>

                  <p className="text-xs text-[#5F6F6A] leading-relaxed">
                    Dokumen acuan pagu anggaran yang telah disahkan untuk proses verifikasi mata
                    anggaran kegiatan (MAK) di lingkungan kampus.
                  </p>
                </div>

                <div className="pt-6 flex justify-between items-end text-xs text-[#8A9A95]">
                  <span className="px-3.5 py-1 rounded-full bg-[#14201C] text-white text-[11px] font-bold">
                    Halaman 1 dari 1
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Riwayat Versi Dokumen */}
        <div className="space-y-6">
          <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
            <h3 className="text-base font-bold text-[#14201C] mb-4 pb-3 border-b border-[#F0F4F2]">
              Riwayat Versi Dokumen
            </h3>

            <div className="space-y-3">
              {historyList.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-[#E4EBE8] bg-[#FAFCFB] flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-[#14201C] truncate">{item.filename}</p>
                    <p className="text-[11px] text-[#8A9A95] mt-0.5">{item.meta}</p>
                  </div>
                  <Download className="w-4 h-4 text-[#8A9A95] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Replace Dokumen */}
      {replaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <form
            onSubmit={handleReplaceSubmit}
            className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-xl w-full max-w-[480px] p-6 flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#14201C]">Ganti Dokumen RKAKL</h3>
              <button
                type="button"
                onClick={() => setReplaceModalOpen(false)}
                className="text-[#8A9A95] hover:text-[#14201C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-[#F5F8F6] border-2 border-dashed border-[#E4EBE8] hover:border-[#0E7C5A] p-6 text-center cursor-pointer transition"
            >
              <Upload className="w-8 h-8 text-[#0E7C5A] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#14201C]">{selectedFile}</p>
              <p className="text-[11px] text-[#8A9A95] mt-1">Klik untuk pilih file PDF pengganti</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReplaceModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white disabled:opacity-50"
              >
                {processing ? 'Menyimpan...' : 'Perbarui Dokumen'}
              </button>
            </div>
          </form>
        </div>
      )}

      <DocumentPreviewModal
        isOpen={fullPreviewOpen}
        onClose={() => setFullPreviewOpen(false)}
        category="Dokumen RKAKL"
        filename={activeFilename}
        size="PDF • 5 MB"
      />
    </PpLayout>
  );
};

export default PerencanaanRkaklIndex;
