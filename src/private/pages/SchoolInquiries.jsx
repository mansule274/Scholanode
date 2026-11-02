import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Inbox,
  Info,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { useUserContext } from '../../context/UserContext';
import { normalizeRole, ROLES } from '../../utils/roles';
import {
  getSchoolInquiries,
  updateSchoolInquiryStatus,
} from './schoolInquiries/schoolInquiryApi';
import {
  formatInquiryDate,
  formatInquiryLongDate,
  getContactHref,
  getInquiryInitials,
  getInquiryStatusLabel,
  getInquiryStatusStyle,
  isEmailContact,
} from './schoolInquiries/schoolInquiryDisplay';

const PAGE_SIZE = 10;
const SEARCH_DELAY = 350;
const INQUIRY_MANAGER_ROLES = [
  ROLES.LEADER,
  ROLES.VICE_LEADER,
  ROLES.ADMINISTRATOR,
];
const EMPTY_COUNTS = { total: 0, new: 0, reviewed: 0 };

const SUMMARY_CARDS = [
  {
    key: 'ALL',
    label: 'Total inquiries',
    field: 'total',
    icon: Inbox,
    tone: 'bg-blue-50 text-blue-700',
  },
  {
    key: 'NEW',
    label: 'New',
    field: 'new',
    icon: MessageSquareText,
    tone: 'bg-amber-50 text-amber-700',
  },
  {
    key: 'REVIEWED',
    label: 'Reviewed',
    field: 'reviewed',
    icon: CheckCircle2,
    tone: 'bg-emerald-50 text-emerald-700',
  },
];

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100';

const selectClass =
  'w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100';

export default function SchoolInquiries() {
  const { user, school } = useUserContext();
  const role = normalizeRole(user?.role);
  const canManage = INQUIRY_MANAGER_ROLES.includes(role);
  const unavailable = !canManage;

  const schoolCode =
    school?.schoolCode ||
    user?.school?.schoolCode ||
    user?.schoolCode ||
    '';
  const publicContactPath = schoolCode
    ? `/school-contact?code=${encodeURIComponent(schoolCode)}`
    : '/school-contact';

  const [inquiries, setInquiries] = useState([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
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
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [refreshKey, setRefreshKey] = useState(0);

  const [activeInquiry, setActiveInquiry] = useState(null);
  const [updatingId, setUpdatingId] = useState('');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DELAY);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (unavailable) {
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const response = await getSchoolInquiries({
          page,
          limit: PAGE_SIZE,
          search,
          status: statusFilter === 'ALL' ? '' : statusFilter,
          sortBy: 'createdAt',
          sortOrder,
        });

        if (cancelled) return;

        const rows = Array.isArray(response?.data) ? response.data : [];
        const nextTotalPages = Number(response?.pagination?.totalPages) || 0;

        setInquiries(rows);
        setCounts({
          total: Number(response?.counts?.total) || 0,
          new: Number(response?.counts?.new) || 0,
          reviewed: Number(response?.counts?.reviewed) || 0,
        });
        setPagination({
          totalItems: Number(response?.pagination?.totalItems) || 0,
          currentPage: Number(response?.pagination?.currentPage) || page,
          pageSize: Number(response?.pagination?.pageSize) || PAGE_SIZE,
          totalPages: nextTotalPages,
        });

        if (nextTotalPages > 0 && page > nextTotalPages) {
          setPage(nextTotalPages);
        }
      } catch (error) {
        if (cancelled) return;

        setInquiries([]);
        setPagination({
          totalItems: 0,
          currentPage: 1,
          pageSize: PAGE_SIZE,
          totalPages: 0,
        });
        setLoadError(
          error?.response?.data?.message ||
            'We could not load school inquiries. Check your connection and try again.'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [unavailable, page, search, statusFilter, sortOrder, refreshKey]);

  function resetFilters() {
    setStatusFilter('ALL');
    setSearchInput('');
    setSearch('');
    setSortOrder('DESC');
    setPage(1);
    setLoadError('');
  }

  async function handleStatusChange(inquiry, nextStatus) {
    if (!inquiry || updatingId) return;

    setUpdatingId(inquiry.id);
    setUpdateError('');

    try {
      const response = await updateSchoolInquiryStatus(inquiry.id, nextStatus);
      const updated = response?.data || { ...inquiry, status: nextStatus };

      setInquiries((current) =>
        current.map((item) =>
          item.id === inquiry.id ? { ...item, ...updated } : item
        )
      );
      setActiveInquiry((current) =>
        current && current.id === inquiry.id
          ? { ...current, ...updated }
          : current
      );
      setNotice(
        response?.message ||
          `Inquiry marked as ${getInquiryStatusLabel(nextStatus).toLowerCase()}.`
      );
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setUpdateError(
        error?.response?.data?.message ||
          'We could not update this inquiry. Please try again.'
      );
    } finally {
      setUpdatingId('');
    }
  }

  function openInquiry(inquiry) {
    setActiveInquiry(inquiry);
    setUpdateError('');
  }

  function closeInquiry() {
    if (updatingId) return;

    setActiveInquiry(null);
    setUpdateError('');
  }

  const hasFilters =
    statusFilter !== 'ALL' || search.length > 0 || sortOrder !== 'DESC';
  const currentPage = pagination.currentPage || page;
  const firstItem =
    pagination.totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(currentPage * PAGE_SIZE, pagination.totalItems);
  const isLoading = !unavailable && loading;

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-[13px] text-slate-500"
      >
        <span>School</span>
        <ChevronRight size={14} />
        <span className="font-semibold text-[#071A52]">School inquiries</span>
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
                Public communication
              </p>
              <h1 className="mt-1.5 text-2xl font-black sm:text-3xl">
                School inquiries
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                Every message sent through your school&apos;s public
                contact page, in one inbox.
              </p>
            </div>
          </div>

          {canManage && (
            <a
              href={publicContactPath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
            >
              <ExternalLink size={15} />
              Public contact page
            </a>
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
            School inquiries are not available for this account
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-500">
            Public inquiries are managed by the school leader, vice leader
            and administrator. Contact the school office if you need access.
          </p>
        </section>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {SUMMARY_CARDS.map((card) => (
              <SummaryCard
                key={card.key}
                card={card}
                value={counts[card.field]}
                active={statusFilter === card.key}
                loading={isLoading && counts.total === 0}
                onClick={() => {
                  setStatusFilter(card.key);
                  setPage(1);
                }}
              />
            ))}
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {isLoading && inquiries.length === 0
                    ? 'Loading inquiries…'
                    : `${pagination.totalItems} inquir${
                        pagination.totalItems === 1 ? 'y' : 'ies'
                      }`}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  Messages received from your school&apos;s contact page.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="relative min-w-0 sm:w-64">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={searchInput}
                    maxLength={100}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search name, contact or subject"
                    aria-label="Search inquiries"
                    className={`${inputClass} pl-10 pr-9`}
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput('')}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSortOrder((value) =>
                      value === 'DESC' ? 'ASC' : 'DESC'
                    );
                    setPage(1);
                  }}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Clock3 size={15} />
                  {sortOrder === 'DESC' ? 'Newest first' : 'Oldest first'}
                </button>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter inquiries by status"
                  className={`${selectClass} sm:w-40`}
                >
                  <option value="ALL">All statuses</option>
                  <option value="NEW">New</option>
                  <option value="REVIEWED">Reviewed</option>
                </select>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="cursor-pointer rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {isLoading && inquiries.length === 0 ? (
              <InquirySkeleton />
            ) : loadError ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <AlertCircle size={22} />
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-800">
                  Unable to load inquiries
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
            ) : inquiries.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  {search ? <Search size={27} /> : <Inbox size={29} />}
                </div>

                <h3 className="mt-5 text-base font-bold text-[#071A52]">
                  {search
                    ? 'No matching inquiries'
                    : statusFilter === 'NEW'
                      ? 'No new inquiries'
                      : statusFilter === 'REVIEWED'
                        ? 'Nothing reviewed yet'
                        : 'No inquiries yet'}
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {search
                    ? 'Try another name, contact detail, subject or keyword.'
                    : 'When people contact your school through its public page, their messages will appear here.'}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#071A52] transition hover:bg-slate-50"
                    >
                      Clear filters
                    </button>
                  )}

                  {!hasFilters && (
                    <a
                      href={publicContactPath}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F]"
                    >
                      Open public contact page
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={`divide-y divide-slate-100 transition ${
                  isLoading ? 'pointer-events-none opacity-60' : ''
                }`}
              >
                {inquiries.map((inquiry) => (
                  <InquiryCard
                    key={inquiry.id}
                    inquiry={inquiry}
                    onOpen={() => openInquiry(inquiry)}
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
                    disabled={
                      currentPage >= pagination.totalPages || isLoading
                    }
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

      {activeInquiry && (
        <InquiryDetailsPanel
          inquiry={activeInquiry}
          updating={updatingId === activeInquiry.id}
          error={updateError}
          onClose={closeInquiry}
          onStatusChange={(status) =>
            handleStatusChange(activeInquiry, status)
          }
        />
      )}
    </div>
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
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.tone}`}
        >
          <Icon size={17} />
        </span>

        {active && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[#123A8F]">
            <Check size={14} />
          </span>
        )}
      </div>

      {loading ? (
        <span className="mt-3 block h-7 w-10 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="mt-3 text-2xl font-black text-[#071A52]">{value}</p>
      )}
      <p className="mt-0.5 text-[13px] font-semibold text-slate-500">
        {card.label}
      </p>
    </button>
  );
}

function StatusBadge({ status }) {
  const isNew = status === 'NEW';

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${getInquiryStatusStyle(
        status
      )}`}
    >
      {isNew ? <Clock3 size={12} /> : <CheckCircle2 size={12} />}
      {getInquiryStatusLabel(status)}
    </span>
  );
}

function InquiryCard({ inquiry, onOpen }) {
  return (
    <article className="p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#123A8F]">
          {getInquiryInitials(inquiry.fullName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-sm font-extrabold text-[#071A52]">
              {inquiry.fullName}
            </h3>
            <StatusBadge status={inquiry.status} />
            <span className="text-xs text-slate-400">
              {formatInquiryDate(inquiry.createdAt)}
            </span>
          </div>

          <p className="mt-1 break-all text-[13px] text-slate-500">
            {inquiry.contact}
          </p>

          <p className="mt-3 text-sm font-bold text-slate-800">
            {inquiry.subject}
          </p>
          <p className="mt-1 line-clamp-2 whitespace-pre-line break-words text-[13px] leading-6 text-slate-600">
            {inquiry.message}
          </p>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-[#123A8F] transition hover:bg-blue-50"
            >
              Open inquiry
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function InquirySkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex items-start gap-3 p-5 sm:p-6">
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-52 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function InquiryDetailsPanel({
  inquiry,
  updating,
  error,
  onClose,
  onStatusChange,
}) {
  const isNew = inquiry.status === 'NEW';
  const contactIsEmail = isEmailContact(inquiry.contact);
  const contactHref = getContactHref(inquiry.contact);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !updating) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, updating]);

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={() => {
          if (!updating) onClose();
        }}
        aria-hidden="true"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-detail-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <h2
              id="inquiry-detail-title"
              className="font-bold text-[#071A52]"
            >
              Inquiry details
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-500">
              Received {formatInquiryLongDate(inquiry.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            aria-label="Close inquiry details"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-[#123A8F]">
              {getInquiryInitials(inquiry.fullName)}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="break-words text-lg font-bold text-slate-900">
                {inquiry.fullName}
              </h3>
              <p className="mt-1 text-[13px] text-slate-500">
                Sent an inquiry from the public contact page
              </p>
              <div className="mt-3">
                <StatusBadge status={inquiry.status} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sender contact
            </h4>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                {contactIsEmail ? <Mail size={17} /> : <Phone size={17} />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">
                  {contactIsEmail ? 'Email address' : 'Phone number'}
                </p>
                <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                  {inquiry.contact}
                </p>
              </div>
            </div>

            {contactHref && (
              <a
                href={contactHref}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A2463] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              >
                {contactIsEmail ? <Mail size={16} /> : <Phone size={16} />}
                {contactIsEmail ? 'Contact by email' : 'Call sender'}
              </a>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <MessageSquareText size={15} />
              Message
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <h4 className="text-base font-bold leading-6 text-[#071A52]">
                {inquiry.subject}
              </h4>
              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                {inquiry.message}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <Info size={18} className="mt-0.5 shrink-0 text-blue-700" />
            <p className="text-xs leading-6 text-blue-900">
              Contact the sender directly if a reply is needed. Marking an
              inquiry as reviewed only records that you have checked it; it
              does not notify the sender.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              {error}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white p-5 sm:px-7">
          {isNew ? (
            <button
              type="button"
              onClick={() => onStatusChange('REVIEWED')}
              disabled={updating}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#071A52] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#0A2463] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updating ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} />
                  Mark as reviewed
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onStatusChange('NEW')}
              disabled={updating}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#071A52] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updating ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <MessageSquareText size={17} />
                  Mark as new
                </>
              )}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
