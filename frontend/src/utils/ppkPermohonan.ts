import type { DokumenItem } from '../types/dokumen';
import type {
  PpkPermohonanDetailPayload,
  PpkPermohonanItem,
  PpkPermohonanMakItem,
  PpkTableRow,
} from '../types/ppk';

export interface PpkPermohonanMakView {
  id: number | string;
  kode: string;
  nama: string;
}

export interface PpkPermohonanViewModel {
  nomorSurat: string;
  judul: string;
  unitNama: string;
  tanggal: string | null;
  estimasiAnggaran: number;
  status: string;
  makList: PpkPermohonanMakView[];
  dokumenList: DokumenItem[];
  canDecide: boolean;
  decisionBlockedReason: string | null;
}

export interface PpkDecisionState {
  canDecide: boolean;
  reason: string | null;
}

export function getPpkDecisionState(status: string, makCount: number): PpkDecisionState {
  if (status !== 'diteruskan') {
    if (status === 'diajukan') {
      return {
        canDecide: false,
        reason: 'Permohonan belum diverifikasi dan diteruskan oleh Tim Perencanaan. MAK belum ditetapkan.',
      };
    }

    if (status === 'disetujui') {
      return { canDecide: false, reason: 'Permohonan sudah disetujui oleh PPK dan Bidang 2.' };
    }

    if (status === 'ditolak') {
      return { canDecide: false, reason: 'Permohonan sudah ditolak.' };
    }

    return { canDecide: false, reason: null };
  }

  if (makCount === 0) {
    return { canDecide: false, reason: 'Jenis MAK belum ditetapkan oleh Tim Perencanaan.' };
  }

  return { canDecide: true, reason: null };
}

function normalisasiNominal(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalisasiMakList(
  detail: PpkPermohonanDetailPayload | null
): PpkPermohonanMakItem[] {
  return detail?.permohonan_mak_ppk ?? [];
}

export function normalizePpkPermohonanDetail(
  detail: PpkPermohonanDetailPayload | null
): PpkPermohonanViewModel | null {
  if (!detail?.permohonan) {
    return null;
  }

  const permohonan: PpkPermohonanItem = detail.permohonan;
  const makItems = normalisasiMakList(detail);
  const decision = getPpkDecisionState(permohonan.status ?? '', makItems.length);

  return {
    nomorSurat: permohonan.nomor_surat ?? '-',
    judul: permohonan.judul ?? '-',
    unitNama: permohonan.Unit?.nama ?? permohonan.unit?.nama ?? '-',
    tanggal: permohonan.created_at ?? null,
    estimasiAnggaran: normalisasiNominal(permohonan.estimasi_anggaran),
    status: permohonan.status ?? '',
    makList: makItems.map((item) => {
      const mak = item.Mak ?? item.mak;

      return {
        id: item.id,
        kode: mak?.kode ?? String(mak?.id ?? item.mak_id),
        nama: mak?.nama ?? 'Jenis MAK',
      };
    }),
    dokumenList: detail.dokumen_permohonan ?? [],
    canDecide: decision.canDecide,
    decisionBlockedReason: decision.reason,
  };
}

export function mapPpkPermohonanRows(items: PpkPermohonanItem[]): PpkTableRow[] {
  return items.map((item) => ({
    id: item.id,
    nomor_surat: item.nomor_surat ?? '-',
    judul: item.judul ?? '-',
    unit: item.Unit?.nama ?? item.unit?.nama ?? '-',
    tanggal: item.created_at ?? '-',
    nominal: normalisasiNominal(item.estimasi_anggaran ?? item.nominal),
    status: item.status ?? 'menunggu_persetujuan',
    sourceType: 'permohonan' as const,
  }));
}
