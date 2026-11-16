import api from './api';
import type { ApiMessageResponse } from '../types/api';
import type {
  PpDashboardResponse,
  PpPengajuanFilterParams,
  PpPengajuanListResponse,
  PpPengadaanDetailResponse,
} from '../types/pp';

export const ppService = {
  /**
   * Mengambil data statistik, grafik bulanan, dan daftar pengadaan perlu review untuk Dashboard PP.
   */
  async getDashboardData(signal?: AbortSignal): Promise<PpDashboardResponse> {
    const response = await api.get<PpDashboardResponse>('/v1/pp/dashboard', { signal });
    return response.data;
  },

  /**
   * Mengambil daftar pengajuan pengadaan level Rp50-200 juta untuk PP.
   */
  async getPengajuanList(
    params?: PpPengajuanFilterParams,
    signal?: AbortSignal
  ): Promise<PpPengajuanListResponse> {
    const response = await api.get<PpPengajuanListResponse>('/v1/pp/pengajuan', {
      params,
      signal,
    });
    return response.data;
  },

  /**
   * Mengambil detail dokumen pengadaan untuk halaman Review (mendukung basePath /pp maupun /ppk).
   */
  async getPengajuanReview(
    id: string | number,
    basePath = '/pp',
    signal?: AbortSignal
  ): Promise<PpPengadaanDetailResponse> {
    const response = await api.get<PpPengadaanDetailResponse>(
      `/v1${basePath}/pengajuan/${id}/review`,
      { signal }
    );
    return response.data;
  },

  /**
   * Mengambil detail rekap 5 tahap pengadaan (mendukung basePath /pp maupun /ppk).
   */
  async getPengajuanDetail(
    id: string | number,
    basePath = '/pp',
    signal?: AbortSignal
  ): Promise<PpPengadaanDetailResponse> {
    const response = await api.get<PpPengadaanDetailResponse>(
      `/v1${basePath}/pengajuan/${id}`,
      { signal }
    );
    return response.data;
  },

  /**
   * Menyetujui / memverifikasi dokumen pengadaan oleh PP (atau PPK melalui basePath).
   */
  async approvePengadaan(
    id: string | number,
    basePath = '/pp'
  ): Promise<ApiMessageResponse> {
    const response = await api.post<ApiMessageResponse>(
      `/v1${basePath}/pengajuan/${id}/approve`
    );
    return response.data;
  },

  /**
   * Menolak / meminta revisi dokumen pengadaan dengan catatan/alasan wajib.
   */
  async rejectPengadaan(
    id: string | number,
    alasan: string,
    basePath = '/pp'
  ): Promise<ApiMessageResponse> {
    const response = await api.post<ApiMessageResponse>(
      `/v1${basePath}/pengajuan/${id}/reject`,
      { alasan, catatan: alasan }
    );
    return response.data;
  },
};

export default ppService;
