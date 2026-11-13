/**
 * Notification Domain Type Definitions for SIPBAJA
 */

export interface NotificationItem {
  id: number;
  user_id?: number;
  judul: string;
  pesan: string;
  channel?: string;
  ref_type?: string | null;
  ref_id?: number | null;
  read_at?: string | null;
  created_at: string;
  waktu_relatif?: string;
  waktu?: string;
  [key: string]: unknown;
}

export type NotificationTab = 'semua' | 'pengingat' | 'status';

export interface NotificationPaginationData {
  data: NotificationItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface NotificationSummaryResponse {
  recentNotifications: NotificationItem[];
  unreadNotificationsCount: number;
  unreadCount: number;
}

export interface NotificationUnreadCountResponse {
  unreadCount: number;
}

export interface NotificationListResponse {
  notifications: NotificationPaginationData;
  unreadCount: number;
  unreadNotificationsCount?: number;
  activeTab: string;
}

export interface SendNotificationPayload {
  user_id: number;
  judul: string;
  pesan: string;
  channel?: string;
  ref_type?: string;
  ref_id?: number;
}
