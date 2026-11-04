import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import NotificationContext from './notificationContextStore';
import { getMyNotifications, getUnreadNotificationCount } from '../services/notificationApi';
import {
  disconnectNotificationSocket,
  getNotificationSocket,
} from '../services/notificationSocket';
import { useUserContext } from './UserContext';
import {
  playAudioChime,
  unlockAudioOnFirstInteraction,
} from '../utils/sounds';

const SOUND_PREFERENCE_KEY = 'scholanode_notification_sound';

const emptyPagination = {
  totalItems: 0,
  currentPage: 1,
  pageSize: 15,
  totalPages: 0,
};

export default function NotificationProvider({ children }) {
  const { isAuthenticated } = useUserContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    try {
      return localStorage.getItem(SOUND_PREFERENCE_KEY) !== 'off';
    } catch {
      return true;
    }
  });
  const requestIdRef = useRef(0);
  const unreadCountRef = useRef(0);

  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const toggleNotificationSound = useCallback(() => {
    setSoundEnabledState((current) => {
      const next = !current;

      try {
        localStorage.setItem(SOUND_PREFERENCE_KEY, next ? 'on' : 'off');
      } catch {
        // Storage unavailable; the preference just will not persist.
      }

      return next;
    });
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const payload = await getUnreadNotificationCount();
      const nextCount = Number(payload?.data?.unreadCount);

      setUnreadCount(Number.isFinite(nextCount) && nextCount > 0 ? nextCount : 0);
    } catch {
      // Keep the last known count when the HTTP fallback fails.
    }
  }, [isAuthenticated]);

  const loadNotifications = useCallback(
    async ({ page = 1, limit = 15 } = {}) => {
      if (!isAuthenticated) return false;

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setListLoading(true);
      setListError('');

      try {
        const payload = await getMyNotifications({ page, limit });

        if (requestId !== requestIdRef.current) return false;

        const data = payload?.data || {};
        const nextNotifications = Array.isArray(data.notifications) ? data.notifications : [];
        const nextPagination = data.pagination || {};
        const totalItems = Number(nextPagination.totalItems) || 0;
        const pageSize = Number(nextPagination.pageSize) || limit;
        const totalPages =
          Number(nextPagination.totalPages) ||
          (totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0);

        setNotifications(nextNotifications);
        setPagination({
          totalItems,
          currentPage: Number(nextPagination.currentPage) || page,
          pageSize,
          totalPages,
        });
        setHasLoaded(true);

        // The server marks notifications as read on this request. Refresh the
        // badge locally in case the socket connection is unavailable.
        void refreshUnreadCount();

        return true;
      } catch (error) {
        if (requestId === requestIdRef.current) {
          setListError(
            error?.response?.data?.message || 'Unable to load notifications.'
          );
          setHasLoaded(true);
        }

        return false;
      } finally {
        if (requestId === requestIdRef.current) {
          setListLoading(false);
        }
      }
    },
    [isAuthenticated, refreshUnreadCount]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectNotificationSocket();
      return undefined;
    }

    const socket = getNotificationSocket();

    unlockAudioOnFirstInteraction();

    const handleCountUpdated = (payload) => {
      const nextCount = Number(payload?.unreadCount);

      if (!Number.isFinite(nextCount)) return;

      const normalized = nextCount > 0 ? nextCount : 0;

      // Only sound for genuinely new notifications. Reconnect and list
      // refreshes keep the count unchanged or lower it.
      if (soundEnabled && normalized > unreadCountRef.current) {
        playAudioChime('success');
      }

      setUnreadCount(normalized);
    };

    const handleConnect = () => {
      void refreshUnreadCount();
    };

    socket.on('notification_count_updated', handleCountUpdated);
    socket.on('connect', handleConnect);

    // Load the count immediately even if the socket connection is delayed.
    const initialCountRequest = window.setTimeout(() => {
      void refreshUnreadCount();
    }, 0);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      window.clearTimeout(initialCountRequest);
      socket.off('notification_count_updated', handleCountUpdated);
      socket.off('connect', handleConnect);
    };
  }, [isAuthenticated, refreshUnreadCount, soundEnabled]);

  // Counts can change while the socket is offline, so refresh on refocus.
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshUnreadCount();
      }
    };

    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, refreshUnreadCount]);

  useEffect(
    () => () => {
      disconnectNotificationSocket();
    },
    []
  );

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        pagination,
        listLoading,
        listError,
        hasLoaded,
        refreshUnreadCount,
        loadNotifications,
        soundEnabled,
        toggleNotificationSound,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
