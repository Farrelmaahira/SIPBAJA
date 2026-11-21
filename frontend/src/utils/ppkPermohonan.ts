import type { DokumenItem } from '../types/dokumen';
import type { CatatanPerencanaanData } from '../types/bidang2';
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
  ppk_nama?: string | null;
  [key: string]: unknown;
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
  catatanPerencanaan?: CatatanPerencanaanData | null;
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

  const makList: PpkPermohonanMakView[] =
    detail.mak_list && detail.mak_list.length > 0
      ? detail.mak_list.map((m) => ({
          id: m.id,
          kode: m.kode,
          nama: m.nama,
          ppk_nama: m.ppk_nama ?? null,
        }))
      : makItems.map((item) => {
          const mak = item.Mak ?? item.mak;
          const ppk = (mak as { Ppk?: { nama?: string } | null; ppk?: { nama?: string } | null } | null | undefined)?.Ppk
            ?? (mak as { Ppk?: { nama?: string } | null; ppk?: { nama?: string } | null } | null | undefined)?.ppk;

          return {
            id: item.id,
            kode: mak?.kode ?? String(mak?.id ?? item.mak_id),
            nama: mak?.nama ?? 'Jenis MAK',
            ppk_nama: ppk?.nama ?? null,
          };
        });

  let catatanPerencanaan: CatatanPerencanaanData | null = detail.catatan_perencanaan ?? null;
  if (!catatanPerencanaan && permohonan) {
    const approvals = (permohonan.Approvals ?? permohonan.approvals ?? []) as Array<Record<string, any>>;
    const appPerencanaan = approvals.find((a) => {
      const t = String(a.tahap || '').toUpperCase();
      return t === 'PERENCANAAN';
    });
    if (appPerencanaan) {
      catatanPerencanaan = {
        pemeriksa_nama: String(appPerencanaan.actor?.nama ?? appPerencanaan.actor?.name ?? 'Tim Perencanaan'),
        pemeriksa_peran: 'Tim Perencanaan',
        tanggal: appPerencanaan.created_at ? String(appPerencanaan.created_at) : null,
        catatan: appPerencanaan.alasan ? String(appPerencanaan.alasan) : null,
      };
    }
  }

  return {
    nomorSurat: permohonan.nomor_surat ?? '-',
    judul: permohonan.judul ?? '-',
    unitNama: permohonan.Unit?.nama ?? permohonan.unit?.nama ?? '-',
    tanggal: permohonan.created_at ?? null,
    estimasiAnggaran: normalisasiNominal(permohonan.estimasi_anggaran),
    status: permohonan.status ?? '',
    makList,
    dokumenList: detail.dokumen_permohonan ?? [],
    canDecide: decision.canDecide,
    decisionBlockedReason: decision.reason,
    catatanPerencanaan,
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
