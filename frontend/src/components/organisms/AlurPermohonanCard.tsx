import type { FC } from 'react';
import AlurStepperItem, { type StepperBadgeVariant } from '../molecules/AlurStepperItem';

export interface AlurStep {
  stepNumber: number;
  title: string | null;
  badge?: string;
  badgeVariant?: StepperBadgeVariant;
  description: string;
  isActive: boolean;
}

export const AlurPermohonanCard: FC = () => {
  const steps: AlurStep[] = [
    {
      stepNumber: 1,
      title: 'Isi Formulir',
      badge: 'Anda di sini',
      badgeVariant: 'success',
      description: 'Lengkapi data dan unggah surat permohonan',
      isActive: true,
    },
    {
      stepNumber: 2,
      title: null,
      badge: '• Menunggu Persetujuan',
      badgeVariant: 'info',
      description: 'Tim memeriksa kelengkapan dokumen',
      isActive: false,
    },
    {
      stepNumber: 3,
      title: null,
      badge: '• Proses Pengadaan',
      badgeVariant: 'warning',
      description: 'Permohonan masuk ke proses pengadaan',
      isActive: false,
    },
    {
      stepNumber: 4,
      title: null,
      badge: '• Selesai',
      badgeVariant: 'success',
      description: 'Anda menerima hasil permohonan',
      isActive: false,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E4EBE8] p-6 shadow-sm">
      <div className="mb-5 pb-3 border-b border-[#F2F4F7]">
        <h3 className="text-base font-bold text-[#1D2939]">Alur Permohonan</h3>
        <p className="text-xs text-[#667085] mt-0.5">Perjalanan permohonan setelah dikirim</p>
      </div>

      <div className="pt-1">
        {steps.map((s, index) => (
          <AlurStepperItem
            key={s.stepNumber}
            stepNumber={s.stepNumber}
            title={s.title}
            badge={s.badge}
            badgeVariant={s.badgeVariant}
            description={s.description}
            isActive={s.isActive}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default AlurPermohonanCard;
