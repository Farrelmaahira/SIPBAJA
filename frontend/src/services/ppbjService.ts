import api from './api';
import type { ApiMessageResponse, PaginatedResponse } from '../types/api';
import type {
  PpbjDashboardData,
  PpbjPermohonanItem,
  PpbjPermohonanDetail,
  PpbjPengadaanItem,
  PpbjPengadaanDetail,
  PpbjSimpanKontrakPayload,
  PpbjUpdateKlasifikasiPayload,
  PpbjPembayaranContext,
} from '../types/ppbj';

/**
 * Bentuk respons GET /v1/ppbj/pengadaan — paginator di bawah kunci `pengadaan`.
 */
export interface PengadaanListResponse {
  message?: string;
  pengadaan: PaginatedResponse<PpbjPengadaanItem>;
}

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

  async fetchPengadaaan(
    params: {
      page?: number;
      per_page?: number;
      q?: string;
      status?: string;
      bulan?: string;
      tahun?: string;
    } = {},
    signal?: AbortSignal
  ): Promise<PengadaanListResponse> {
    const res = await api.get<PengadaanListResponse>('/v1/ppbj/pengadaan', {
      params,
      signal,
    });
    return res.data;
  },

  /**
   * Mengambil detail terpadu pengadaan untuk PPBJ.
   */
  async getPengadaanDetail(
    id: number | string,
    signal?: AbortSignal
  ): Promise<PpbjPengadaanDetail> {
    const response = await api.get<{
      message?: string;
      pengadaan: PpbjPengadaanDetail;
    }>(`/v1/ppbj/pengadaan/${id}`, { signal });
    return response.data.pengadaan;
  },

  /**
   * Memperbarui klasifikasi pengadaan (status draft / revisi).
   */
  async updateKlasifikasiPengadaan(
    id: number | string,
    payload: PpbjUpdateKlasifikasiPayload
  ): Promise<ApiMessageResponse> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('permohonan_mak_id', String(payload.permohonan_mak_id));
    formData.append('jenis_id', String(payload.jenis_id));
    formData.append('metode_id', String(payload.metode_id));
    formData.append('level_id', String(payload.level_id));
    if (payload.dokumen) {
      formData.append('dokumen', payload.dokumen);
    }

    const response = await api.post<ApiMessageResponse>(
      `/v1/ppbj/pengadaan/${id}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Menyimpan atau memperbarui data kontrak, vendor, nominal, reminder, & instrumen pembelian.
   */
  async saveKontrakPengadaan(
    id: number | string,
    payload: PpbjSimpanKontrakPayload,
    isUpdate = false
  ): Promise<ApiMessageResponse> {
    const formData = new FormData();
    if (isUpdate) {
      formData.append('_method', 'PUT');
    }
    if (payload.tipe) {
      formData.append('tipe', payload.tipe);
    }
    if (payload.nomor) {
      formData.append('nomor', payload.nomor);
    }
    if (payload.tanggal) {
      formData.append('tanggal', payload.tanggal);
    }
    formData.append('vendor_nama', payload.vendor_nama);
    formData.append('nominal_kontrak', String(payload.nominal_kontrak));
    if (payload.tanggal_jatuh_tempo) {
      formData.append('tanggal_jatuh_tempo', payload.tanggal_jatuh_tempo);
    }
    if (payload.tanggal_reminder) {
      formData.append('tanggal_reminder', payload.tanggal_reminder);
    }
    if (payload.dokumen) {
      formData.append('dokumen', payload.dokumen);
    }
    if (payload.dokumen_surat_kontrak) {
      formData.append('dokumen_surat_kontrak', payload.dokumen_surat_kontrak);
    }
    if (payload.dokumen_spk) {
      formData.append('dokumen_spk', payload.dokumen_spk);
    }
    if (payload.dokumen_surat_pemesanan) {
      formData.append('dokumen_surat_pemesanan', payload.dokumen_surat_pemesanan);
    }
    if (payload.dokumen_kwitansi) {
      formData.append('dokumen_kwitansi', payload.dokumen_kwitansi);
    }
    if (payload.dokumen_invoice) {
      formData.append('dokumen_invoice', payload.dokumen_invoice);
    }

    const url = `/v1/ppbj/pengadaan/${id}/kontrak`;
    const response = await api.post<ApiMessageResponse>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Mengambil data kontekstual pembayaran, BAST perlengkapan, dan status legalitas vendor (FR-40).
   */
  async getPembayaranContext(
    id: number | string,
    signal?: AbortSignal
  ): Promise<PpbjPembayaranContext> {
    const response = await api.get<{ success: boolean; data: PpbjPembayaranContext }>(
      `/v1/ppbj/pengadaan/${id}/pembayaran-context`,
      { signal }
    );
    return response.data.data;
  },

  /**
   * Mengunggah atau memperbarui draf dokumen tagihan/pembayaran (FR-41, FR-42).
   */
  async uploadDokumenTagihan(
    id: number | string,
    file: File,
    nominal?: number,
    catatan?: string
  ): Promise<{ success: boolean; message: string; data: any }> {
    const formData = new FormData();
    formData.append('dokumen_tagihan', file);
    if (nominal !== undefined && nominal !== null) {
      formData.append('nominal', String(nominal));
    }
    if (catatan) {
      formData.append('catatan', catatan);
    }

    const response = await api.post<{ success: boolean; message: string; data: any }>(
      `/v1/ppbj/pengadaan/${id}/dokumen-tagihan`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Mengunggah atau memperbarui dokumen legalitas vendor (FR-43, FR-44, FR-45).
   */
  async uploadLegalitasVendor(
    id: number | string,
    file: File
  ): Promise<{ success: boolean; message: string; data: any }> {
    const formData = new FormData();
    formData.append('dokumen_legalitas', file);

    const response = await api.post<{ success: boolean; message: string; data: any }>(
      `/v1/ppbj/pengadaan/${id}/legalitas-vendor`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
};

export default ppbjService;

