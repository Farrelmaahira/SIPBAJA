import api from './api';
import type { ApiMessageResponse } from '../types/api';
import type {
  PpbjDashboardData,
  PpbjPermohonanItem,
  PpbjPermohonanDetail,
} from '../types/ppbj';

export const ppbjService = {
  /**
   * Mengambil data dashboard PPBJ (statistik, permohonan masuk, pengadaan berjalan, termin).
   */
  async getDashboard(signal?: AbortSignal): Promise<PpbjDashboardData> {
    const response = await api.get<PpbjDashboardData>('/v1/ppbj/dashboard', { signal });
    return response.data;
  },

  /**
   * Mengambil daftar permohonan yang siap dipaketkan oleh PPBJ.
   */
  async getPermohonanList(signal?: AbortSignal): Promise<PpbjPermohonanItem[]> {
    const response = await api.get<{
      permohonanList?: PpbjPermohonanItem[];
      data?: PpbjPermohonanItem[];
    }>('/v1/ppbj/permohonan', { signal });

    const data = response.data;
    if (Array.isArray(data.permohonanList)) {
      return data.permohonanList;
    }
    if (Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },

  /**
   * Mengambil detail permohonan beserta konteks pemecahan paket pengadaan.
   */
  async getPermohonanDetail(
    id: number | string,
    signal?: AbortSignal
  ): Promise<PpbjPermohonanDetail> {
    const response = await api.get<{
      permohonan: PpbjPermohonanDetail;
    }>(`/v1/ppbj/permohonan/${id}`, { signal });

    return response.data.permohonan;
  },

  /**
   * Menyimpan paket pengadaan draft untuk permohonan.
   */
  async storeDraftPengadaan(
    id: number | string,
    payload: FormData | object
  ): Promise<ApiMessageResponse> {
    const response = await api.post<ApiMessageResponse>(
      `/v1/ppbj/permohonan/${id}/pengadaan/draft`,
      payload
    );
    return response.data;
  },

  /**
   * Menghapus paket pengadaan berstatus draft.
   */
  async destroyDraftPengadaan(paketId: number | string): Promise<void> {
    await api.delete(`/v1/ppbj/pengadaan/${paketId}`);
  },

  /**
   * Mengirim seluruh paket pengadaan ke reviewer dan mengunci permohonan.
   */
  async submitReviewer(id: number | string): Promise<ApiMessageResponse> {
    const response = await api.post<ApiMessageResponse>(
      `/v1/ppbj/permohonan/${id}/pengadaan/submit`
    );
    return response.data;
  },

  /**
   * Mengambil blob file dokumen PDF terotentikasi.
   */
  async fetchDokumenBlob(
    downloadUrl: string,
    disposition: 'inline' | 'attachment' = 'attachment'
  ): Promise<{ blob: Blob; contentType?: string }> {
    const normalizedUrl = downloadUrl.replace(/^\/api(?=\/)/, '');
    const separator = normalizedUrl.includes('?') ? '&' : '?';
    const finalUrl =
      disposition === 'inline'
        ? `${normalizedUrl}${separator}disposition=inline`
        : normalizedUrl;

    const response = await api.get<Blob>(finalUrl, { responseType: 'blob' });
    const rawContentType = response.headers['content-type'];
    const contentType =
      typeof rawContentType === 'string' ? rawContentType : 'application/pdf';
    return {
      blob: new Blob([response.data], { type: contentType }),
      contentType,
    };
  },
};

export default ppbjService;

