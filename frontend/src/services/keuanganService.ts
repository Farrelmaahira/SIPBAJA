import api from './api';
import type {
  KeuanganDashboardData,
  KeuanganPengadaanListResponse,
  KeuanganPengadaanDetail,
} from '../types/keuangan';

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

  /**
   * Mengambil detail pengadaan untuk role Keuangan.
   */
  async getPengadaanDetail(
    id: number | string,
    signal?: AbortSignal
  ): Promise<KeuanganPengadaanDetail> {
    const response = await api.get<KeuanganPengadaanDetail>(`/v1/keuangan/pengadaan/${id}`, {
      signal,
    });
    return response.data;
  },

  /**
   * Mengunggah tanggal pembayaran dan bukti pembayaran pengadaan.
   */
  async storeBuktiBayar(
    id: number | string,
    formData: FormData,
    signal?: AbortSignal
  ): Promise<{ message: string; pengadaan_id: number; status: string }> {
    const response = await api.post(`/v1/keuangan/pengadaan/${id}/bukti-bayar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal,
    });
    return response.data;
  },
};

export default keuanganService;
