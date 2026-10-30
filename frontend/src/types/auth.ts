export interface Role {
  id: number;
  nama: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Unit {
  id: number;
  nama: string;
  kode?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  nama: string;
  username?: string;
  email: string;
  role_id?: number;
  unit_id?: number;
  role?: Role;
  Role?: Role;
  unit?: Unit;
  Unit?: Unit;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface LoginCredentials {
  login: string;
  password: string;
  remember?: boolean;
}

export interface AuthResponse {
  user: User;
  role: string;
}

export interface AuthContextValue {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  login: (login: string, password: string, remember?: boolean) => Promise<{ user: User; role: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}
