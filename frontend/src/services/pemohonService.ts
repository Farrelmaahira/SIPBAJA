import api from './api';
import type {
  PermohonanListApiResponse,
  PermohonanDetailApiResponse,
} from '../types/permohonan';
import type {
  RingkasanPemohon,
  PermohonanAktifItem,
  StatistikBulananItem,
} from '../hooks/usePemohonDashboard';

export interface PemohonDashboardData {
  ringkasan?: RingkasanPemohon;
  permohonanAktif?: PermohonanAktifItem[];
  statistikBulanan?: StatistikBulananItem[];
  tahunAktif?: number;
}

export interface PemohonMutationResponse {
  message: string;
  data?: unknown;
  permohonan?: unknown;
}

export const pemohonService = {
  /**
   * Mengambil data agregasi dashboard Pemohon (ringkasan, permohonan aktif, statistik bulanan).
   */
  async getDashboard(
    params?: { tahun?: number },
    signal?: AbortSignal
  ): Promise<PemohonDashboardData> {
    const response = await api.get<PemohonDashboardData>('/v1/pemohon/dashboard', {
      params,
      signal,
    });
    return response.data;
  },

  /**
   * Mengambil daftar seluruh permohonan pengadaan untuk unit Pemohon dengan filter dan paginasi.
   */
  async getPermohonanList(
    params?: { search?: string; status?: string; page?: number },
    signal?: AbortSignal
  ): Promise<PermohonanListApiResponse> {
    const response = await api.get<PermohonanListApiResponse>(
      '/v1/pemohon/permohonan',
      {
        params,
        signal,
      }
    );
    return response.data;
  },

  /**
   * Mengambil detail lengkap permohonan pengadaan untuk Pemohon (termasuk timeline dan catatan penolakan).
   */
  async getPermohonanDetail(
    id: number | string,
    signal?: AbortSignal
  ): Promise<PermohonanDetailApiResponse> {
    const response = await api.get<PermohonanDetailApiResponse>(
      `/v1/pemohon/permohonan/${id}`,
      { signal }
    );
    return response.data;
  },

  /**
   * Mengirim permohonan pengadaan baru (multipart/form-data).
   */
  async storePermohonan(formData: FormData): Promise<PemohonMutationResponse> {
    const response = await api.post<PemohonMutationResponse>(
      '/v1/pemohon/permohonan',
      formData
    );
    return response.data;
  },

  /**
   * Mengirim pengajuan revisi untuk permohonan yang ditolak (multipart/form-data).
   */
  async revisiPermohonan(
    id: number | string,
    formData: FormData
  ): Promise<PemohonMutationResponse> {
    const response = await api.post<PemohonMutationResponse>(
      `/v1/pemohon/permohonan/${id}/revisi`,
      formData
    );
    return response.data;
  },

  /**
   * Mendapatkan endpoint URL untuk download file dokumen permohonan.
   */
  getDokumenDownloadUrl(id: number | string): string {
    return `/api/v1/pemohon/permohonan/${id}/dokumen`;
  },
};

export default pemohonService;

