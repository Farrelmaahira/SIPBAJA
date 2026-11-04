import api from './api';
import type { ApiMessageResponse } from '../types/api';
import type { PerencanaanPengajuanDetailResponse } from '../types/perencanaan';

export const perencanaanService = {
  /**
   * Mengambil detail pengajuan permohonan untuk peran Perencanaan.
   */
  async getPengajuanDetail(
    id: string | number,
    signal?: AbortSignal
  ): Promise<PerencanaanPengajuanDetailResponse> {
    const response = await api.get<PerencanaanPengajuanDetailResponse>(
      `/v1/perencanaan/pengajuan/${id}`,
      { signal }
    );
    return response.data;
  },

  /**
   * Menyetujui permohonan dan menetapkan jenis MAK.
   */
  async approvePengajuan(
    id: string | number,
    makIds: number[]
  ): Promise<ApiMessageResponse> {
    const response = await api.post<ApiMessageResponse>(
      `/v1/perencanaan/pengajuan/${id}/approve`,
      { mak_ids: makIds }
    );
    return response.data;
  },

  /**
   * Menolak permohonan dengan catatan/alasan penolakan.
   */
  async rejectPengajuan(
    id: string | number,
    alasan: string
  ): Promise<ApiMessageResponse> {
    const response = await api.post<ApiMessageResponse>(
      `/v1/perencanaan/pengajuan/${id}/reject`,
      { alasan }
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
    const finalUrl = disposition === 'inline' ? `${normalizedUrl}${separator}disposition=inline` : normalizedUrl;

    const response = await api.get<Blob>(finalUrl, { responseType: 'blob' });
    const rawContentType = response.headers['content-type'];
    const contentType = typeof rawContentType === 'string' ? rawContentType : 'application/pdf';
    return {
      blob: new Blob([response.data], { type: contentType }),
      contentType,
    };
  },
};

export default perencanaanService;

