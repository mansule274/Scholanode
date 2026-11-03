import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import useNotifications from '../../context/useNotifications';
import {
  formatNotificationTime,
  getNotificationMeta,
} from '../../utils/notifications';

const dropdownLimit = 10;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const {
    unreadCount,
    notifications,
    pagination,
    listLoading,
    listError,
    hasLoaded,
    loadNotifications,
    refreshUnreadCount,
  } = useNotifications();

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open) {
      void refreshUnreadCount();
      void loadNotifications({ page: 1, limit: dropdownLimit });
    }

    setOpen((current) => !current);
  };

  const showInitialLoading = listLoading && notifications.length === 0;
  const showError = Boolean(listError) && notifications.length === 0;
  const showEmpty =
    hasLoaded && !listLoading && !listError && notifications.length === 0;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : 'Notifications'
        }
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border bg-white transition ${
          open
            ? 'border-blue-300 text-[#071A52] ring-4 ring-blue-100/70'
            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-[#071A52]'
        }`}
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white ring-2 ring-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-4 top-[88px] z-50 flex max-h-[calc(100dvh-7rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-none sm:w-[22rem] sm:max-w-[calc(100vw-2rem)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <div>
              <p className="text-sm font-extrabold text-[#071A52]">Notifications</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : 'You are up to date'}
              </p>
            </div>

            {listLoading && (
              <RefreshCw
                size={15}
                className="animate-spin text-slate-400"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto sm:max-h-[22rem] sm:flex-none">
            {showInitialLoading && (
              <div
                role="status"
                className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center"
              >
                <Loader2 size={20} className="animate-spin text-cyan-600" />
                <p className="text-sm font-semibold text-slate-500">
                  Loading notifications…
                </p>
              </div>
            )}

            {showError && (
              <div className="px-4 py-6 text-center">
                <p role="alert" className="text-sm leading-6 text-rose-600">
                  {listError}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    loadNotifications({ page: 1, limit: dropdownLimit })
                  }
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <RefreshCw size={14} />
                  Retry
                </button>
              </div>
            )}

            {showEmpty && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Bell size={20} />
                </div>
                <p className="text-sm font-bold text-slate-600">
                  No notifications yet
                </p>
                <p className="text-[13px] leading-5 text-slate-400">
                  Announcements and alerts for your role will appear here.
                </p>
              </div>
            )}

            {notifications.length > 0 && (
              <>
                {listError && (
                  <p
                    role="alert"
                    className="border-b border-rose-100 bg-rose-50 px-4 py-2.5 text-[13px] leading-5 text-rose-700"
                  >
                    {listError}
                  </p>
                )}

                <ul className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <NotificationPreviewItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between gap-2 border-t border-slate-100 bg-white px-4 py-3 text-sm font-bold text-[#071A52] transition hover:bg-slate-50"
          >
            <span>
              View all notifications
              {pagination.totalItems > notifications.length && (
                <span className="ml-1.5 text-xs font-semibold text-slate-400">
                  ({pagination.totalItems})
                </span>
              )}
            </span>
            <ChevronRight size={16} className="text-slate-400" />
          </Link>
        </div>
      )}
    </div>
  );
}

function NotificationPreviewItem({ notification }) {
  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;

  return (
    <li>
      <div className="flex gap-3 px-4 py-3.5 transition hover:bg-slate-50">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-bold text-[#071A52]">
              {notification.title}
            </p>
            <span className="shrink-0 text-xs text-slate-400">
              {formatNotificationTime(notification.createdAt)}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-slate-600">
            {notification.message}
          </p>

          <p className="mt-1.5 text-xs font-semibold text-slate-400">
            {meta.label}
          </p>
        </div>
      </div>
    </li>
  );
}
