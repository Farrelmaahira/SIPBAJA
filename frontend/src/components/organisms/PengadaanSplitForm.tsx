import { useState, type FC, type FormEvent } from 'react';
import { Plus, Info, Send } from 'lucide-react';
import PengadaanSplitRow, {
  type PengadaanItem,
  type AvailableMak,
  type ReferenceData,
} from '../molecules/PengadaanSplitRow';

export interface PengadaanSplitFormProps {
  permohonanId?: number | string;
  estimasiAnggaran?: number;
  sisaAnggaran?: number;
  availableMak?: AvailableMak[];
  referenceData?: ReferenceData;
  onSubmit?: (data: { items: PengadaanItem[] }) => Promise<void> | void;
}

export const PengadaanSplitForm: FC<PengadaanSplitFormProps> = ({
  availableMak = [],
  referenceData = {},
  onSubmit,
}) => {
  const defaultItem = (): PengadaanItem => {
    const firstLevel = referenceData.level?.[0];

    return {
      permohonan_mak_id: availableMak[0]?.permohonan_mak_id
        ? String(availableMak[0].permohonan_mak_id)
        : '',
      jenis_id: referenceData.jenis?.[0]?.id ? String(referenceData.jenis[0].id) : '',
      metode_id: referenceData.metode?.[0]?.id ? String(referenceData.metode[0].id) : '',
      level_id: firstLevel?.id ? String(firstLevel.id) : '',
      dokumen: null,
    };
  };

  const [items, setItems] = useState<PengadaanItem[]>([defaultItem()]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleItemChange = (
    index: number,
    fieldOrUpdates: string | Record<string, unknown>,
    value?: unknown
  ) => {
    setItems((prev) => {
      const nextItems = [...prev];
      if (typeof fieldOrUpdates === 'object' && fieldOrUpdates !== null) {
        nextItems[index] = {
          ...nextItems[index],
          ...fieldOrUpdates,
        };
      } else {
        nextItems[index] = {
          ...nextItems[index],
          [fieldOrUpdates]: value,
        };
      }
      return nextItems;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, defaultItem()]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin membatalkan dan mereset form dokumen pengadaan?')) {
      setItems([defaultItem()]);
      setErrors({});
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (onSubmit) {
      setProcessing(true);
      try {
        await onSubmit({ items });
        setItems([defaultItem()]);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'errors' in err) {
          setErrors(err.errors as Record<string, string>);
        }
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      {/* List Kartu Dokumen Pengadaan - Memanjang ke samping, bertumpuk ke bawah */}
      <div className="flex flex-col gap-6 w-full">
        {items.map((item, index) => (
          <PengadaanSplitRow
            key={index}
            index={index}
            item={item}
            availableMak={availableMak}
            referenceData={referenceData}
            onChange={handleItemChange}
            onRemove={handleRemoveItem}
            canRemove={items.length > 1}
            errors={errors}
          />
        ))}
      </div>

      {/* Tombol Tambah Dokumen Pengadaan */}
      <button
        type="button"
        onClick={handleAddItem}
        className="w-full min-h-[52px] py-3.5 rounded-2xl border-2 border-dashed border-[#0E7C5A] bg-[#F7FBF9] text-[#0E7C5A] hover:bg-[#EBF7F2] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>Tambah Dokumen Pengadaan</span>
      </button>

      {/* Bar Aksi Bawah */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[#F0F4F2]">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#5F6F6A]">
          <Info className="w-4 h-4 shrink-0 text-[#8A9A95]" />
          <span>Pastikan setiap dokumen sudah memiliki MAK dan penanggung jawab sebelum dikirim.</span>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-sm font-semibold text-[#344054] hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={processing}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0E7C5A] text-white hover:bg-[#0B664A] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{processing ? 'Menyimpan...' : 'Kirim Pengadaan'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default PengadaanSplitForm;
