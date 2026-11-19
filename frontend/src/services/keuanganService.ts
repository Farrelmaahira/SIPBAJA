import api from './api';
import type { KeuanganDashboardData, KeuanganPengadaanListResponse } from '../types/keuangan';

export const keuanganService = {
  /**
   * Mengambil data dashboard untuk role Keuangan.
   */
  async getDashboard(signal?: AbortSignal): Promise<KeuanganDashboardData> {
    const response = await api.get<KeuanganDashboardData>('/v1/keuangan/dashboard', { signal });
    return response.data;
  },

  /**
   * Mengambil daftar pengadaan untuk role Keuangan dengan filter dan paginasi.
   */
  async getPengadaanList(
    params?: {
      page?: number;
      per_page?: number;
      search?: string;
      status?: string | string[];
    },
    signal?: AbortSignal
  ): Promise<KeuanganPengadaanListResponse> {
    const response = await api.get<KeuanganPengadaanListResponse>('/v1/keuangan/pengadaan', {
      params,
      signal,
    });
    return response.data;
  },
};

export default keuanganService;
