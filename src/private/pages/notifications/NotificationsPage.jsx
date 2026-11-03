import { useEffect, useState } from 'react';
import {
  Bell,
  BellOff,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import useNotifications from '../../../context/useNotifications';
import {
  formatNotificationTime,
  getNotificationMeta,
} from '../../../utils/notifications';

export default function NotificationsPage() {
  const {
    notifications,
    pagination,
    listLoading,
    listError,
    hasLoaded,
    loadNotifications,
  } = useNotifications();

  const [page, setPage] = useState(1);

  useEffect(() => {
    void loadNotifications({ page: 1 });
  }, [loadNotifications]);

  const changePage = (nextPage) => {
    setPage(nextPage);
    void loadNotifications({ page: nextPage });
  };

  const showInitialLoading = listLoading && notifications.length === 0;
  const showError = Boolean(listError) && notifications.length === 0;
  const showEmpty =
    hasLoaded && !listLoading && !listError && notifications.length === 0;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-[#071A52]">
              <Bell size={21} />
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-[#071A52]">
                Notifications
              </h2>
              <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
                Announcements and alerts for your role.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadNotifications({ page })}
            disabled={listLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={listLoading ? 'animate-spin' : ''}
            />
            {listLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {showInitialLoading && (
          <div
            role="status"
            className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center"
          >
            <Loader2 size={24} className="animate-spin text-cyan-600" />
            <p className="text-sm font-semibold text-slate-500">
              Loading notifications…
            </p>
          </div>
        )}

        {showError && (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <BellOff size={22} />
            </div>
            <p role="alert" className="max-w-md text-sm leading-6 text-rose-600">
              {listError}
            </p>
            <button
              type="button"
              onClick={() => loadNotifications({ page })}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {showEmpty && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <BellOff size={22} />
            </div>
            <p className="text-sm font-bold text-slate-600">
              No notifications yet
            </p>
            <p className="max-w-md text-[13px] leading-5 text-slate-400">
              When announcements or account alerts are sent, they will appear
              here.
            </p>
          </div>
        )}

        {notifications.length > 0 && (
          <>
            {listError && (
              <p
                role="alert"
                className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm leading-5 text-rose-700"
              >
                {listError}
              </p>
            )}

            <ul className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <NotificationListItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </ul>

            {pagination.totalPages > 1 && (
              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] font-medium text-slate-500">
                  Page {pagination.currentPage} of {pagination.totalPages}
                  <span className="ml-1.5 text-slate-400">
                    · {pagination.totalItems} total
                  </span>
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => changePage(page - 1)}
                    disabled={listLoading || page <= 1}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => changePage(page + 1)}
                    disabled={listLoading || page >= pagination.totalPages}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function NotificationListItem({ notification }) {
  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;

  return (
    <li className="flex gap-4 px-5 py-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.tone}`}
      >
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <p className="text-sm font-bold text-[#071A52]">
            {notification.title}
          </p>
          <span className="shrink-0 text-xs font-medium text-slate-400">
            {formatNotificationTime(notification.createdAt)}
          </span>
        </div>

        <p className="mt-1.5 text-sm leading-6 text-slate-600">
          {notification.message}
        </p>

        <span
          className={`mt-2.5 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${meta.tone}`}
        >
          {meta.label}
        </span>
      </div>
    </li>
  );
}
