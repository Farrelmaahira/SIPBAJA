import api from './api';
import type { ApiMessageResponse } from '../types/api';
import type {
  PerencanaanPengajuanDetailResponse,
  PerencanaanPengajuanListResponse,
  PerencanaanPengadaanDetailResponse,
  JenisMakResponse,
  RkaklResponse,
  PerencanaanProfilResponse,
  PerencanaanDashboardResponse,
  PerencanaanMakItem,
} from '../types/perencanaan';

export interface PerencanaanPengajuanFilterParams {
  q?: string;
  search?: string;
  status?: string;
  statuses?: string[];
  bulan?: string | number;
  tahun?: string | number;
  unit_id?: string | number;
  page?: number;
}

export const perencanaanService = {
  /**
   * Mengambil daftar permohonan masuk yang perlu diverifikasi Perencanaan.
   */
  async getPengajuanList(
    params?: PerencanaanPengajuanFilterParams,
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
   * Menyetujui permohonan dan menetapkan satu atau lebih Jenis MAK.
   */
  async approvePengajuan(
    id: string | number,
    makIds: number[],
    catatan?: string
  ): Promise<ApiMessageResponse> {
    const response = await api.post<ApiMessageResponse>(
      `/v1/perencanaan/pengajuan/${id}/approve`,
      { mak_ids: makIds, catatan }
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
      { alasan, catatan: alasan }
    );
    return response.data;
  },

  /**
   * Mengambil detail Dokumen Pengadaan untuk Perencanaan (lihat saja + konteks perbaikan MAK).
   */
  async getPengadaanDetail(
    pengadaanId: string | number,
    signal?: AbortSignal
  ): Promise<PerencanaanPengadaanDetailResponse> {
    const response = await api.get<PerencanaanPengadaanDetailResponse>(
      `/v1/perencanaan/pengadaan/${pengadaanId}`,
      { signal }
    );
    return response.data;
  },

  /**
   * Memperbaiki Jenis MAK pada Dokumen Pengadaan (hanya sebelum PPK menyetujui).
   */
  async updateJenisMakPengadaan(
    pengadaanId: string | number,
    payload: { mak_id?: number; permohonan_mak_id?: number } | number
  ): Promise<ApiMessageResponse> {
    const body =
      typeof payload === 'number'
        ? { mak_id: payload, permohonan_mak_id: payload }
        : {
            mak_id: payload.mak_id ?? payload.permohonan_mak_id,
            permohonan_mak_id: payload.permohonan_mak_id ?? payload.mak_id,
          };

    const response = await api.put<ApiMessageResponse>(
      `/v1/perencanaan/pengadaan/${pengadaanId}/jenis-mak`,
      body
    );
    return response.data;
  },

  /**
   * Mengambil daftar Jenis MAK (Mata Anggaran Kegiatan) beserta opsi PPK.
   */
  async getJenisMakList(
    q?: string,
    signal?: AbortSignal,
    page?: number
  ): Promise<JenisMakResponse> {
    const response = await api.get<JenisMakResponse>('/v1/perencanaan/jenis-mak', {
      params: { q, page },
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
  }): Promise<ApiMessageResponse & { mak?: PerencanaanMakItem }> {
    const response = await api.post<ApiMessageResponse & { mak?: PerencanaanMakItem }>(
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
  ): Promise<ApiMessageResponse & { mak?: PerencanaanMakItem }> {
    const response = await api.put<ApiMessageResponse & { mak?: PerencanaanMakItem }>(
      `/v1/perencanaan/jenis-mak/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Menghapus Jenis MAK (soft delete).
   */
  async deleteJenisMak(id: number | string): Promise<ApiMessageResponse> {
    const response = await api.delete<ApiMessageResponse>(
      `/v1/perencanaan/jenis-mak/${id}`
    );
    return response.data;
  },

  /**
   * Mengambil data dokumen RKAKL aktif dan riwayat versinya per tahun anggaran.
   */
  async getRkaklData(
    signal?: AbortSignal,
    tahun?: string | number
  ): Promise<RkaklResponse> {
    const response = await api.get<RkaklResponse>('/v1/perencanaan/rkakl', {
      params: tahun ? { tahun } : undefined,
      signal,
    });
    return response.data;
  },

  /**
   * Mengunggah dokumen RKAKL baru dengan tahun anggaran dan berkas.
   */
  async replaceRkakl(
    file: File | string,
    tahunAnggaran: string | number = 2026
  ): Promise<ApiMessageResponse> {
    if (file instanceof File) {
      const formData = new FormData();
      formData.append('tahun_anggaran', String(tahunAnggaran));
      formData.append('berkas', file);
      formData.append('file', file);
      formData.append('filename', file.name);
      const response = await api.post<ApiMessageResponse>(
        '/v1/perencanaan/rkakl',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    }

    const response = await api.post<ApiMessageResponse>('/v1/perencanaan/rkakl', {
      tahun_anggaran: Number(tahunAnggaran),
      filename: file,
    });
    return response.data;
  },

  /**
   * Mengganti dokumen RKAKL yang sudah ada berdasarkan ID dokumen.
   */
  async gantiRkaklById(
    dokumenId: number | string,
    berkas: File
  ): Promise<ApiMessageResponse> {
    const formData = new FormData();
    formData.append('berkas', berkas);
    formData.append('file', berkas);

    const response = await api.post<ApiMessageResponse>(
      `/v1/perencanaan/rkakl/${dokumenId}/ganti`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Menghapus dokumen RKAKL berdasarkan ID dokumen.
   */
  async deleteRkakl(dokumenId: number | string): Promise<ApiMessageResponse> {
    const response = await api.delete<ApiMessageResponse>(
      `/v1/perencanaan/rkakl/${dokumenId}`
    );
    return response.data;
  },

  /**
   * Mengambil data statistik dan permohonan terbaru untuk dashboard Perencanaan.
   */
  async getDashboardData(signal?: AbortSignal): Promise<PerencanaanDashboardResponse> {
    const response = await api.get<PerencanaanDashboardResponse>(
      '/v1/perencanaan/dashboard',
      { signal }
    );
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
