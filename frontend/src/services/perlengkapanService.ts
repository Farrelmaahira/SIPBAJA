import api from './api';
import type {
  PerlengkapanDashboardData,
  PerlengkapanPengadaanDetail,
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

  /**
   * Mengambil detail pengadaan untuk Unit Perlengkapan.
   */
  async getPengadaanDetail(
    id: number | string,
    signal?: AbortSignal
  ): Promise<PerlengkapanPengadaanDetail> {
    const response = await api.get<PerlengkapanPengadaanDetail>(`/v1/perlengkapan/pengadaan/${id}`, {
      signal,
    });
    return response.data;
  },

  /**
   * Mengunggah dokumen barang/jasa dan foto dokumentasi fisik untuk serah terima barang.
   */
  async simpanPenerimaan(
    id: number | string,
    formData: FormData
  ): Promise<{ message: string; [key: string]: unknown }> {
    const response = await api.post(`/v1/perlengkapan/pengadaan/${id}/penerimaan`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default perlengkapanService;
