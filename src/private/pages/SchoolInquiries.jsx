
import { useMemo, useState } from 'react';
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  Inbox,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  Phone,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';

const INITIAL_INQUIRIES = [
  {
    id: 'INQ-1001',
    fullName: 'Amina Mohammed',
    contact: 'amina.mohammed@example.com',
    contactType: 'email',
    subject: 'Admission inquiry',
    message:
      'Good morning. I would like to know about the admission process for Primary 1 for the next academic session. Please let me know the admission requirements, when applications will open, and whether there is an entrance assessment for new pupils. Thank you.',
    status: 'NEW',
    createdAt: '2026-10-24T09:30:00',
  },
  {
    id: 'INQ-1002',
    fullName: 'Yusuf Umar',
    contact: '+234 801 234 5678',
    contactType: 'phone',
    subject: 'School hours',
    message:
      'Please, I would like to know your school opening and closing times. I am planning for my child and need to arrange transportation. Thank you.',
    status: 'REVIEWED',
    createdAt: '2026-10-23T14:15:00',
  },
  {
    id: 'INQ-1003',
    fullName: 'Fatima Ibrahim',
    contact: 'fatima.ibrahim@example.com',
    contactType: 'email',
    subject: 'School fees',
    message:
      'Hello. Kindly provide information about your school fees for JSS 1, including tuition and any other compulsory charges. I would also appreciate information about your payment arrangements.',
    status: 'NEW',
    createdAt: '2026-10-23T11:20:00',
  },
  {
    id: 'INQ-1004',
    fullName: 'Musa Abdullahi',
    contact: '+234 803 456 7890',
    contactType: 'phone',
    subject: 'Transfer admission',
    message:
      'I want to enquire about transferring my child to your school. The child is currently in Primary 4. Please let me know if transfers are accepted during the school year and which documents we would need to provide.',
    status: 'REVIEWED',
    createdAt: '2026-10-22T16:40:00',
  },
  {
    id: 'INQ-1005',
    fullName: 'Zainab Bello',
    contact: 'zainab.bello@example.com',
    contactType: 'email',
    subject: 'General inquiry',
    message:
      'Good afternoon. I would like to learn more about your school, the subjects offered, and the extracurricular activities available to pupils. Thank you for your time.',
    status: 'NEW',
    createdAt: '2026-10-22T10:05:00',
  },
  {
    id: 'INQ-1006',
    fullName: 'Ibrahim Sani',
    contact: '+234 806 789 1234',
    contactType: 'phone',
    subject: 'School transportation',
    message:
      'Does the school provide transportation for pupils? If yes, please let me know the available routes and how the transportation service is arranged.',
    status: 'REVIEWED',
    createdAt: '2026-10-21T13:25:00',
  },
  {
    id: 'INQ-1007',
    fullName: 'Maryam Adamu',
    contact: 'maryam.adamu@example.com',
    contactType: 'email',
    subject: 'Admission requirements',
    message:
      'Please, what documents should a parent bring when registering a new student? I would like to prepare everything before visiting the school.',
    status: 'NEW',
    createdAt: '2026-10-20T09:10:00',
  },
  {
    id: 'INQ-1008',
    fullName: 'Abubakar Lawal',
    contact: '+234 809 123 4567',
    contactType: 'phone',
    subject: 'School visit',
    message:
      'I would like to visit the school to see the facilities and discuss admission with the administration. Please let me know a convenient time to come.',
    status: 'REVIEWED',
    createdAt: '2026-10-19T15:50:00',
  },
  {
    id: 'INQ-1009',
    fullName: 'Hauwa Aliyu',
    contact: 'hauwa.aliyu@example.com',
    contactType: 'email',
    subject: 'Curriculum inquiry',
    message:
      'I would like to know about the curriculum used by the school and whether you offer both primary and secondary education.',
    status: 'NEW',
    createdAt: '2026-10-18T12:30:00',
  },
  {
    id: 'INQ-1010',
    fullName: 'Sadiq Garba',
    contact: '+234 807 321 6549',
    contactType: 'phone',
    subject: 'General inquiry',
    message:
      'Good day. I am interested in learning more about your school and the services available to parents. Please contact me when convenient.',
    status: 'REVIEWED',
    createdAt: '2026-10-17T08:45:00',
  },
  {
    id: 'INQ-1011',
    fullName: 'Safiya Musa',
    contact: 'safiya.musa@example.com',
    contactType: 'email',
    subject: 'Admission availability',
    message:
      'Are there available spaces for new pupils in Primary 3? I would like to enrol my daughter and would appreciate further information.',
    status: 'NEW',
    createdAt: '2026-10-16T11:45:00',
  },
  {
    id: 'INQ-1012',
    fullName: 'Usman Yakubu',
    contact: '+234 805 987 6543',
    contactType: 'phone',
    subject: 'School policies',
    message:
      'I would like to enquire about the school uniform requirements and the policies parents should know before enrolling their children.',
    status: 'REVIEWED',
    createdAt: '2026-10-15T10:20:00',
  },
];

const FILTERS = [
  { value: 'ALL', label: 'All inquiries' },
  { value: 'NEW', label: 'New' },
  { value: 'REVIEWED', label: 'Reviewed' },
];

function getInitials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  );
}

function formatDate(dateString) {
  const date = new Date(dateString);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

  const time = date.toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isSameDay(date, today)) return `Today, ${time}`;
  if (isSameDay(date, yesterday)) return `Yesterday, ${time}`;

  return `${date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year:
      date.getFullYear() !== today.getFullYear()
        ? 'numeric'
        : undefined,
  })}, ${time}`;
}

function formatRelativeDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const isNew = status === 'NEW';

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isNew
          ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
          : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
      }`}
    >
      {isNew ? (
        <Clock3 size={12} />
      ) : (
        <CheckCircle2 size={12} />
      )}
      {isNew ? 'New' : 'Reviewed'}
    </span>
  );
}

function Avatar({ name, size = 'normal' }) {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-cyan-100 text-cyan-700',
  ];

  const colorIndex =
    name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    colors.length;

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${
        colors[colorIndex]
      } ${
        size === 'large'
          ? 'h-14 w-14 text-lg'
          : 'h-11 w-11 text-sm'
      }`}
    >
      {getInitials(name)}
    </div>
  );
}

export default function SchoolInquiries() {
  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('newest');

  const PAGE_SIZE = 6;

  const counts = useMemo(
    () => ({
      ALL: inquiries.length,
      NEW: inquiries.filter((item) => item.status === 'NEW').length,
      REVIEWED: inquiries.filter((item) => item.status === 'REVIEWED')
        .length,
    }),
    [inquiries]
  );

  const filteredInquiries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return inquiries
      .filter((item) => {
        if (activeFilter !== 'ALL' && item.status !== activeFilter) {
          return false;
        }

        if (!query) return true;

        return [
          item.fullName,
          item.contact,
          item.subject,
          item.message,
          item.id,
        ].some((value) => value.toLowerCase().includes(query));
      })
      .sort((a, b) => {
        const difference =
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime();

        return sortOrder === 'newest' ? -difference : difference;
      });
  }, [inquiries, activeFilter, search, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInquiries.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const selectedInquiry =
    inquiries.find((item) => item.id === selectedInquiryId) || null;

  const setFilter = (filter) => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const toggleSort = () => {
    setSortOrder((previous) =>
      previous === 'newest' ? 'oldest' : 'newest'
    );
    setPage(1);
  };

  const markAsReviewed = (id) => {
    setInquiries((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, status: 'REVIEWED' }
          : item
      )
    );
  };

  const markAsNew = (id) => {
    setInquiries((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status: 'NEW' } : item
      )
    );
  };

  const openInquiry = (id) => {
    setSelectedInquiryId(id);
  };

  const closeInquiry = () => {
    setSelectedInquiryId(null);
  };

  const contactSender = (inquiry) => {
    if (inquiry.contactType === 'email') {
      window.location.href = `mailto:${inquiry.contact}`;
      return;
    }

    const phone = inquiry.contact.replace(/[^\d+]/g, '');
    window.location.href = `tel:${phone}`;
  };

  const clearFilters = () => {
    setSearch('');
    setActiveFilter('ALL');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-[#071A52] px-6 py-7 text-white shadow-lg shadow-blue-950/10 sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[38px] border-white/[0.05]" />
          <div className="pointer-events-none absolute -bottom-28 right-40 h-52 w-52 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                <MessageSquareText size={14} />
                School communication
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                School Inquiries
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Manage messages from people who want to connect with
                your school. Review their questions and contact them
                directly when necessary.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.08] p-4 sm:min-w-48">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <Inbox size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-100">
                  Total inquiries
                </p>
                <p className="mt-1 text-2xl font-black">
                  {counts.ALL}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={Inbox}
            label="All inquiries"
            count={counts.ALL}
            description="Every message received"
            active={activeFilter === 'ALL'}
            onClick={() => setFilter('ALL')}
            iconStyle="bg-blue-50 text-blue-700"
          />

          <SummaryCard
            icon={MessageSquareText}
            label="New inquiries"
            count={counts.NEW}
            description="Awaiting your review"
            active={activeFilter === 'NEW'}
            onClick={() => setFilter('NEW')}
            iconStyle="bg-amber-50 text-amber-700"
          />

          <SummaryCard
            icon={CheckCheck}
            label="Reviewed inquiries"
            count={counts.REVIEWED}
            description="Already checked"
            active={activeFilter === 'REVIEWED'}
            onClick={() => setFilter('REVIEWED')}
            iconStyle="bg-emerald-50 text-emerald-700"
          />
        </section>

        {/* Inbox */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-[#071A52]">
                  Received inquiries
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select a message to view its full details.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 sm:w-72">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => handleSearch(event.target.value)}
                    placeholder="Search inquiries..."
                    aria-label="Search inquiries"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#123A8F] focus:ring-4 focus:ring-[#123A8F]/10"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => handleSearch('')}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={toggleSort}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <ArrowDownUp size={15} />
                  {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {FILTERS.map((filter) => {
                const active = activeFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setFilter(filter.value)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-[#071A52] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter.label}
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-xs tabular-nums ${
                        active
                          ? 'bg-white/15 text-white'
                          : 'bg-white text-slate-500'
                      }`}
                    >
                      {counts[filter.value]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table heading */}
          {filteredInquiries.length > 0 && (
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.7fr)_auto] gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:grid">
              <span>Sender</span>
              <span>Inquiry</span>
              <span>Date received</span>
              <span>Status</span>
            </div>
          )}

          {/* Inquiry rows */}
          {paginatedInquiries.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {paginatedInquiries.map((inquiry) => (
                <button
                  key={inquiry.id}
                  type="button"
                  onClick={() => openInquiry(inquiry.id)}
                  className={`group grid w-full grid-cols-1 gap-3 px-5 py-4 text-left transition hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#123A8F] md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.7fr)_auto] md:items-center md:gap-4 md:px-6 ${
                    inquiry.status === 'NEW' ? 'bg-slate-50/50' : ''
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={inquiry.fullName} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {inquiry.fullName}
                        </p>
                        {inquiry.status === 'NEW' && (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full bg-blue-600"
                            title="New inquiry"
                          />
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {inquiry.contact}
                      </p>
                    </div>

                    <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#123A8F] md:hidden">
                      <ChevronRight size={18} />
                    </span>
                  </div>

                  <div className="min-w-0 pl-14 md:pl-0">
                    <p className="truncate text-sm font-semibold text-slate-700">
                      {inquiry.subject}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs leading-5 text-slate-500">
                      {inquiry.message}
                    </p>
                  </div>

                  <div className="pl-14 text-xs text-slate-500 md:pl-0">
                    <span className="md:hidden">Received: </span>
                    {formatDate(inquiry.createdAt)}
                  </div>

                  <div className="flex items-center justify-between gap-3 pl-14 md:justify-end md:pl-0">
                    <StatusBadge status={inquiry.status} />
                    <ChevronRight
                      size={17}
                      className="hidden text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#123A8F] md:block"
                    />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                {search ? (
                  <Search size={27} />
                ) : (
                  <Inbox size={29} />
                )}
              </div>

              <h3 className="mt-5 text-base font-bold text-[#071A52]">
                {search
                  ? 'No matching inquiries'
                  : activeFilter === 'NEW'
                    ? 'You are all caught up'
                    : activeFilter === 'REVIEWED'
                      ? 'No reviewed inquiries yet'
                      : 'No inquiries yet'}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {search
                  ? 'Try another name, contact detail, subject, or keyword.'
                  : 'When people contact your school through ScholaNode, their messages will appear here.'}
              </p>

              {(search || activeFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#071A52] transition hover:bg-slate-50"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {filteredInquiries.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700">
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filteredInquiries.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-slate-700">
                  {filteredInquiries.length}
                </span>{' '}
                inquiries
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((previous) => previous - 1)}
                  aria-label="Previous page"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                </button>

                <span className="px-2 text-sm font-medium text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((previous) => previous + 1)}
                  aria-label="Next page"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2 text-sm font-bold text-[#071A52]">
            <GraduationCap size={19} />
            ScholaNode
          </div>

          <p className="text-xs leading-5 text-slate-500">
            Helping schools and communities stay connected.
          </p>
        </footer>
      </div>

      {/* Inquiry detail panel */}
      {selectedInquiry && (
        <InquiryDetailPanel
          inquiry={selectedInquiry}
          onClose={closeInquiry}
          onMarkReviewed={() => markAsReviewed(selectedInquiry.id)}
          onMarkNew={() => markAsNew(selectedInquiry.id)}
          onContact={() => contactSender(selectedInquiry)}
        />
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  count,
  description,
  active,
  onClick,
  iconStyle,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? 'border-[#123A8F]/40 ring-2 ring-[#123A8F]/10'
          : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}>
          <Icon size={21} />
        </div>

        {active && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[#123A8F]">
            <Check size={14} />
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <p className="text-3xl font-black tabular-nums tracking-tight text-[#071A52]">
          {count}
        </p>
      </div>
    </button>
  );
}

function InquiryDetailPanel({
  inquiry,
  onClose,
  onMarkReviewed,
  onMarkNew,
  onContact,
}) {
  const isNew = inquiry.status === 'NEW';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-detail-title"
        className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close inquiry details"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
            </button>

            <div>
              <h2
                id="inquiry-detail-title"
                className="font-bold text-[#071A52]"
              >
                Inquiry details
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Reference: {inquiry.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        {/* Panel content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <Avatar name={inquiry.fullName} size="large" />

            <div className="min-w-0 flex-1">
              <h3 className="break-words text-lg font-bold text-slate-900">
                {inquiry.fullName}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Sent an inquiry
              </p>
              <div className="mt-3">
                <StatusBadge status={inquiry.status} />
              </div>
            </div>
          </div>

          {/* Contact information */}
          <div className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sender contact
            </h4>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                {inquiry.contactType === 'email' ? (
                  <Mail size={17} />
                ) : (
                  <Phone size={17} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">
                  {inquiry.contactType === 'email'
                    ? 'Email address'
                    : 'Phone number'}
                </p>
                <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                  {inquiry.contact}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onContact}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A2463]"
            >
              {inquiry.contactType === 'email' ? (
                <Mail size={16} />
              ) : (
                <Phone size={16} />
              )}
              {inquiry.contactType === 'email'
                ? 'Contact by email'
                : 'Call sender'}
            </button>
          </div>

          {/* Message */}
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

          {/* Received date */}
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Clock3 size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">
                Date received
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatRelativeDate(inquiry.createdAt)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {formatDate(inquiry.createdAt)}
              </p>
            </div>
          </div>

          {/* Guidance */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-blue-700" />
            <p className="text-xs leading-6 text-blue-900">
              Contact the sender directly if a response is needed.
              Marking an inquiry as reviewed only records that you have
              checked the message; it does not notify the sender.
            </p>
          </div>
        </div>

        {/* Panel actions */}
        <div className="border-t border-slate-200 bg-white p-5 sm:px-7">
          {isNew ? (
            <button
              type="button"
              onClick={onMarkReviewed}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#071A52] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#0A2463]"
            >
              <CheckCheck size={17} />
              Mark as reviewed
            </button>
          ) : (
            <button
              type="button"
              onClick={onMarkNew}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#071A52] transition hover:bg-slate-50"
            >
              <MessageSquareText size={17} />
              Mark as new
            </button>
          )}

          <p className="mt-3 text-center text-xs text-slate-400">
            Status changes are local mock data and reset on refresh.
          </p>
        </div>
      </section>
    </div>
  );
}
