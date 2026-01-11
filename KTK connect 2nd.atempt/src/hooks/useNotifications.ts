import { useState } from 'react';
import { Notification } from '@/types';
import { mockNotifications } from '../data/mockData';

export interface UseNotificationsReturnType {
  notifications: Notification[];
  addNotification: (message: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
}

export const useNotifications = (): UseNotificationsReturnType => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const addNotification = (message: string) => {
    setNotifications(prev => [
      { id: `notif-${Date.now()}`, message, timestamp: new Date(), read: false },
      ...prev,
    ]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
  };

  return { notifications, addNotification, markNotificationAsRead };
};
