import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Inbox,
  Info,
  Loader2,
  Lock,
  MessageSquareText,
  Plus,
  RefreshCw,
  Send,
  UserRound,
  X,
} from 'lucide-react';
import { useUserContext } from '../../../context/UserContext';
import { normalizeRole, ROLES } from '../../../utils/roles';
import {
  createComplaint,
  getMyComplaints,
  getSchoolComplaints,
  updateComplaintStatus,
} from './complaintApi';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  formatComplaintDate,
  getCategoryLabel,
  getNextStatuses,
  getSenderName,
  getSenderRoleLabel,
  getStatusLabel,
  getStatusStyle,
} from './complaintDisplay';

const PAGE_SIZE = 10;
const COMPLAINT_MANAGERS = [ROLES.LEADER, ROLES.VICE_LEADER, ROLES.ADMINISTRATOR];
const COMPLAINT_SUBMITTERS = [
  ROLES.STUDENT,
  ROLES.PARENT,
  ROLES.STAFF,
  ROLES.EXAM_OFFICER,
];
const EMPTY_SUMMARY = {
  total: 0,
  submitted: 0,
  inProgress: 0,
  resolved: 0,
  closed: 0,
};
const EMPTY_DRAFT = {
  category: '',
  subject: '',
  description: '',
  isAnonymous: false,
};

const SUMMARY_CARDS = [
  { key: 'ALL', label: 'Total complaints', field: 'total', icon: Inbox, tone: 'bg-blue-50 text-blue-700' },
  { key: 'SUBMITTED', label: 'Submitted', field: 'submitted', icon: Send, tone: 'bg-amber-50 text-amber-700' },
  { key: 'IN_PROGRESS', label: 'In progress', field: 'inProgress', icon: Clock, tone: 'bg-blue-50 text-blue-700' },
  { key: 'RESOLVED', label: 'Resolved', field: 'resolved', icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
  { key: 'CLOSED', label: 'Closed', field: 'closed', icon: Lock, tone: 'bg-slate-100 text-slate-600' },
];

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100';

const selectClass =
  'w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100';

export default function ComplaintsPage() {
  const { user } = useUserContext();
  const role = normalizeRole(user?.role);
  const canManage = COMPLAINT_MANAGERS.includes(role);
  const canSubmit = COMPLAINT_SUBMITTERS.includes(role);
  const unavailable = !canManage && !canSubmit;

  const activeView = canManage ? 'inbox' : 'my';

  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    pageSize: PAGE_SIZE,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(!unavailable);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [activeComplaint, setActiveComplaint] = useState(null);
  const [updateDraft, setUpdateDraft] = useState({ status: '', resolutionNote: '' });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if (unavailable) {
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      const rangeInvalid = Boolean(startDate && endDate && startDate > endDate);

      if (activeView === 'inbox' && rangeInvalid) {
        setComplaints([]);
        setPagination({
          totalItems: 0,
          currentPage: 1,
          pageSize: PAGE_SIZE,
          totalPages: 0,
        });
        setLoadError('Start date must be earlier than or equal to end date.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError('');

      try {
        const response =
          activeView === 'inbox'
            ? await getSchoolComplaints({
                status: statusFilter === 'ALL' ? '' : statusFilter,
                category: categoryFilter === 'ALL' ? '' : categoryFilter,
                startDate,
                endDate,
                page,
                limit: PAGE_SIZE,
              })
            : await getMyComplaints({
                status: statusFilter === 'ALL' ? '' : statusFilter,
                page,
                limit: PAGE_SIZE,
              });

        if (cancelled) return;

        const data = response?.data || {};
        setComplaints(Array.isArray(data.complaints) ? data.complaints : []);
        setPagination({
          totalItems: Number(data.pagination?.totalItems) || 0,
          currentPage: Number(data.pagination?.currentPage) || page,
          pageSize: Number(data.pagination?.pageSize) || PAGE_SIZE,
          totalPages: Number(data.pagination?.totalPages) || 0,
        });

        if (activeView === 'inbox') {
          setSummary(data.summary || EMPTY_SUMMARY);
        }
      } catch (error) {
        if (cancelled) return;

        setComplaints([]);
        setPagination({
          totalItems: 0,
          currentPage: 1,
          pageSize: PAGE_SIZE,
          totalPages: 0,
        });
        setLoadError(
          error?.response?.data?.message ||
            'We could not load complaints. Check your connection and try again.'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [
    unavailable,
    activeView,
    page,
    statusFilter,
    categoryFilter,
    startDate,
    endDate,
    refreshKey,
  ]);

  function resetFilters() {
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setLoadError('');
  }

  function openComposer() {
    setDraft(EMPTY_DRAFT);
    setCreateError('');
    setComposerOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const subject = draft.subject.trim();
    const description = draft.description.trim();

    if (!draft.category) {
      setCreateError('Select a complaint category.');
      return;
    }

    if (subject.length < 3) {
      setCreateError('Complaint subject must be at least 3 characters.');
      return;
    }

    if (subject.length > 150) {
      setCreateError('Complaint subject cannot exceed 150 characters.');
      return;
    }

    if (description.length < 10) {
      setCreateError('Complaint description must be at least 10 characters.');
      return;
    }

    if (description.length > 5000) {
      setCreateError('Complaint description cannot exceed 5000 characters.');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      const response = await createComplaint({
        category: draft.category,
        subject,
        description,
        isAnonymous: Boolean(draft.isAnonymous),
      });

      setComposerOpen(false);
      setDraft(EMPTY_DRAFT);
      setNotice(response?.message || 'Complaint submitted successfully.');
      resetFilters();
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setCreateError(
        error?.response?.data?.message ||
          'We could not submit this complaint. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  }

  function openDetails(complaint) {
    setActiveComplaint(complaint);
    setUpdateDraft({
      status: getNextStatuses(complaint.status)[0] || '',
      resolutionNote: complaint.resolutionNote || '',
    });
    setUpdateError('');
  }

  function closeDetails() {
    if (updating) return;

    setActiveComplaint(null);
    setUpdateError('');
  }

  async function handleUpdateStatus() {
    if (!activeComplaint) return;

    if (!updateDraft.status) {
      setUpdateError('Select the new status for this complaint.');
      return;
    }

    if (updateDraft.resolutionNote.trim().length > 2000) {
      setUpdateError('Resolution note cannot exceed 2000 characters.');
      return;
    }

    setUpdating(true);
    setUpdateError('');

    try {
      const response = await updateComplaintStatus(activeComplaint.id, {
        status: updateDraft.status,
        resolutionNote: updateDraft.resolutionNote.trim(),
      });

      setActiveComplaint(null);
      setNotice(response?.message || 'Complaint status updated.');
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setUpdateError(
        error?.response?.data?.message ||
          'We could not update this complaint. Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  }

  const isLoading = !unavailable && loading;

  const hasFilters =
    activeView === 'inbox'
      ? statusFilter !== 'ALL' ||
        categoryFilter !== 'ALL' ||
        Boolean(startDate) ||
        Boolean(endDate)
      : statusFilter !== 'ALL';

  const heroTitle = unavailable
    ? 'Complaints'
    : activeView === 'inbox'
      ? 'Complaint inbox'
      : 'Your complaints';

  const heroSubtitle = unavailable
    ? 'Complaint submissions are handled by the school office.'
    : activeView === 'inbox'
      ? 'Review what students, parents and staff have raised, then move each case to resolution.'
      : 'Track the issues you have raised with the school and how they are handled.';

  const currentPage = pagination.currentPage || page;
  const firstItem = pagination.totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(currentPage * PAGE_SIZE, pagination.totalItems);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-[13px] text-slate-500"
      >
        <span>School</span>
        <ChevronRight size={14} />
        <span className="font-semibold text-[#071A52]">Complaints</span>
      </nav>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[30px] border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-cyan-400/[0.08] blur-2xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <MessageSquareText size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                Feedback & support
              </p>
              <h1 className="mt-1.5 text-2xl font-black sm:text-3xl">{heroTitle}</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                {heroSubtitle}
              </p>
            </div>
          </div>

          {canSubmit && (
            <button
              type="button"
              onClick={openComposer}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0A2463] transition hover:bg-blue-50"
            >
              <Plus size={16} />
              Submit a complaint
            </button>
          )}
        </div>

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

      {unavailable ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Info size={24} />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-[#071A52]">
            Complaints are not available for this account
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-500">
            Complaint submissions are open to students, parents and staff.
            Contact the school administrator if you need to raise an issue.
          </p>
        </section>
      ) : (
        <>
          {canManage && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {SUMMARY_CARDS.map((card) => (
                <SummaryCard
                  key={card.key}
                  card={card}
                  value={summary[card.field]}
                  active={statusFilter === card.key}
                  loading={isLoading && summary.total === 0}
                  onClick={() => {
                    setStatusFilter(card.key);
                    setPage(1);
                  }}
                />
              ))}
            </div>
          )}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {isLoading && complaints.length === 0
                    ? 'Loading complaints…'
                    : `${pagination.totalItems} complaint${
                        pagination.totalItems === 1 ? '' : 's'
                      }`}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  {activeView === 'inbox'
                    ? 'Complaints raised by people in your school.'
                    : 'Issues you have raised with the school.'}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                {activeView === 'inbox' ? (
                  <>
                    <select
                      value={categoryFilter}
                      onChange={(event) => {
                        setCategoryFilter(event.target.value);
                        setPage(1);
                      }}
                      aria-label="Filter complaints by category"
                      className={`${selectClass} sm:w-44`}
                    >
                      <option value="ALL">All categories</option>
                      {COMPLAINT_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={startDate}
                        max={endDate || undefined}
                        onChange={(event) => {
                          setStartDate(event.target.value);
                          setPage(1);
                        }}
                        aria-label="Start date"
                        className={`${inputClass} sm:w-40`}
                      />
                      <span className="text-[13px] text-slate-400">to</span>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={(event) => {
                          setEndDate(event.target.value);
                          setPage(1);
                        }}
                        aria-label="End date"
                        className={`${inputClass} sm:w-40`}
                      />
                    </div>
                  </>
                ) : (
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setPage(1);
                    }}
                    aria-label="Filter complaints by status"
                    className={`${selectClass} sm:w-44`}
                  >
                    <option value="ALL">All statuses</option>
                    {COMPLAINT_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                )}

                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="cursor-pointer rounded-xl px-3.5 py-2.5 text-[13px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {isLoading && complaints.length === 0 ? (
              <ComplaintSkeleton />
            ) : loadError ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <AlertCircle size={22} />
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-800">
                  Unable to load complaints
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
            ) : complaints.length === 0 ? (
              <ComplaintsEmptyState
                view={activeView}
                hasFilters={hasFilters}
                onClearFilters={resetFilters}
                onSubmit={canSubmit ? openComposer : null}
              />
            ) : (
              <div
                className={`divide-y divide-slate-100 transition ${
                  isLoading ? 'pointer-events-none opacity-60' : ''
                }`}
              >
                {complaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    showSender={activeView === 'inbox'}
                    onOpen={() => openDetails(complaint)}
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
                    disabled={currentPage <= 1 || isLoading}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft size={15} />
                    Previous
                  </button>

                  <span className="text-[13px] font-semibold text-slate-600">
                    Page {currentPage} of {Math.max(pagination.totalPages, 1)}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= pagination.totalPages || isLoading}
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
        </>
      )}

      {composerOpen && (
        <SubmitComplaintModal
          draft={draft}
          setDraft={setDraft}
          error={createError}
          saving={creating}
          onClose={() => {
            if (!creating) setComposerOpen(false);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {activeComplaint && (
        <ComplaintDetailsModal
          complaint={activeComplaint}
          canManage={canManage}
          updateDraft={updateDraft}
          setUpdateDraft={setUpdateDraft}
          updating={updating}
          error={updateError}
          onClose={closeDetails}
          onSubmit={handleUpdateStatus}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] ${getStatusStyle(
        status
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function SummaryCard({ card, value, active, loading, onClick }) {
  const Icon = card.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
        active
          ? 'border-[#0A2463] ring-2 ring-[#0A2463]/10'
          : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/30'
      }`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.tone}`}>
        <Icon size={17} />
      </span>

      {loading ? (
        <span className="mt-3 block h-7 w-10 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="mt-3 text-2xl font-black text-[#071A52]">{value}</p>
      )}
      <p className="mt-0.5 text-[13px] font-semibold text-slate-500">{card.label}</p>
    </button>
  );
}

function ComplaintCard({ complaint, showSender, onOpen }) {
  const senderName = complaint.isAnonymous ? 'Anonymous' : getSenderName(complaint.sender);
  const senderRole = complaint.isAnonymous ? '' : getSenderRoleLabel(complaint.sender);

  return (
    <article className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={complaint.status} />
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          {getCategoryLabel(complaint.category)}
        </span>
        <span className="text-[13px] text-slate-500">
          {formatComplaintDate(complaint.createdAt)}
        </span>
      </div>

      <h3 className="mt-3 text-base font-extrabold text-[#071A52]">
        {complaint.subject}
      </h3>
      <p className="mt-2 line-clamp-3 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
        {complaint.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        {showSender ? (
          <p className="flex items-center gap-1.5 text-[13px] text-slate-400">
            <UserRound size={14} />
            {senderName || 'Former user'}
            {senderRole && <span>· {senderRole}</span>}
          </p>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={onOpen}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-[#123A8F] transition hover:bg-blue-50"
        >
          View details
          <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}

function ComplaintSkeleton() {
  return (
    <div className="divide-y divide-slate-100" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div key={index} className="animate-pulse p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <div className="h-5 w-24 rounded-full bg-slate-100" />
            <div className="h-5 w-20 rounded-full bg-slate-100" />
            <div className="h-3.5 w-28 rounded bg-slate-100" />
          </div>
          <div className="mt-4 h-4 w-2/3 rounded bg-slate-100" />
          <div className="mt-3 h-3.5 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3.5 w-5/6 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function ComplaintsEmptyState({ view, hasFilters, onClearFilters, onSubmit }) {
  if (hasFilters) {
    return (
      <div className="px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <MessageSquareText size={24} />
        </div>
        <h3 className="mt-4 text-lg font-extrabold text-[#071A52]">
          No complaints match these filters
        </h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-500">
          Clear the filters to see every complaint.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-[#123A8F] transition hover:border-blue-300 hover:bg-blue-50"
        >
          Clear filters
        </button>
      </div>
    );
  }

  const isInbox = view === 'inbox';

  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <MessageSquareText size={24} />
      </div>
      <h3 className="mt-4 text-lg font-extrabold text-[#071A52]">
        {isInbox ? 'No complaints yet' : 'You have not submitted any complaints'}
      </h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-500">
        {isInbox
          ? 'Complaints submitted by students, parents and staff will appear here.'
          : 'Raise an issue with the school and track how it is handled.'}
      </p>
      {!isInbox && onSubmit && (
        <button
          type="button"
          onClick={onSubmit}
          className="mt-5 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F]"
        >
          <Plus size={16} />
          Submit a complaint
        </button>
      )}
    </div>
  );
}

function SubmitComplaintModal({ draft, setDraft, error, saving, onClose, onSubmit }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-complaint-title"
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <MessageSquareText size={22} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                  New complaint
                </p>
                <h2 id="submit-complaint-title" className="mt-1 text-xl font-extrabold">
                  Tell the school what happened
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close complaint form"
              className="cursor-pointer rounded-lg p-1.5 text-blue-100 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Category
            </span>
            <select
              value={draft.category}
              onChange={(event) =>
                setDraft((current) => ({ ...current, category: event.target.value }))
              }
              className={selectClass}
            >
              <option value="" disabled>
                Select a category
              </option>
              {COMPLAINT_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-[13px] font-semibold text-slate-700">
              Subject
              <span className="font-normal text-slate-400">
                {draft.subject.length}/150
              </span>
            </span>
            <input
              type="text"
              value={draft.subject}
              maxLength={150}
              onChange={(event) =>
                setDraft((current) => ({ ...current, subject: event.target.value }))
              }
              placeholder="e.g. Missing scores for first term mathematics"
              className={inputClass}
              autoFocus
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-[13px] font-semibold text-slate-700">
              Description
              <span className="font-normal text-slate-400">
                {draft.description.length}/5000
              </span>
            </span>
            <textarea
              value={draft.description}
              maxLength={5000}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={7}
              placeholder="Explain what happened, when it happened, and who was involved."
              className={`${inputClass} resize-y leading-6`}
            />
            <span className="mt-1.5 block text-[13px] leading-5 text-slate-500">
              School administrators read this exactly as written.
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <input
              type="checkbox"
              checked={draft.isAnonymous}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  isAnonymous: event.target.checked,
                }))
              }
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#0A2463]"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-800">
                Submit anonymously
              </span>
              <span className="mt-0.5 block text-[13px] leading-5 text-slate-500">
                School administrators will see the complaint but not your name.
              </span>
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
              {saving ? 'Submitting…' : 'Submit complaint'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ComplaintDetailsModal({
  complaint,
  canManage,
  updateDraft,
  setUpdateDraft,
  updating,
  error,
  onClose,
  onSubmit,
}) {
  const nextStatuses = getNextStatuses(complaint.status);
  const senderName = complaint.isAnonymous ? 'Anonymous' : getSenderName(complaint.sender);
  const senderRole =
    complaint.isAnonymous || !complaint.sender ? '' : getSenderRoleLabel(complaint.sender);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="complaint-details-title"
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <MessageSquareText size={22} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                  Complaint details
                </p>
                <h2
                  id="complaint-details-title"
                  className="mt-1 text-xl font-extrabold leading-7"
                >
                  {complaint.subject}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close complaint details"
              className="cursor-pointer rounded-lg p-1.5 text-blue-100 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={complaint.status} />
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {getCategoryLabel(complaint.category)}
            </span>
            <span className="text-[13px] text-slate-500">
              {formatComplaintDate(complaint.createdAt)}
            </span>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-slate-700">Description</p>
            <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-6 text-slate-700">
              {complaint.description}
            </p>
          </div>

          <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-[13px] text-slate-500">
              Submitted by{' '}
              <span className="font-semibold text-slate-700">
                {senderName || 'Former user'}
                {senderRole ? ` · ${senderRole}` : ''}
              </span>
            </p>
            <p className="text-[13px] text-slate-500">
              Submitted {formatComplaintDate(complaint.createdAt)}
            </p>
            {complaint.resolvedAt && (
              <p className="text-[13px] text-slate-500">
                Resolved {formatComplaintDate(complaint.resolvedAt)}
              </p>
            )}
            {complaint.resolutionNote && (
              <p className="text-[13px] leading-5 text-slate-600">
                <span className="font-semibold text-slate-700">Resolution note:</span>{' '}
                {complaint.resolutionNote}
              </p>
            )}
          </div>

          {canManage &&
            (nextStatuses.length > 0 ? (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold text-slate-900">Update status</h3>

                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                    New status
                  </span>
                  <select
                    value={updateDraft.status}
                    onChange={(event) =>
                      setUpdateDraft((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className={selectClass}
                  >
                    {nextStatuses.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center justify-between text-[13px] font-semibold text-slate-700">
                    Resolution note (optional)
                    <span className="font-normal text-slate-400">
                      {updateDraft.resolutionNote.length}/2000
                    </span>
                  </span>
                  <textarea
                    value={updateDraft.resolutionNote}
                    maxLength={2000}
                    onChange={(event) =>
                      setUpdateDraft((current) => ({
                        ...current,
                        resolutionNote: event.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Explain the outcome. The sender can see this note."
                    className={`${inputClass} resize-y leading-6`}
                  />
                </label>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] font-medium text-rose-700"
                  >
                    {error}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={updating}
                    className="cursor-pointer rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={updating}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#071A52] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    {updating ? 'Updating…' : 'Update status'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[13px] leading-5 text-slate-500">
                <Lock size={15} className="mt-0.5 shrink-0" />
                This complaint is closed. No further status changes are allowed.
              </p>
            ))}
        </div>
      </section>
    </div>
  );
}
