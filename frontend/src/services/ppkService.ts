import api from './api';
import type {
  PpkActionResponse,
  PpkDashboardResponse,
  PpkPengajuanDetailResponse,
  PpkPengajuanFilters,
  PpkPengajuanListResponse,
  PpkPermohonanDetailResponse,
  PpkPermohonanListResponse,
  PpkRkaklResponse,
} from '../types/ppk';

export const getDashboard = async (): Promise<PpkDashboardResponse> => {
  const response = await api.get<PpkDashboardResponse>('/v1/ppk/dashboard');
  return response.data;
};

export const getPermohonanList = async (
  filters: PpkPengajuanFilters = {}
): Promise<PpkPermohonanListResponse> => {
  const response = await api.get<PpkPermohonanListResponse>('/v1/ppk/permohonan', {
    params: {
      q: filters.q || filters.search || undefined,
      search: filters.search || filters.q || undefined,
      status: filters.status || undefined,
      statuses: filters.statuses && filters.statuses.length > 0 ? filters.statuses : undefined,
      bulan: filters.bulan || undefined,
      tahun: filters.tahun || undefined,
      unit_id: filters.unit_id || undefined,
      page: filters.page || undefined,
      per_page: filters.per_page || undefined,
    },
  });
  return response.data;
};

export const getPermohonanDetail = async (
  id: number | string
): Promise<PpkPermohonanDetailResponse> => {
  const response = await api.get<PpkPermohonanDetailResponse>(`/v1/ppk/permohonan/${id}`);
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
  filters: PpkPengajuanFilters = {}
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
  });
  return response.data;
};

export const getPengajuanReview = async (
  id: number | string
): Promise<PpkPengajuanDetailResponse> => {
  const response = await api.get<PpkPengajuanDetailResponse>(`/v1/ppk/pengajuan/${id}/review`);
  return response.data;
};

export const getPengajuanShow = async (
  id: number | string
): Promise<PpkPengajuanDetailResponse> => {
  const response = await api.get<PpkPengajuanDetailResponse>(`/v1/ppk/pengajuan/${id}`);
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

export const getPembayaranDetail = async (
  id: number | string
): Promise<PpkPengajuanDetailResponse> => {
  const response = await api.get<PpkPengajuanDetailResponse>(
    `/v1/ppk/pengajuan/${id}/pembayaran`
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

export const getRkakl = async (tahun?: string): Promise<PpkRkaklResponse> => {
  const response = await api.get<PpkRkaklResponse>('/v1/ppk/rkakl', {
    params: {
      tahun: tahun || undefined,
    },
  });
  return response.data;
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
  approvePembayaran,
  rejectPembayaran,
  getRkakl,
};

export default ppkService;
