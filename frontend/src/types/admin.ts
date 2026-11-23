export interface AdminStatItem {
  label: string;
  value: number;
  unit: string;
  variant?: 'primary' | 'info' | 'success' | 'warning' | 'danger';
}

export interface AdminRecentUser {
  id: number;
  nama: string;
  email: string;
  role: string;
  unit: string;
  status: 'aktif' | 'nonaktif';
  tanggal: string;
  [key: string]: unknown;
}

export interface AdminDashboardData {
  stats: AdminStatItem[];
  recentUsers: AdminRecentUser[];
}

export interface AdminUserItem {
  id: number;
  nama: string;
  email: string;
  role_id: number;
  role?: {
    id: number;
    nama: string;
  };
  unit_id: number;
  unit?: {
    id: number;
    nama: string;
  };
  status: 'aktif' | 'nonaktif';
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface AdminUnitItem {
  id: number;
  nama: string;
  kode?: string;
  users_count?: number;
  isActive?: boolean;
  status?: 'aktif' | 'nonaktif' | string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface AdminMakItem {
  id: number;
  kode: string;
  nama: string;
  ppk_id?: number | null;
  ppk?: {
    id: number;
    nama: string;
    email: string;
  } | null;
  isActive?: boolean;
  status?: string;
  [key: string]: unknown;
}

export interface AdminRoleItem {
  id: number;
  nama: string;
  deskripsi?: string;
  permissions_count?: number;
  isActive?: boolean;
  status?: 'aktif' | 'nonaktif' | string;
  [key: string]: unknown;
}

export interface AdminPermissionItem {
  id: number;
  kode: string;
  nama?: string;
}

export interface RolePermissionMatrixData {
  roles: Array<{ id: number; nama: string }>;
  groupedPermissions: Record<string, AdminPermissionItem[]>;
  assignments: Record<number, number[]>;
  selectedRoleId: number;
}

export interface AdminPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface AdminPenggunaResponse {
  users: PaginatedResponse<AdminUserItem>;
  roles: Array<{ id: number; nama: string }>;
  units: Array<{ id: number; nama: string }>;
  filters: { q: string };
}

export interface AdminUnitKerjaResponse {
  units: PaginatedResponse<AdminUnitItem>;
  filters: { q: string };
}

export interface AdminMakResponse {
  maks: PaginatedResponse<AdminMakItem>;
  ppkOptions: Array<{ id: number; nama: string; email: string }>;
  filters: { q: string };
}

export interface AdminRoleResponse {
  roles: PaginatedResponse<AdminRoleItem>;
  filters: { q: string };
}

export interface PenggunaFormData {
  nama?: string;
  email?: string;
  password?: string;
  role_id?: string | number;
  unit_id?: string | number;
  [key: string]: unknown;
}

export interface MakRowItem {
  id: number;
  nama: string;
  kode?: string;
  ppk?: {
    id?: number;
    nama?: string;
    email?: string;
  };
  permohonan_mak_count?: number;
  isActive?: boolean;
  status?: string;
  [key: string]: unknown;
}

export interface PpkOptionUser {
  id: number;
  nama: string;
  email: string;
  [key: string]: unknown;
}

export interface UnitKerjaItem {
  id?: number | string;
  nama: string;
  users_count?: number;
  isActive?: boolean;
  status?: 'aktif' | 'nonaktif' | string;
  [key: string]: unknown;
}

export interface UnitKerjaFormData {
  nama: string;
  [key: string]: unknown;
}

export interface UnitKerjaFormState {
  data: UnitKerjaFormData;
  setData: (key: any, value?: any) => void;
  errors: Record<string, string | undefined>;
  processing: boolean;
}

export interface RoleRowItem {
  id: number;
  nama: string;
  permissions_count?: number;
  users_count?: number;
  isActive?: boolean;
  status?: 'aktif' | 'nonaktif' | string;
  [key: string]: unknown;
}

export interface AdminMetodePengadaanItem {
  id: number;
  nama: string;
  isActive: boolean;
  pengadaan_count?: number;
  [key: string]: unknown;
}

export interface AdminMetodePengadaanResponse {
  metode_pengadaan: PaginatedResponse<AdminMetodePengadaanItem>;
  filters: { q: string };
}

export interface MetodePengadaanFormData {
  nama: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface MetodePengadaanFormState {
  data: MetodePengadaanFormData;
  setData: (key: any, value?: any) => void;
  errors: Record<string, string | undefined>;
  processing: boolean;
}
