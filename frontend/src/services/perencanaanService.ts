import api from './api';
import type { ApiMessageResponse } from '../types/api';
import type {
  PerencanaanPengajuanDetailResponse,
  PerencanaanPengajuanListResponse,
  JenisMakResponse,
  RkaklResponse,
  PerencanaanProfilResponse,
} from '../types/perencanaan';

export const perencanaanService = {
  /**
   * Mengambil daftar permohonan masuk yang perlu diverifikasi Perencanaan.
   */
  async getPengajuanList(
    params?: { q?: string; statuses?: string[]; page?: number },
    signal?: AbortSignal
  ): Promise<PerencanaanPengajuanListResponse> {
    const response = await api.get<PerencanaanPengajuanListResponse>(
      '/v1/perencanaan/pengajuan',
      {
        params,
        signal,
      }
    );
    return response.data;
  },

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
   * Mengambil daftar Jenis MAK (Mata Anggaran Kegiatan) beserta opsi PPK.
   */
  async getJenisMakList(
    q?: string,
    signal?: AbortSignal
  ): Promise<JenisMakResponse> {
    const response = await api.get<JenisMakResponse>('/v1/perencanaan/jenis-mak', {
      params: { q },
      signal,
    });
    return response.data;
  },

  /**
   * Menambahkan Jenis MAK baru.
   */
  async storeJenisMak(data: {
    kode: string;
    nama: string;
    ppk_user_id: number;
  }): Promise<ApiMessageResponse & { mak?: unknown }> {
    const response = await api.post<ApiMessageResponse & { mak?: unknown }>(
      '/v1/perencanaan/jenis-mak',
      data
    );
    return response.data;
  },

  /**
   * Memperbarui Jenis MAK.
   */
  async updateJenisMak(
    id: number | string,
    data: { kode: string; nama: string; ppk_user_id: number }
  ): Promise<ApiMessageResponse & { mak?: unknown }> {
    const response = await api.put<ApiMessageResponse & { mak?: unknown }>(
      `/v1/perencanaan/jenis-mak/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Menghapus Jenis MAK.
   */
  async deleteJenisMak(id: number | string): Promise<void> {
    await api.delete(`/v1/perencanaan/jenis-mak/${id}`);
  },

  /**
   * Mengambil data dokumen RKAKL aktif dan riwayat versinya.
   */
  async getRkaklData(signal?: AbortSignal): Promise<RkaklResponse> {
    const response = await api.get<RkaklResponse>('/v1/perencanaan/rkakl', {
      signal,
    });
    return response.data;
  },

  /**
   * Memperbarui / mengganti dokumen RKAKL dengan berkas versi baru.
   */
  async replaceRkakl(filename: string): Promise<ApiMessageResponse> {
    const response = await api.post<ApiMessageResponse>('/v1/perencanaan/rkakl', {
      filename,
    });
    return response.data;
  },

  /**
   * Mengambil informasi profil pengguna yang sedang login.
   */
  async getProfilData(signal?: AbortSignal): Promise<PerencanaanProfilResponse> {
    const response = await api.get<PerencanaanProfilResponse>(
      '/v1/perencanaan/profil',
      { signal }
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

export default perencanaanService;
