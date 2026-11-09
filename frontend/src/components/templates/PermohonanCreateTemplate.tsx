import type { FC, FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from './AppLayout';
import HeroBanner from '../organisms/HeroBanner';
import PermohonanFormCard, {
  type PermohonanFormData,
  type PermohonanFormErrors,
} from '../organisms/PermohonanFormCard';
import AlurPermohonanCard from '../organisms/AlurPermohonanCard';
import PanduanPengajuanCard from '../organisms/PanduanPengajuanCard';
import { PEMOHON_NAV_ITEMS } from '../../constants/pemohonNav';
import type { ProfilePillUser } from '../molecules/ProfilePill';

export interface PermohonanCreateTemplateProps {
  user?: ProfilePillUser | null;
  data: PermohonanFormData;
  setData: (field: keyof PermohonanFormData, value: any) => void;
  errors: PermohonanFormErrors;
  processing?: boolean;
  onSubmit: (e: FormEvent) => void;
  onKembali?: () => void;
}

export const PermohonanCreateTemplate: FC<PermohonanCreateTemplateProps> = ({
  data,
  setData,
  errors,
  processing = false,
  onSubmit,
  onKembali,
}) => {
  return (
    <AppLayout
      activeRoute="permohonan"
      navItems={PEMOHON_NAV_ITEMS}
      roleInitials="PM"
      roleTitle="Pemohon"
      roleSubtitle="Unit Pemohon"
      profileHref="/pemohon/dashboard"
      notifikasiHref="/pemohon/dashboard"
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="PERMOHONAN BARU"
          title="Buat Permohonan Pengadaan"
          description="Lengkapi data berikut untuk membuat permohonan pengadaan."
          ctaLabel="Kembali"
          ctaIcon={ArrowLeft}
          ctaVariant="translucent"
          onCta={onKembali}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <PermohonanFormCard
              data={data}
              setData={setData}
              errors={errors}
              processing={processing}
              onSubmit={onSubmit}
            />
          </div>

          <div className="space-y-6">
            <AlurPermohonanCard />
            <PanduanPengajuanCard />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PermohonanCreateTemplate;
