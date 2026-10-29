import { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { useUserContext } from '../../../context/UserContext';
import { normalizeRole, ROLES } from '../../../utils/roles';
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  getMyAnnouncements,
} from './announcementApi';
import {
  AUDIENCE_OPTIONS,
  formatAnnouncementDate,
  getAudienceForRole,
  getAudienceLabel,
  getAudienceStyle,
  getCreatorName,
  getCreatorRoleLabel,
} from './announcementDisplay';

const PAGE_SIZE = 10;
const MANAGEMENT_ROLES = [ROLES.LEADER, ROLES.VICE_LEADER, ROLES.ADMINISTRATOR];
const EMPTY_DRAFT = { title: '', message: '', audience: '' };

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100';

export default function AnnouncementsPage() {
  const { user } = useUserContext();
  const role = normalizeRole(user?.role);
  const canManage = MANAGEMENT_ROLES.includes(role);
  const audienceForRole = getAudienceForRole(role);

  const [view, setView] = useState(null);
  const activeView = view ?? (canManage ? 'manage' : 'feed');

  const [announcements, setAnnouncements] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('ALL');
  const [refreshKey, setRefreshKey] = useState(0);

  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const response =
          activeView === 'manage'
            ? await getAnnouncements({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearch,
                audience: audienceFilter === 'ALL' ? '' : audienceFilter,
              })
            : await getMyAnnouncements({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearch,
              });

        if (cancelled) return;

        const data = response?.data || {};
        setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
        setPagination({
          page: Number(data.pagination?.page) || page,
          limit: Number(data.pagination?.limit) || PAGE_SIZE,
          totalItems: Number(data.pagination?.totalItems) || 0,
          totalPages: Number(data.pagination?.totalPages) || 0,
        });
      } catch (error) {
        if (cancelled) return;

        setAnnouncements([]);
        setPagination({ page, limit: PAGE_SIZE, totalItems: 0, totalPages: 0 });
        setLoadError(
          error?.response?.data?.message ||
            'We could not load announcements. Check your connection and try again.'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeView, page, debouncedSearch, audienceFilter, refreshKey]);

  function switchView(nextView) {
    if (nextView === activeView) return;

    setView(nextView);
    setPage(1);
    setSearch('');
    setDebouncedSearch('');
    setAudienceFilter('ALL');
    setLoadError('');
  }

  function openComposer() {
    setDraft(EMPTY_DRAFT);
    setCreateError('');
    setComposerOpen(true);
  }

  async function handleCreate(event) {
    event.preventDefault();

    const title = draft.title.trim();
    const message = draft.message.trim();

    if (title.length < 3) {
      setCreateError('Announcement title must be at least 3 characters.');
      return;
    }

    if (title.length > 200) {
      setCreateError('Announcement title cannot exceed 200 characters.');
      return;
    }

    if (!message) {
      setCreateError('Announcement message is required.');
      return;
    }

    if (!draft.audience) {
      setCreateError('Select a valid announcement audience.');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      const response = await createAnnouncement({
        title,
        message,
        audience: draft.audience,
      });

      setComposerOpen(false);
      setDraft(EMPTY_DRAFT);
      setNotice(response?.message || 'Announcement created successfully.');
      setView('manage');
      setPage(1);
      setSearch('');
      setDebouncedSearch('');
      setAudienceFilter('ALL');
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setCreateError(
        error?.response?.data?.message ||
          'We could not publish this announcement. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  }

  function requestDeletion(announcement) {
    setAnnouncementToDelete(announcement);
    setDeleteError('');
  }

  async function handleDelete() {
    if (!announcementToDelete) return;

    setDeleting(true);
    setDeleteError('');

    try {
      const response = await deleteAnnouncement(announcementToDelete.id);

      setAnnouncementToDelete(null);
      setNotice(response?.message || 'Announcement deleted successfully.');

      if (announcements.length === 1 && page > 1) {
        setPage((value) => value - 1);
      } else {
        setRefreshKey((value) => value + 1);
      }
    } catch (error) {
      setDeleteError(
        error?.response?.data?.message ||
          'We could not delete this announcement. Please try again.'
      );
    } finally {
      setDeleting(false);
    }
  }

  const audienceLabel = audienceForRole ? getAudienceLabel(audienceForRole) : '';
  const firstItem = pagination.totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, pagination.totalItems);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-[13px] text-slate-500"
      >
        <span>School</span>
        <ChevronRight size={14} />
        <span className="font-semibold text-[#071A52]">Announcements</span>
      </nav>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[30px] border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-cyan-400/[0.08] blur-2xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <Megaphone size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                School communication
              </p>
              <h1 className="mt-1.5 text-2xl font-black sm:text-3xl">
                {activeView === 'manage' ? 'All announcements' : 'Your announcements'}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                {activeView === 'manage'
                  ? 'Publish notices for a chosen audience and remove anything that is no longer relevant.'
                  : `Notices published for ${
                      audienceLabel ? audienceLabel.toLowerCase() : 'your audience'
                    } at your school.`}
              </p>
            </div>
          </div>

          {canManage ? (
            <button
              type="button"
              onClick={openComposer}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0A2463] transition hover:bg-blue-50"
            >
              <Plus size={16} />
              New announcement
            </button>
          ) : (
            audienceLabel && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-blue-100">
                Audience · {audienceLabel}
              </span>
            )
          )}
        </div>

        {canManage && (
          <div className="relative mt-5 inline-flex rounded-xl border border-white/15 bg-white/10 p-1">
            <button
              type="button"
              onClick={() => switchView('manage')}
              aria-pressed={activeView === 'manage'}
              className={`cursor-pointer rounded-lg px-3.5 py-2 text-[13px] font-bold transition ${
                activeView === 'manage'
                  ? 'bg-white text-[#071A52]'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Manage
            </button>
            <button
              type="button"
              onClick={() => switchView('feed')}
              aria-pressed={activeView === 'feed'}
              className={`cursor-pointer rounded-lg px-3.5 py-2 text-[13px] font-bold transition ${
                activeView === 'feed'
                  ? 'bg-white text-[#071A52]'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              My feed
            </button>
          </div>
        )}
      </section>

      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <span className="flex items-start gap-2">
            <Check size={16} className="mt-0.5 shrink-0" />
            {notice}
          </span>
          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Dismiss message"
            className="cursor-pointer rounded-lg p-1 transition hover:bg-emerald-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {loading && announcements.length === 0
                ? 'Loading announcements…'
                : `${pagination.totalItems} announcement${
                    pagination.totalItems === 1 ? '' : 's'
                  }`}
            </p>
            <p className="mt-0.5 text-[13px] text-slate-500">
              {activeView === 'manage'
                ? 'Everything the school has published.'
                : 'Notices delivered to your audience.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search title or message"
                aria-label="Search announcements"
                className={`${inputClass} pl-10`}
              />
            </div>

            {activeView === 'manage' && (
              <select
                value={audienceFilter}
                onChange={(event) => {
                  setAudienceFilter(event.target.value);
                  setPage(1);
                }}
                aria-label="Filter announcements by audience"
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 sm:w-44"
              >
                <option value="ALL">All audiences</option>
                {AUDIENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {loading && announcements.length === 0 ? (
          <AnnouncementSkeleton />
        ) : loadError ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle size={22} />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-800">
              Unable to load announcements
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              {loadError}
            </p>
            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              className="mt-4 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F]"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        ) : announcements.length === 0 ? (
          <AnnouncementEmptyState
            view={activeView}
            isSearching={Boolean(debouncedSearch)}
            audienceLabel={audienceLabel}
            onCreate={canManage ? openComposer : null}
          />
        ) : (
          <div
            className={`divide-y divide-slate-100 transition ${
              loading ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            {announcements.map((announcement) => (
              <AnnouncementItem
                key={announcement.id}
                announcement={announcement}
                showCreator={activeView === 'manage'}
                onDelete={canManage ? requestDeletion : null}
              />
            ))}
          </div>
        )}

        {!loadError && pagination.totalItems > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-[13px] text-slate-500">
              Showing {firstItem}–{lastItem} of {pagination.totalItems}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <span className="text-[13px] font-semibold text-slate-600">
                Page {pagination.page || page} of {Math.max(pagination.totalPages, 1)}
              </span>

              <button
                type="button"
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((value) => value + 1)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>

      {composerOpen && (
        <AnnouncementComposer
          draft={draft}
          setDraft={setDraft}
          error={createError}
          saving={creating}
          onClose={() => {
            if (!creating) setComposerOpen(false);
          }}
          onSubmit={handleCreate}
        />
      )}

      {announcementToDelete && (
        <DeleteAnnouncementDialog
          announcement={announcementToDelete}
          error={deleteError}
          deleting={deleting}
          onClose={() => {
            if (!deleting) {
              setAnnouncementToDelete(null);
              setDeleteError('');
            }
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function AnnouncementItem({ announcement, showCreator, onDelete }) {
  const creatorName = getCreatorName(announcement.creator);
  const creatorRole = getCreatorRoleLabel(announcement.creator);

  return (
    <article className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] ${getAudienceStyle(
              announcement.audience
            )}`}
          >
            {getAudienceLabel(announcement.audience)}
          </span>
          <span className="text-[13px] text-slate-500">
            {formatAnnouncementDate(announcement.createdAt)}
          </span>
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(announcement)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-rose-600 transition hover:bg-rose-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}
      </div>

      <h3 className="mt-3 text-base font-extrabold text-[#071A52]">
        {announcement.title}
      </h3>
      <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
        {announcement.message}
      </p>

      {showCreator && (creatorName || creatorRole) && (
        <p className="mt-4 flex flex-wrap items-center gap-1.5 text-[13px] text-slate-400">
          <UserRound size={14} />
          {creatorName || 'School office'}
          {creatorRole && <span>· {creatorRole}</span>}
        </p>
      )}
    </article>
  );
}

function AnnouncementSkeleton() {
  return (
    <div className="divide-y divide-slate-100" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div key={index} className="animate-pulse p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 rounded-full bg-slate-100" />
            <div className="h-3.5 w-32 rounded bg-slate-100" />
          </div>
          <div className="mt-4 h-4 w-2/3 rounded bg-slate-100" />
          <div className="mt-3 h-3.5 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3.5 w-5/6 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function AnnouncementEmptyState({ view, isSearching, audienceLabel, onCreate }) {
  let title = 'No announcements yet';
  let description =
    view === 'manage'
      ? 'Announcements you publish will appear here for the selected audience.'
      : `Notices for ${
          audienceLabel ? audienceLabel.toLowerCase() : 'your audience'
        } will appear here once the school publishes them.`;

  if (isSearching) {
    title = 'No announcements match your search';
    description = 'Try a different title or keyword.';
  }

  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Megaphone size={24} />
      </div>
      <h3 className="mt-4 text-lg font-extrabold text-[#071A52]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {view === 'manage' && !isSearching && onCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F]"
        >
          <Plus size={16} />
          New announcement
        </button>
      )}
    </div>
  );
}

function AnnouncementComposer({ draft, setDraft, error, saving, onClose, onSubmit }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-announcement-title"
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Megaphone size={22} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                  New announcement
                </p>
                <h2 id="compose-announcement-title" className="mt-1 text-xl font-extrabold">
                  Publish a notice
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close announcement form"
              className="cursor-pointer rounded-lg p-1.5 text-blue-100 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="max-h-[70vh] space-y-4 overflow-y-auto p-6"
        >
          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-[13px] font-semibold text-slate-700">
              Title
              <span className="font-normal text-slate-400">
                {draft.title.length}/200
              </span>
            </span>
            <input
              type="text"
              value={draft.title}
              maxLength={200}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="e.g. Mid-term break begins on Friday"
              className={inputClass}
              autoFocus
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Message
            </span>
            <textarea
              value={draft.message}
              onChange={(event) =>
                setDraft((current) => ({ ...current, message: event.target.value }))
              }
              rows={7}
              placeholder="Write the full notice learners, parents or staff should see."
              className={`${inputClass} resize-y leading-6`}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Audience
            </span>
            <select
              value={draft.audience}
              onChange={(event) =>
                setDraft((current) => ({ ...current, audience: event.target.value }))
              }
              className={`${inputClass} cursor-pointer font-semibold`}
            >
              <option value="" disabled>
                Select audience
              </option>
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="mt-1.5 block text-[13px] leading-5 text-slate-500">
              This notice is also delivered as a notification to everyone in the
              chosen audience.
            </span>
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] font-medium text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#071A52] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {saving ? 'Publishing…' : 'Publish announcement'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DeleteAnnouncementDialog({ announcement, error, deleting, onClose, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-announcement-title"
        aria-describedby="delete-announcement-description"
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="bg-gradient-to-br from-rose-700 to-red-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <AlertTriangle size={24} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-100">
                Permanent removal
              </p>
              <h2 id="delete-announcement-title" className="mt-1 text-xl font-extrabold">
                Delete this announcement?
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <p
            id="delete-announcement-description"
            className="text-sm leading-6 text-slate-700"
          >
            <strong className="font-bold text-slate-900">{announcement.title}</strong>{' '}
            will be removed for {getAudienceLabel(announcement.audience).toLowerCase()}.
            The shared notification linked to it is deleted as well. This cannot be
            undone.
          </p>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keep announcement
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {deleting ? 'Deleting…' : 'Delete announcement'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
