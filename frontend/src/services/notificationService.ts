import { api } from './api';
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationSummaryResponse,
  NotificationUnreadCountResponse,
  SendNotificationPayload,
} from '../types/notification';

/**
 * Service to handle all centralized notification API interactions.
 * Fully decoupled from UI components and handles HTTP requests with AbortSignal support.
 */
export const notificationService = {
  /**
   * Fetch recent notifications summary (top recent items + unread counts).
   */
  async getSummary(limit: number = 5, signal?: AbortSignal): Promise<NotificationSummaryResponse> {
    const response = await api.get<NotificationSummaryResponse>('/v1/notifications/summary', {
      params: { limit },
      signal,
    });
    return response.data;
  },

  /**
   * Fetch total unread notifications count for badge indicators.
   */
  async getUnreadCount(signal?: AbortSignal): Promise<number> {
    const response = await api.get<NotificationUnreadCountResponse>('/v1/notifications/unread-count', {
      signal,
    });
    return response.data.unreadCount;
  },

  /**
   * Fetch paginated list of notifications with tab filtering.
   */
  async getNotifications(
    tab: string = 'semua',
    page: number = 1,
    perPage: number = 10,
    signal?: AbortSignal
  ): Promise<NotificationListResponse> {
    const response = await api.get<NotificationListResponse>('/v1/notifications', {
      params: {
        tab,
        page,
        per_page: perPage,
      },
      signal,
    });
    return response.data;
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id: number | string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/v1/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all unread notifications as read.
   */
  async markAllAsRead(): Promise<{ message: string; affected: number }> {
    const response = await api.post<{ message: string; affected: number }>('/v1/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a notification item.
   */
  async deleteNotification(id: number | string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/v1/notifications/${id}`);
    return response.data;
  },

  /**
   * Send a new notification (admin or programmatic notification trigger).
   */
  async sendNotification(
    payload: SendNotificationPayload
  ): Promise<{ message: string; notification: NotificationItem }> {
    const response = await api.post<{ message: string; notification: NotificationItem }>(
      '/v1/notifications',
      payload
    );
    return response.data;
  },
};

export default notificationService;
