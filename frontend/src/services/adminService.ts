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
} from '../types/admin';
import type { ApiMessageResponse } from '../types/api';

export const adminService = {
  // Dashboard
  async getDashboard(signal?: AbortSignal): Promise<AdminDashboardData> {
    const response = await api.get<AdminDashboardData>('/v1/admin/dashboard', { signal });
    return response.data;
  },

  // Pengguna
  async getUsers(params?: { q?: string; page?: number }, signal?: AbortSignal): Promise<AdminPenggunaResponse> {
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

  // Unit Kerja
  async getUnits(params?: { q?: string; page?: number }, signal?: AbortSignal): Promise<AdminUnitKerjaResponse> {
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

  // MAK
  async getMaks(params?: { q?: string; page?: number }, signal?: AbortSignal): Promise<AdminMakResponse> {
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

  // Roles
  async getRoles(params?: { q?: string; page?: number }, signal?: AbortSignal): Promise<AdminRoleResponse> {
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
};

