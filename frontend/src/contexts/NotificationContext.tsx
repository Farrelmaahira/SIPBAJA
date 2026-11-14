import React, {
  createContext,
  useState,
  // useEffect,
  useCallback,
  useMemo,
  // useRef,
} from 'react';
import type { NotificationItem } from '../types/notification';
import { notificationService } from '../services/notificationService';

export interface NotificationContextValue {
  recentNotifications: NotificationItem[];
  notifications: NotificationItem[];
  unreadCount: number;
  totalCount: number;
  currentPage: number;
  lastPage: number;
  activeTab: string;
  isLoading: boolean;
  error: string | null;
  setActiveTab: (tab: string) => void;
  refetchSummary: () => Promise<void>;
  fetchList: (tab?: string, page?: number, perPage?: number) => Promise<void>;
  markAsRead: (id: number | string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number | string) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export interface NotificationProviderProps {
  children: React.ReactNode;
  pollingIntervalMs?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  pollingIntervalMs: _pollingIntervalMs = 60000,
}) => {
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [activeTab, setActiveTabState] = useState<string>('semua');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // const _abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Refetch summary: top 5 recent notifications + unread count.
   */
  const refetchSummary = useCallback(async (signal?: AbortSignal): Promise<void> => {
    try {
      const summary = await notificationService.getSummary(5, signal);
      setRecentNotifications(summary.recentNotifications || []);
      const unread = summary.unreadNotificationsCount ?? summary.unreadCount ?? 0;
      setUnreadCount(unread);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'CanceledError') {
        return;
      }
      // Silently capture background fetch errors without disrupting user workflow
    }
  }, []);

  /**
   * Fetch paginated list of notifications for dedicated notification pages.
   */
  const fetchList = useCallback(
    async (tab: string = activeTab, page: number = 1, perPage: number = 10): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await notificationService.getNotifications(tab, page, perPage);
        setNotifications(response.notifications?.data || []);
        setTotalCount(response.notifications?.total || 0);
        setCurrentPage(response.notifications?.current_page || 1);
        setLastPage(response.notifications?.last_page || 1);

        const unread = response.unreadCount ?? response.unreadNotificationsCount ?? 0;
        setUnreadCount(unread);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'CanceledError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Gagal memuat daftar notifikasi.');
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab]
  );

  const setActiveTab = useCallback(
    (tab: string) => {
      setActiveTabState(tab);
      void fetchList(tab, 1);
    },
    [fetchList]
  );

  /**
   * Mark single notification as read (optimistic update).
   */
  const markAsRead = useCallback(async (id: number | string): Promise<void> => {
    const numericId = Number(id);
    const nowIso = new Date().toISOString();

    // Optimistic UI update
    setRecentNotifications((prev) =>
      prev.map((item) => (item.id === numericId ? { ...item, read_at: item.read_at || nowIso } : item))
    );
    setNotifications((prev) =>
      prev.map((item) => (item.id === numericId ? { ...item, read_at: item.read_at || nowIso } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationService.markAsRead(id);
    } catch {
      // On error, refresh from server
      void refetchSummary();
    }
  }, [refetchSummary]);

  /**
   * Mark all notifications as read (optimistic update).
   */
  const markAllAsRead = useCallback(async (): Promise<void> => {
    const nowIso = new Date().toISOString();

    // Optimistic UI update
    setRecentNotifications((prev) =>
      prev.map((item) => ({ ...item, read_at: item.read_at || nowIso }))
    );
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read_at: item.read_at || nowIso }))
    );
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead();
    } catch {
      void refetchSummary();
    }
  }, [refetchSummary]);

  /**
   * Delete a notification (optimistic update).
   */
  const deleteNotification = useCallback(
    async (id: number | string): Promise<void> => {
      const numericId = Number(id);

      // Check if deleted item was unread to adjust badge
      const wasUnread =
        recentNotifications.some((n) => n.id === numericId && !n.read_at) ||
        notifications.some((n) => n.id === numericId && !n.read_at);

      setRecentNotifications((prev) => prev.filter((item) => item.id !== numericId));
      setNotifications((prev) => prev.filter((item) => item.id !== numericId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        await notificationService.deleteNotification(id);
      } catch {
        void refetchSummary();
      }
    },
    [recentNotifications, notifications, refetchSummary]
  );

  /**
   * Initial fetch and periodic polling when browser tab is visible.
   * Dinonaktifkan sementara menggunakan komentar sesuai instruksi pengguna.
   */
  /*
  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Initial load
    void refetchSummary(controller.signal);

    const intervalId = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        void refetchSummary();
      }
    }, pollingIntervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refetchSummary();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchSummary, pollingIntervalMs]);
  */

  const value = useMemo<NotificationContextValue>(
    () => ({
      recentNotifications,
      notifications,
      unreadCount,
      totalCount,
      currentPage,
      lastPage,
      activeTab,
      isLoading,
      error,
      setActiveTab,
      refetchSummary,
      fetchList,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    }),
    [
      recentNotifications,
      notifications,
      unreadCount,
      totalCount,
      currentPage,
      lastPage,
      activeTab,
      isLoading,
      error,
      setActiveTab,
      refetchSummary,
      fetchList,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationProvider;
