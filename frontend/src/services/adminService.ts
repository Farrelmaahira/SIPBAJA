import api from './api';
import type {
  AdminDashboardData,
  AdminPenggunaResponse,
  AdminUserItem,
  AdminUnitKerjaResponse,
  AdminUnitItem,
  AdminMakResponse,
  AdminMakItem,
  AdminRoleResponse,
  AdminRoleItem,
  RolePermissionMatrixData,
  AdminMetodePengadaanResponse,
  AdminMetodePengadaanItem,
} from '../types/admin';
import type { ApiMessageResponse } from '../types/api';

export const adminService = {
  // Dashboard
  async getDashboard(signal?: AbortSignal): Promise<AdminDashboardData> {
    const response = await api.get<AdminDashboardData>('/v1/admin/dashboard', { signal });
    return response.data;
  },

  // Pengguna
  async getUsers(
    params?: { q?: string; page?: number; statuses?: string[] },
    signal?: AbortSignal
  ): Promise<AdminPenggunaResponse> {
    const response = await api.get<AdminPenggunaResponse>('/v1/admin/pengguna', { params, signal });
    return response.data;
  },

  async createUser(payload: Record<string, unknown>): Promise<{ message: string; user: AdminUserItem }> {
    const response = await api.post<{ message: string; user: AdminUserItem }>('/v1/admin/pengguna', payload);
    return response.data;
  },

  async updateUser(id: number | string, payload: Record<string, unknown>): Promise<{ message: string; user: AdminUserItem }> {
    const response = await api.put<{ message: string; user: AdminUserItem }>(`/v1/admin/pengguna/${id}`, payload);
    return response.data;
  },

  async deleteUser(id: number | string): Promise<void> {
    await api.delete(`/v1/admin/pengguna/${id}`);
  },

  async toggleStatusUser(id: number | string): Promise<{ message: string; user?: AdminUserItem }> {
    const response = await api.post<{ message: string; user?: AdminUserItem }>(`/v1/admin/pengguna/${id}/toggle-status`);
    return response.data;
  },

  async deactivateUser(id: number | string): Promise<{ message: string; user?: AdminUserItem }> {
    const response = await api.post<{ message: string; user?: AdminUserItem }>(`/v1/admin/pengguna/${id}/deactivate`);
    return response.data;
  },

  async activateUser(id: number | string): Promise<{ message: string; user?: AdminUserItem }> {
    const response = await api.post<{ message: string; user?: AdminUserItem }>(`/v1/admin/pengguna/${id}/activate`);
    return response.data;
  },

  // Unit Kerja
  async getUnits(
    params?: { q?: string; page?: number; statuses?: string[] },
    signal?: AbortSignal
  ): Promise<AdminUnitKerjaResponse> {
    const response = await api.get<AdminUnitKerjaResponse>('/v1/admin/unit-kerja', { params, signal });
    return response.data;
  },

  async createUnit(payload: Record<string, unknown>): Promise<{ message: string; unit: AdminUnitItem }> {
    const response = await api.post<{ message: string; unit: AdminUnitItem }>('/v1/admin/unit-kerja', payload);
    return response.data;
  },

  async updateUnit(id: number | string, payload: Record<string, unknown>): Promise<{ message: string; unit: AdminUnitItem }> {
    const response = await api.put<{ message: string; unit: AdminUnitItem }>(`/v1/admin/unit-kerja/${id}`, payload);
    return response.data;
  },

  async deleteUnit(id: number | string): Promise<void> {
    await api.delete(`/v1/admin/unit-kerja/${id}`);
  },

  async toggleStatusUnit(id: number | string): Promise<{ message: string; unit?: AdminUnitItem }> {
    const response = await api.post<{ message: string; unit?: AdminUnitItem }>(`/v1/admin/unit-kerja/${id}/toggle-status`);
    return response.data;
  },

  async deactivateUnit(id: number | string): Promise<{ message: string; unit?: AdminUnitItem }> {
    const response = await api.post<{ message: string; unit?: AdminUnitItem }>(`/v1/admin/unit-kerja/${id}/deactivate`);
    return response.data;
  },

  async activateUnit(id: number | string): Promise<{ message: string; unit?: AdminUnitItem }> {
    const response = await api.post<{ message: string; unit?: AdminUnitItem }>(`/v1/admin/unit-kerja/${id}/activate`);
    return response.data;
  },

  // MAK
  async getMaks(
    params?: { q?: string; page?: number; statuses?: string[] },
    signal?: AbortSignal
  ): Promise<AdminMakResponse> {
    const response = await api.get<AdminMakResponse>('/v1/admin/mak', { params, signal });
    return response.data;
  },

  async createMak(payload: Record<string, unknown>): Promise<{ message: string; mak: AdminMakItem }> {
    const response = await api.post<{ message: string; mak: AdminMakItem }>('/v1/admin/mak', payload);
    return response.data;
  },

  async updateMak(id: number | string, payload: Record<string, unknown>): Promise<{ message: string; mak: AdminMakItem }> {
    const response = await api.put<{ message: string; mak: AdminMakItem }>(`/v1/admin/mak/${id}`, payload);
    return response.data;
  },

  async deleteMak(id: number | string): Promise<void> {
    await api.delete(`/v1/admin/mak/${id}`);
  },

  async toggleStatusMak(id: number | string): Promise<{ message: string; mak?: AdminMakItem }> {
    const response = await api.post<{ message: string; mak?: AdminMakItem }>(`/v1/admin/mak/${id}/toggle-status`);
    return response.data;
  },

  async deactivateMak(id: number | string): Promise<{ message: string; mak?: AdminMakItem }> {
    const response = await api.post<{ message: string; mak?: AdminMakItem }>(`/v1/admin/mak/${id}/deactivate`);
    return response.data;
  },

  async activateMak(id: number | string): Promise<{ message: string; mak?: AdminMakItem }> {
    const response = await api.post<{ message: string; mak?: AdminMakItem }>(`/v1/admin/mak/${id}/activate`);
    return response.data;
  },

  // Roles
  async getRoles(
    params?: { q?: string; page?: number; statuses?: string[] },
    signal?: AbortSignal
  ): Promise<AdminRoleResponse> {
    const response = await api.get<AdminRoleResponse>('/v1/admin/role', { params, signal });
    return response.data;
  },

  async createRole(payload: Record<string, unknown>): Promise<{ message: string; role: AdminRoleItem }> {
    const response = await api.post<{ message: string; role: AdminRoleItem }>('/v1/admin/role', payload);
    return response.data;
  },

  async updateRole(id: number | string, payload: Record<string, unknown>): Promise<{ message: string; role: AdminRoleItem }> {
    const response = await api.put<{ message: string; role: AdminRoleItem }>(`/v1/admin/role/${id}`, payload);
    return response.data;
  },

  async deleteRole(id: number | string): Promise<void> {
    await api.delete(`/v1/admin/role/${id}`);
  },

  async toggleStatusRole(id: number | string): Promise<{ message: string; role?: AdminRoleItem }> {
    const response = await api.post<{ message: string; role?: AdminRoleItem }>(`/v1/admin/role/${id}/toggle-status`);
    return response.data;
  },

  async deactivateRole(id: number | string): Promise<{ message: string; role?: AdminRoleItem }> {
    const response = await api.post<{ message: string; role?: AdminRoleItem }>(`/v1/admin/role/${id}/deactivate`);
    return response.data;
  },

  async activateRole(id: number | string): Promise<{ message: string; role?: AdminRoleItem }> {
    const response = await api.post<{ message: string; role?: AdminRoleItem }>(`/v1/admin/role/${id}/activate`);
    return response.data;
  },

  // Role Permissions
  async getRolePermissions(roleId?: number, signal?: AbortSignal): Promise<RolePermissionMatrixData> {
    const response = await api.get<RolePermissionMatrixData>('/v1/admin/role-permission', {
      params: roleId ? { role_id: roleId } : undefined,
      signal,
    });
    return response.data;
  },

  async updateRolePermissions(roleId: number | string, permissionIds: number[]): Promise<ApiMessageResponse> {
    const response = await api.put<ApiMessageResponse>(`/v1/admin/role-permission/${roleId}`, {
      permission_ids: permissionIds,
    });
    return response.data;
  },

  // Metode Pengadaan
  async getMetodePengadaan(
    params?: { q?: string; page?: number; statuses?: string[] },
    signal?: AbortSignal
  ): Promise<AdminMetodePengadaanResponse> {
    const response = await api.get<AdminMetodePengadaanResponse>('/v1/admin/metode-pengadaan', {
      params,
      signal,
    });
    return response.data;
  },

  async createMetodePengadaan(
    payload: Record<string, unknown>
  ): Promise<{ message: string; metode_pengadaan: AdminMetodePengadaanItem }> {
    const response = await api.post<{ message: string; metode_pengadaan: AdminMetodePengadaanItem }>(
      '/v1/admin/metode-pengadaan',
      payload
    );
    return response.data;
  },

  async updateMetodePengadaan(
    id: number | string,
    payload: Record<string, unknown>
  ): Promise<{ message: string; metode_pengadaan: AdminMetodePengadaanItem }> {
    const response = await api.put<{ message: string; metode_pengadaan: AdminMetodePengadaanItem }>(
      `/v1/admin/metode-pengadaan/${id}`,
      payload
    );
    return response.data;
  },

  async toggleStatusMetodePengadaan(
    id: number | string
  ): Promise<{ message: string; metode_pengadaan: AdminMetodePengadaanItem }> {
    const response = await api.post<{ message: string; metode_pengadaan: AdminMetodePengadaanItem }>(
      `/v1/admin/metode-pengadaan/${id}/toggle-status`
    );
    return response.data;
  },

  async deactivateMetodePengadaan(
    id: number | string
  ): Promise<{ message: string; metode_pengadaan: AdminMetodePengadaanItem }> {
    const response = await api.post<{ message: string; metode_pengadaan: AdminMetodePengadaanItem }>(
      `/v1/admin/metode-pengadaan/${id}/deactivate`
    );
    return response.data;
  },

  async activateMetodePengadaan(
    id: number | string
  ): Promise<{ message: string; metode_pengadaan: AdminMetodePengadaanItem }> {
    const response = await api.post<{ message: string; metode_pengadaan: AdminMetodePengadaanItem }>(
      `/v1/admin/metode-pengadaan/${id}/activate`
    );
    return response.data;
  },
};

