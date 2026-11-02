import { useContext } from 'react';
import { NotificationContext, type NotificationContextValue } from '../contexts/NotificationContext';

/**
 * Custom hook to consume the centralized NotificationContext.
 * Adheres to SIPBAJA DEVELOPMENT_RULES.md (Sections 10, 11.4).
 */
export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default useNotifications;
