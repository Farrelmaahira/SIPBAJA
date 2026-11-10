import api from './api';
import type {
  Bidang2DetailApiResponse,
  Bidang2PengajuanListResponse,
  Bidang2MutationResponse,
} from '../types/bidang2';
import type {
  RingkasanBidang2,
  RiwayatTerbaruBidang2Item,
  StatistikBulananBidang2Item,
} from '../hooks/useBidang2Dashboard';

export interface Bidang2DashboardData {
  ringkasan?: RingkasanBidang2;
  riwayatTerbaru?: RiwayatTerbaruBidang2Item[];
  statistikBulanan?: StatistikBulananBidang2Item[];
  totalDisetujui?: number;
  totalDitolak?: number;
  tahunAktif?: number;
}

export const bidang2Service = {
  /**
   * Mengambil data agregasi dashboard Wakil Direktur II (Bidang 2).
   */
  async getDashboard(
    params?: { tahun?: number },
    signal?: AbortSignal
  ): Promise<Bidang2DashboardData> {
    const response = await api.get<Bidang2DashboardData>('/v1/bidang-2/dashboard', {
      params,
      signal,
    });
    return response.data;
  },

  /**
   * Mengambil daftar seluruh pengajuan permohonan untuk Bidang 2 dengan filter status dan pencarian.
   */
  async getPengajuanList(
    params?: { search?: string; status?: string; page?: number },
    signal?: AbortSignal
  ): Promise<Bidang2PengajuanListResponse> {
    const response = await api.get<Bidang2PengajuanListResponse>(
      '/v1/bidang-2/pengajuan',
      {
        params,
        signal,
      }
    );
    return response.data;
  },

  /**
   * Mengambil detail lengkap pengajuan permohonan beserta catatan Perencanaan dan info RKAKL.
   */
  async getPengajuanDetail(
    id: number | string,
    signal?: AbortSignal
  ): Promise<Bidang2DetailApiResponse> {
    const response = await api.get<Bidang2DetailApiResponse>(
      `/v1/bidang-2/pengajuan/${id}`,
      { signal }
    );
    return response.data;
  },

  /**
   * Memberikan persetujuan permohonan dengan mengunggah berkas memo persetujuan.
   */
  async approvePengajuan(
    id: number | string,
    formData: FormData
  ): Promise<Bidang2MutationResponse> {
    const response = await api.post<Bidang2MutationResponse>(
      `/v1/bidang-2/pengajuan/${id}/approve`,
      formData
    );
    return response.data;
  },

  /**
   * Menolak permohonan pengadaan dengan menyertakan alasan penolakan.
   */
  async rejectPengajuan(
    id: number | string,
    alasan: string
  ): Promise<Bidang2MutationResponse> {
    const response = await api.post<Bidang2MutationResponse>(
      `/v1/bidang-2/pengajuan/${id}/reject`,
      { alasan }
    );
    return response.data;
  },

  /**
   * Mendapatkan endpoint URL untuk download memo persetujuan Bidang 2.
   */
  downloadMemoUrl(id: number | string): string {
    return `/api/v1/bidang-2/pengajuan/${id}/memo`;
  },

  /**
   * Mendapatkan endpoint URL untuk download dokumen surat permohonan.
   */
  downloadDokumenUrl(id: number | string): string {
    return `/api/v1/bidang-2/permohonan/${id}/dokumen`;
  },

  /**
   * Mengambil blob berkas dokumen asli (PDF) yang diunggah oleh jurusan untuk kebutuhan live preview.
   */
  async getDokumenBlob(downloadUrl: string, signal?: AbortSignal): Promise<Blob> {
    const cleanedUrl = downloadUrl.startsWith('/api')
      ? downloadUrl.replace(/^\/api/, '')
      : downloadUrl;
    const endpoint = `${cleanedUrl}${cleanedUrl.includes('?') ? '&' : '?'}disposition=inline`;
    const response = await api.get<Blob>(endpoint, {
      responseType: 'blob',
      signal,
    });
    return response.data;
  },

  /**
   * Mengambil data dan dokumen RKAKL untuk Bidang 2.
   */
  async getRkakl(signal?: AbortSignal): Promise<unknown> {
    const response = await api.get('/v1/bidang-2/rkakl', { signal });
    return response.data;
  },
};

export default bidang2Service;

