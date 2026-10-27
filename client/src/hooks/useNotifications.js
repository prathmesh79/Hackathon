import { useState, useCallback } from 'react';

let notificationListeners = [];
let notificationsState = [];

export function useNotifications() {
  const [notifications, setNotifications] = useState(notificationsState);

  const updateListeners = useCallback(() => {
    notificationListeners.forEach(listener => listener(notificationsState));
  }, []);

  const addNotification = useCallback((notification) => {
    notificationsState = [
      {
        id: Date.now(),
        read: false,
        timestamp: new Date().toISOString(),
        ...notification
      },
      ...notificationsState
    ];
    updateListeners();
  }, [updateListeners]);

  const showSuccess = useCallback((message) => {
    addNotification({ type: 'success', message });
  }, [addNotification]);

  const showError = useCallback((message) => {
    addNotification({ type: 'error', message });
  }, [addNotification]);

  const showInfo = useCallback((message) => {
    addNotification({ type: 'info', message });
  }, [addNotification]);

  const markAsRead = useCallback((id) => {
    notificationsState = notificationsState.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    updateListeners();
  }, [updateListeners]);

  const clearAll = useCallback(() => {
    notificationsState = [];
    updateListeners();
  }, [updateListeners]);

  // Subscribe to updates
  useState(() => {
    notificationListeners.push(setNotifications);
    return () => {
      notificationListeners = notificationListeners.filter(l => l !== setNotifications);
    };
  });

  return {
    notifications,
    showSuccess,
    showError,
    showInfo,
    markAsRead,
    clearAll
  };
}
