import api from './api';
import type {
  PpkActionResponse,
  PpkDashboardResponse,
  PpkPengajuanDetailResponse,
  PpkPengajuanFilters,
  PpkPengajuanListResponse,
  PpkPermohonanDetailResponse,
  PpkPermohonanListResponse,
} from '../types/ppk';

export const getDashboard = async (signal?: AbortSignal): Promise<PpkDashboardResponse> => {
  const response = await api.get<PpkDashboardResponse>('/v1/ppk/dashboard', { signal });
  return response.data;
};

export const getPermohonanList = async (
  filters: PpkPengajuanFilters = {},
  signal?: AbortSignal
): Promise<PpkPermohonanListResponse> => {
  const response = await api.get<PpkPermohonanListResponse>('/v1/ppk/permohonan', {
    params: {
      q: filters.q || filters.search || undefined,
      status: filters.status || undefined,
      statuses: filters.statuses && filters.statuses.length > 0 ? filters.statuses : undefined,
      bulan: filters.bulan || undefined,
      tahun: filters.tahun || undefined,
      page: filters.page || undefined,
      per_page: filters.per_page || undefined,
    },
    signal,
  });
  return response.data;
};

export const getPermohonanDetail = async (
  id: number | string,
  signal?: AbortSignal
): Promise<PpkPermohonanDetailResponse> => {
  const response = await api.get<PpkPermohonanDetailResponse>(`/v1/ppk/permohonan/${id}`, { signal });
  return response.data;
};

export const approvePermohonan = async (
  id: number | string,
  memoFile: File,
  catatan?: string
): Promise<PpkActionResponse> => {
  const formData = new FormData();
  formData.append('memo', memoFile);
  if (catatan && catatan.trim() !== '') {
    formData.append('catatan', catatan.trim());
  }

  const response = await api.post<PpkActionResponse>(
    `/v1/ppk/permohonan/${id}/approve`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const rejectPermohonan = async (
  id: number | string,
  alasan: string
): Promise<PpkActionResponse> => {
  const response = await api.post<PpkActionResponse>(`/v1/ppk/permohonan/${id}/reject`, {
    alasan,
  });
  return response.data;
};

export const getPengajuanList = async (
  filters: PpkPengajuanFilters = {},
  signal?: AbortSignal
): Promise<PpkPengajuanListResponse> => {
  const response = await api.get<PpkPengajuanListResponse>('/v1/ppk/pengajuan', {
    params: {
      q: filters.q || filters.search || undefined,
      statuses: filters.statuses && filters.statuses.length > 0 ? filters.statuses : undefined,
      status: filters.status || undefined,
      bulan: filters.bulan || undefined,
      tahun: filters.tahun || undefined,
      unit_id: filters.unit_id || undefined,
      page: filters.page || undefined,
      per_page: filters.per_page || undefined,
    },
    signal,
  });
  return response.data;
};

export const getPengajuanReview = async (
  id: number | string,
  signal?: AbortSignal
): Promise<PpkPengajuanDetailResponse> => {
  const response = await api.get<PpkPengajuanDetailResponse>(`/v1/ppk/pengajuan/${id}/review`, { signal });
  return response.data;
};

export const getPengajuanShow = async (
  id: number | string,
  signal?: AbortSignal
): Promise<PpkPengajuanDetailResponse> => {
  const response = await api.get<PpkPengajuanDetailResponse>(`/v1/ppk/pengajuan/${id}`, { signal });
  return response.data;
};

export const approvePengadaan = async (id: number | string): Promise<PpkActionResponse> => {
  const response = await api.post<PpkActionResponse>(`/v1/ppk/pengajuan/${id}/approve`);
  return response.data;
};

export const rejectPengadaan = async (
  id: number | string,
  alasan: string
): Promise<PpkActionResponse> => {
  const response = await api.post<PpkActionResponse>(`/v1/ppk/pengajuan/${id}/reject`, {
    alasan,
  });
  return response.data;
};

export const getPembayaranReview = async (
  id: number | string,
  signal?: AbortSignal
): Promise<any> => {
  const response = await api.get<{ success: boolean; data: any }>(
    `/v1/ppk/pengajuan/${id}/pembayaran-review`,
    { signal }
  );
  return response.data.data;
};

export const getPembayaranDetail = async (
  id: number | string,
  signal?: AbortSignal
): Promise<PpkPengajuanDetailResponse> => {
  const response = await api.get<PpkPengajuanDetailResponse>(
    `/v1/ppk/pengajuan/${id}/pembayaran`,
    { signal }
  );
  return response.data;
};

export const approvePembayaran = async (
  id: number | string,
  memoFile: File,
  catatan?: string
): Promise<PpkActionResponse> => {
  const formData = new FormData();
  formData.append('memo', memoFile);
  if (catatan && catatan.trim() !== '') {
    formData.append('catatan', catatan.trim());
  }

  const response = await api.post<PpkActionResponse>(
    `/v1/ppk/pengajuan/${id}/pembayaran/approve`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const rejectPembayaran = async (
  id: number | string,
  alasan: string
): Promise<PpkActionResponse> => {
  const response = await api.post<PpkActionResponse>(
    `/v1/ppk/pengajuan/${id}/pembayaran/reject`,
    {
      alasan,
    }
  );
  return response.data;
};

export const fetchDokumenBlob = async (
  downloadUrl: string,
  disposition: 'inline' | 'attachment' = 'attachment',
  signal?: AbortSignal
): Promise<{ blob: Blob; contentType?: string }> => {
  const normalizedUrl = downloadUrl.replace(/^\/api(?=\/)/, '');
  const separator = normalizedUrl.includes('?') ? '&' : '?';

  const response = await api.get<Blob>(`${normalizedUrl}${separator}disposition=${disposition}`, {
    responseType: 'blob',
    signal,
  });
  const rawContentType = response.headers['content-type'];
  const contentType = typeof rawContentType === 'string' ? rawContentType : 'application/pdf';

  return {
    blob: new Blob([response.data], { type: contentType }),
    contentType,
  };
};

export const ppkService = {
  getDashboard,
  getPermohonanList,
  getPermohonanDetail,
  approvePermohonan,
  rejectPermohonan,
  getPengajuanList,
  getPengajuanReview,
  getPengajuanShow,
  approvePengadaan,
  rejectPengadaan,
  getPembayaranDetail,
  getPembayaranReview,
  approvePembayaran,
  rejectPembayaran,
  fetchDokumenBlob,
};

export default ppkService;
