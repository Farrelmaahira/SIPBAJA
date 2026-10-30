import { useEffect, useState, type FC } from 'react';
import { LayoutDashboard, ClipboardList, FileText, UploadCloud, Info } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import DashboardShellTemplate from '../../../components/templates/DashboardShellTemplate';

const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/bidang-2/dashboard',
  },
  {
    key: 'pengajuan',
    label: 'List Pengajuan',
    icon: ClipboardList,
    href: '/bidang-2/pengajuan',
  },
  {
    key: 'rkakl',
    label: 'Dokumen RKAKL',
    icon: FileText,
    href: '/bidang-2/rkakl',
  },
];

export const RkaklIndex: FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api
      .get('/v1/bidang-2/rkakl')
      .catch((err) => {
        console.error('Failed to fetch Bidang 2 RKAKL:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const sidebarProps = {
    navItems: NAV_ITEMS,
    activeRoute: 'rkakl',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'Menu',
  };

  const topbarProps = {
    user,
  };

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#14201C] tracking-tight">
            Dokumen RKAKL (Pagu Anggaran)
          </h1>
          <p className="text-sm text-[#5F6F6A] mt-1">
            Kelola dan tinjau dokumen Rencana Kerja dan Anggaran Kementerian/Lembaga kampus.
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white border border-[#E4EBE8] rounded-[18px] p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-3 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#5F6F6A]">Memuat dokumen RKAKL...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E4EBE8] rounded-[18px] p-8 text-center max-w-xl mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F5F1] text-[#0E7C5A] flex items-center justify-center mx-auto">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#14201C]">
                Pengelolaan Dokumen RKAKL
              </h2>
              <p className="text-xs text-[#5F6F6A] mt-1.5 leading-relaxed">
                Penyelarasan alokasi pagu anggaran RKAKL dengan kategori MAK (BLU Fisik, BLU Non-Fisik, RM Fisik, RM Non-Fisik). Dokumen referensi dapat ditinjau oleh Bidang 2 dan Perencanaan.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F2F6F4] text-[#5F6F6A] text-xs font-medium">
              <Info className="w-4 h-4 text-[#0E7C5A]" />
              <span>Modul sinkronisasi dokumen RKAKL aktif</span>
            </div>
          </div>
        )}
      </div>
    </DashboardShellTemplate>
  );
};

export default RkaklIndex;
