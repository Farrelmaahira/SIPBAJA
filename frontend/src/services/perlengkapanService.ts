import api from './api';
import type {
  PerlengkapanDashboardData,
  PerlengkapanPengadaanListResponse,
} from '../types/perlengkapan';

export const perlengkapanService = {
  /**
   * Mengambil data dashboard Unit Perlengkapan.
   */
  async getDashboard(signal?: AbortSignal): Promise<PerlengkapanDashboardData> {
    const response = await api.get<PerlengkapanDashboardData>('/v1/perlengkapan/dashboard', {
      signal,
    });
    return response.data;
  },

  /**
   * Mengambil daftar pengadaan Unit Perlengkapan dengan filter dan pagination.
   */
  async getPengadaanList(
    params?: {
      search?: string;
      status?: string | string[];
      page?: number;
      per_page?: number;
    },
    signal?: AbortSignal
  ): Promise<PerlengkapanPengadaanListResponse> {
    const response = await api.get<PerlengkapanPengadaanListResponse>('/v1/perlengkapan/pengadaan', {
      params,
      signal,
    });
    return response.data;
  },
};

export default perlengkapanService;
