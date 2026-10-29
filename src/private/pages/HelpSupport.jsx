import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Headphones,
  Inbox,
  Lightbulb,
  LifeBuoy,
  MessageCircle,
  MessageSquareText,
  Paperclip,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'scholanode:help-support:v1';

const CATEGORIES = [
  { value: 'TECHNICAL_SUPPORT', label: 'Technical problem' },
  { value: 'ACCOUNT_ACCESS', label: 'Login or account access' },
  { value: 'BILLING', label: 'Billing and payments' },
  { value: 'FEATURE_REQUEST', label: 'Feature request' },
  { value: 'SUGGESTION', label: 'Suggestion' },
  { value: 'GENERAL_FEEDBACK', label: 'General feedback' },
  { value: 'OTHER', label: 'Something else' },
];

const STATUS_CONFIG = {
  OPEN: {
    label: 'Open',
    className: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
  IN_PROGRESS: {
    label: 'In progress',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatDate(value) {
  if (!value) return '';

  return new Date(value).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return '';

  return new Date(value).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getCategoryLabel(value) {
  return CATEGORIES.find((item) => item.value === value)?.label || 'General enquiry';
}

function createDemoConversations() {
  const now = Date.now();

  return [
    {
      id: 'demo-101',
      reference: 'SN-2026-0101',
      subject: 'Unable to generate attendance report',
      category: 'TECHNICAL_SUPPORT',
      status: 'IN_PROGRESS',
      isDemo: true,
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 35).toISOString(),
      messages: [
        {
          id: 'demo-101-m1',
          sender: 'school',
          senderName: 'School administrator',
          text: 'We are having difficulty generating our class attendance report. The report does not appear after we select the term.',
          createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
        {
          id: 'demo-101-m2',
          sender: 'support',
          senderName: 'ScholaNode Support',
          text: 'Thank you for explaining the problem. Please include the affected class and term if you have not already done so. This will help the team investigate.',
          createdAt: new Date(now - 1000 * 60 * 60 * 24 * 1.8).toISOString(),
        },
        {
          id: 'demo-101-m3',
          sender: 'school',
          senderName: 'School administrator',
          text: 'It affects Primary 5A for the first term.',
          createdAt: new Date(now - 1000 * 60 * 35).toISOString(),
        },
      ],
    },
    {
      id: 'demo-102',
      reference: 'SN-2026-0102',
      subject: 'Suggestion for parent notifications',
      category: 'SUGGESTION',
      status: 'OPEN',
      isDemo: true,
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
      messages: [
        {
          id: 'demo-102-m1',
          sender: 'school',
          senderName: 'School administrator',
          text: 'We would appreciate more options for controlling which school updates parents receive.',
          createdAt: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
        },
      ],
    },
  ];
}

function readConversations() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored !== null) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : createDemoConversations();
    }
  } catch (error) {
    console.warn('Could not read Help & Support history.', error);
  }

  return createDemoConversations();
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.className}`}
    >
      {status === 'RESOLVED' ? (
        <CheckCircle2 size={13} />
      ) : status === 'IN_PROGRESS' ? (
        <Clock3 size={13} />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {config.label}
    </span>
  );
}

function CategoryIcon({ category, size = 20 }) {
  if (category === 'FEATURE_REQUEST' || category === 'SUGGESTION') {
    return <Lightbulb size={size} />;
  }

  if (category === 'GENERAL_FEEDBACK') {
    return <MessageSquareText size={size} />;
  }

  return <LifeBuoy size={size} />;
}

function EmptyState({ onStart }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
        <Inbox size={30} />
      </div>

      <h3 className="text-lg font-bold text-[#071A52]">
        No conversations yet
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Whenever you need help or want to share an idea, start a conversation
        here. You can return to it at any time.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#071A52] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#123A8F]"
      >
        <Plus size={17} />
        Start a conversation
      </button>
    </div>
  );
}

export default function HelpSupport() {
  const [conversations, setConversations] = useState(readConversations);
  const [view, setView] = useState('home');
  const [conversationType, setConversationType] = useState('problem');
  const [activeId, setActiveId] = useState(null);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('TECHNICAL_SUPPORT');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [formError, setFormError] = useState('');

  const [reply, setReply] = useState('');
  const [replyAttachment, setReplyAttachment] = useState('');
  const [notice, setNotice] = useState('');

  const replyInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.warn('Could not save Help & Support history.', error);
    }
  }, [conversations]);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeId) || null,
    [conversations, activeId]
  );

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...conversations]
      .filter((item) => filter === 'ALL' || item.status === filter)
      .filter((item) => {
        if (!query) return true;

        return [
          item.subject,
          item.reference,
          getCategoryLabel(item.category),
          ...item.messages.map((message) => message.text),
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [conversations, filter, search]);

  const openCount = conversations.filter(
    (item) => item.status === 'OPEN' || item.status === 'IN_PROGRESS'
  ).length;

  const resolvedCount = conversations.filter(
    (item) => item.status === 'RESOLVED'
  ).length;

  function resetForm() {
    setSubject('');
    setDescription('');
    setAttachmentName('');
    setFormError('');
    setNotice('');
  }

  function startConversation(type) {
    setConversationType(type);
    setCategory(type === 'feedback' ? 'SUGGESTION' : 'TECHNICAL_SUPPORT');
    resetForm();
    setView('new');
  }

  function goHome() {
    setView('home');
    setActiveId(null);
    setReply('');
    setReplyAttachment('');
    setNotice('');
    resetForm();
  }

  function openConversation(id) {
    setActiveId(id);
    setView('thread');
    setReply('');
    setReplyAttachment('');
    setNotice('');
  }

  function handleCreateConversation(event) {
    event.preventDefault();
    setFormError('');

    if (!subject.trim()) {
      setFormError('Please enter a short subject for your conversation.');
      return;
    }

    if (!description.trim()) {
      setFormError('Please describe how we can help.');
      return;
    }

    const now = new Date().toISOString();

    const conversation = {
      id: makeId(),
      reference: `SN-${new Date().getFullYear()}-${String(
        conversations.filter((item) => !item.isDemo).length + 1
      ).padStart(4, '0')}`,
      subject: subject.trim(),
      category,
      status: 'OPEN',
      isDemo: false,
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: makeId(),
          sender: 'school',
          senderName: 'Your school',
          text: description.trim(),
          attachmentName: attachmentName || '',
          createdAt: now,
        },
      ],
    };

    setConversations((previous) => [conversation, ...previous]);
    setActiveId(conversation.id);
    setReply('');
    setReplyAttachment('');
    setView('thread');
    setNotice(
      'Conversation created in this browser. Backend submission is not connected yet.'
    );
  }

  function handleSendReply(event) {
    event.preventDefault();

    if (!activeConversation || (!reply.trim() && !replyAttachment)) return;

    if (activeConversation.status === 'CLOSED') {
      setNotice(
        'This conversation is closed. Start a new conversation if you need help with another issue.'
      );
      return;
    }

    const now = new Date().toISOString();

    const message = {
      id: makeId(),
      sender: 'school',
      senderName: 'Your school',
      text: reply.trim(),
      attachmentName: replyAttachment || '',
      createdAt: now,
    };

    setConversations((previous) =>
      previous.map((item) =>
        item.id === activeConversation.id
          ? {
              ...item,
              status: item.status === 'RESOLVED' ? 'OPEN' : item.status,
              updatedAt: now,
              messages: [...item.messages, message],
            }
          : item
      )
    );

    setReply('');
    setReplyAttachment('');
    setNotice(
      'Your message has been saved locally. It has not been sent to ScholaNode Support.'
    );
  }

  function handleFileChange(event, target) {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (!allowedTypes.includes(file.type)) {
      setNotice('Please choose a PNG, JPG, WebP, or PDF file.');
      event.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      setNotice('Please choose a file smaller than 5 MB.');
      event.target.value = '';
      return;
    }

    if (target === 'new') {
      setAttachmentName(file.name);
    } else {
      setReplyAttachment(file.name);
    }

    setNotice('');
    event.target.value = '';
  }

  function removeAttachment(target) {
    if (target === 'new') {
      setAttachmentName('');
    } else {
      setReplyAttachment('');
    }
  }

  function startAnotherConversation() {
    setActiveId(null);
    startConversation('problem');
  }

  const pageTitle =
    view === 'new'
      ? conversationType === 'feedback'
        ? 'Share your feedback'
        : 'Get help with a problem'
      : view === 'thread'
        ? 'Conversation'
        : 'Help & Support';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-700">
              <Headphones size={17} />
              SCHOOL SUPPORT CENTRE
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-[#071A52] sm:text-3xl">
              {pageTitle}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              A friendly place to get assistance, ask questions, and share
              ideas with the ScholaNode team.
            </p>
          </div>

          {view !== 'home' && (
            <button
              type="button"
              onClick={goHome}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft size={17} />
              Back to Help & Support
            </button>
          )}
        </div>

        {/* Welcoming hero */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-r from-[#071A52] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-lg shadow-blue-950/10 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-10 -top-20 -z-10 h-64 w-64 rounded-full border-[35px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 -z-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 sm:text-sm">
                <Sparkles size={15} />
                You’re part of the ScholaNode community
              </div>

              <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.7rem]">
                Your school matters to us.
                <span className="mt-1 block text-cyan-300">
                  We’re always here to help.
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
                Running a school comes with enough responsibilities. If
                something isn’t working, you have a question, or there’s an
                idea that could make ScholaNode better, please reach out.
                We’re here to listen and help you move forward.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-cyan-300" />
                  Tell us what you need
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-cyan-300" />
                  Follow the conversation
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-cyan-300" />
                  Return whenever you need
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-sm sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-200">
                <MessageCircle size={25} />
              </div>

              <h3 className="text-lg font-bold">Let’s work through it together.</h3>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Send us the details, and our support team can review your
                message and follow up. You don’t need to solve everything
                on your own.
              </p>

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-black/10 p-3.5">
                <Clock3 size={18} className="mt-0.5 shrink-0 text-cyan-300" />
                <p className="text-xs leading-5 text-blue-100">
                  Support conversations are not live chat. Our team may need
                  time to investigate and respond.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOME */}
        {view === 'home' && (
          <>
            {/* Start choices */}
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#071A52] sm:text-xl">
                  How can we help you today?
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose the option that best describes what you want to share.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => startConversation('problem')}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md sm:p-6"
                >
                  <div className="flex w-full items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#123A8F] transition group-hover:bg-blue-100">
                      <LifeBuoy size={25} />
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      Get assistance
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#071A52]">
                    Get help with a problem
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Having trouble using ScholaNode? Need help with your
                    account, a technical issue, billing, or something you
                    don’t understand? Tell us about it.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#123A8F]">
                    Start a support conversation
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => startConversation('feedback')}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md sm:p-6"
                >
                  <div className="flex w-full items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-sky-700 transition group-hover:bg-cyan-100">
                      <Lightbulb size={25} />
                    </div>
                    <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
                      We’re listening
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#071A52]">
                    Share feedback or an idea
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Have a suggestion, a feature you would love to see, or an
                    idea that could make school management easier? We would
                    love to hear from you.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-700">
                    Share your thoughts
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </button>
              </div>
            </section>

            {/* Conversation history */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#123A8F]">
                      <MessageSquareText size={21} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#071A52]">
                        My conversations
                      </h2>
                      <p className="mt-0.5 text-sm text-slate-500">
                        Keep track of your questions and discussions.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startAnotherConversation}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123A8F]"
                >
                  <Plus size={17} />
                  New conversation
                </button>
              </div>

              <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-3 sm:p-5">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total conversations
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-[#071A52]">
                    {conversations.length}
                  </p>
                </div>

                <div className="rounded-xl bg-sky-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                    Awaiting resolution
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-sky-800">
                    {openCount}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Resolved
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-emerald-800">
                    {resolvedCount}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search conversations..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="ALL">All statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              {filteredConversations.length === 0 ? (
                <EmptyState onStart={startAnotherConversation} />
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredConversations.map((conversation) => {
                    const lastMessage =
                      conversation.messages[conversation.messages.length - 1];

                    return (
                      <button
                        type="button"
                        key={conversation.id}
                        onClick={() => openConversation(conversation.id)}
                        className="group flex w-full items-start gap-3 p-4 text-left transition hover:bg-slate-50 sm:items-center sm:gap-4 sm:p-5"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#123A8F]">
                          <CategoryIcon category={conversation.category} size={21} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-[#071A52] group-hover:text-sky-700">
                              {conversation.subject}
                            </h3>

                            {conversation.isDemo && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                Sample
                              </span>
                            )}
                          </div>

                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                            {lastMessage?.text || 'No message content'}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                            <span>{conversation.reference}</span>
                            <span>{getCategoryLabel(conversation.category)}</span>
                            <span>{formatDate(conversation.updatedAt)}</span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-3">
                          <StatusBadge status={conversation.status} />
                          <ChevronRight
                            size={19}
                            className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-sky-600"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3">
                <p className="text-xs leading-5 text-slate-500">
                  Sample conversations are provided for demonstration. Real
                  conversations will be connected to ScholaNode Support when
                  the backend is implemented.
                </p>
              </div>
            </section>
          </>
        )}

        {/* NEW CONVERSATION FORM */}
        {view === 'new' && (
          <section className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/70 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#123A8F]">
                  {conversationType === 'feedback' ? (
                    <Lightbulb size={23} />
                  ) : (
                    <LifeBuoy size={23} />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#071A52]">
                    {conversationType === 'feedback'
                      ? 'We would love to hear your ideas'
                      : 'Tell us what you need help with'}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {conversationType === 'feedback'
                      ? 'Your experience and suggestions help us understand how to make ScholaNode more useful for schools.'
                      : 'Give us a little information so the support team can understand the situation and investigate.'}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateConversation} className="space-y-5 p-5 sm:p-7">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  What is this about?
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  required
                >
                  {CATEGORIES.filter((item) =>
                    conversationType === 'feedback'
                      ? [
                          'FEATURE_REQUEST',
                          'SUGGESTION',
                          'GENERAL_FEEDBACK',
                          'OTHER',
                        ].includes(item.value)
                      : ![
                          'FEATURE_REQUEST',
                          'SUGGESTION',
                          'GENERAL_FEEDBACK',
                        ].includes(item.value)
                  ).map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subject
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder={
                    conversationType === 'feedback'
                      ? 'e.g. An idea to improve parent communication'
                      : 'e.g. I cannot access my attendance report'
                  }
                  maxLength={120}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
                <p className="mt-1.5 text-right text-xs text-slate-400">
                  {subject.length}/120
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {conversationType === 'feedback'
                    ? 'Tell us more about your idea'
                    : 'Describe the problem'}
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={
                    conversationType === 'feedback'
                      ? 'What would you like to see improved? How would it help your school?'
                      : 'What happened? What were you trying to do? Include any helpful details.'
                  }
                  rows={6}
                  maxLength={5000}
                  required
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />

                <p className="mt-1.5 text-right text-xs text-slate-400">
                  {description.length}/5000
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Attachment <span className="font-normal text-slate-400">(optional)</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.pdf"
                  onChange={(event) => handleFileChange(event, 'new')}
                  className="hidden"
                />

                {attachmentName ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 p-3">
                    <div className="flex min-w-0 items-center gap-2 text-sm text-sky-800">
                      <FileText size={18} className="shrink-0" />
                      <span className="truncate">{attachmentName}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment('new')}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-rose-600"
                      aria-label="Remove attachment"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700"
                  >
                    <Paperclip size={17} />
                    Attach a screenshot or document
                  </button>
                )}

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  PNG, JPG, WebP or PDF, up to 5 MB. In this demo, only the
                  attachment name is saved; the file is not uploaded.
                </p>
              </div>

              <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3.5">
                <ShieldCheck size={19} className="mt-0.5 shrink-0 text-amber-700" />
                <p className="text-xs leading-5 text-amber-900">
                  For your security, do not include passwords, payment card
                  details, or unnecessary sensitive student information.
                </p>
              </div>

              {formError && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {formError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={goHome}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123A8F]"
                >
                  <MessageCircle size={17} />
                  Create conversation
                </button>
              </div>
            </form>
          </section>
        )}

        {/* CHAT THREAD */}
        {view === 'thread' && activeConversation && (
          <section className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#123A8F]">
                    <CategoryIcon category={activeConversation.category} size={22} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-[#071A52]">
                        {activeConversation.subject}
                      </h2>

                      {activeConversation.isDemo && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Sample
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {activeConversation.reference} ·{' '}
                      {getCategoryLabel(activeConversation.category)}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Started {formatDate(activeConversation.createdAt)}
                    </p>
                  </div>
                </div>

                <StatusBadge status={activeConversation.status} />
              </div>
            </div>

            {activeConversation.isDemo && (
              <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 sm:px-6">
                <p className="text-xs leading-5 text-amber-800">
                  This is a demonstration conversation. The messages shown are
                  sample content, not a real exchange with ScholaNode Support.
                </p>
              </div>
            )}

            {notice && (
              <div className="border-b border-sky-100 bg-sky-50 px-5 py-3 sm:px-6">
                <p className="text-sm leading-5 text-sky-800">{notice}</p>
              </div>
            )}

            <div className="space-y-5 bg-slate-50/70 p-4 sm:p-6">
              <div className="flex justify-center">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-400">
                  Conversation started {formatDate(activeConversation.createdAt)}
                </span>
              </div>

              {activeConversation.messages.map((message) => {
                const isSchool = message.sender === 'school';

                return (
                  <div
                    key={message.id}
                    className={`flex ${isSchool ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] sm:max-w-[78%] ${
                        isSchool ? 'items-end' : 'items-start'
                      } flex flex-col`}
                    >
                      <div className="mb-1.5 flex items-center gap-2 px-1">
                        {!isSchool && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#071A52] text-white">
                            <Headphones size={13} />
                          </div>
                        )}

                        <span className="text-xs font-semibold text-slate-600">
                          {message.senderName}
                        </span>

                        {isSchool && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            Your school
                          </span>
                        )}
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isSchool
                            ? 'rounded-tr-md bg-[#071A52] text-white'
                            : 'rounded-tl-md border border-slate-200 bg-white text-slate-700 shadow-sm'
                        }`}
                      >
                        {message.text && (
                          <p className="whitespace-pre-wrap text-sm leading-6">
                            {message.text}
                          </p>
                        )}

                        {message.attachmentName && (
                          <div
                            className={`mt-3 flex items-center gap-2 rounded-xl p-2.5 text-xs ${
                              isSchool ? 'bg-white/10' : 'bg-slate-50'
                            }`}
                          >
                            <FileText size={17} />
                            <span className="break-all">
                              {message.attachmentName}
                            </span>
                          </div>
                        )}
                      </div>

                      <span className="mt-1.5 px-1 text-[11px] text-slate-400">
                        {formatDateTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {activeConversation.status === 'CLOSED' ? (
              <div className="border-t border-slate-100 p-5 sm:p-6">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-slate-500" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">
                      This conversation is closed
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      If you have a different issue, start a new conversation.
                    </p>
                    <button
                      type="button"
                      onClick={startAnotherConversation}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#123A8F] hover:text-sky-700"
                    >
                      <Plus size={16} />
                      Start a new conversation
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSendReply}
                className="border-t border-slate-100 bg-white p-4 sm:p-6"
              >
                {activeConversation.status === 'RESOLVED' && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <p className="leading-5">
                      This conversation is marked resolved. Sending another
                      message will reopen it in this demo.
                    </p>
                  </div>
                )}

                <label
                  htmlFor="support-reply"
                  className="mb-2 block text-sm font-bold text-[#071A52]"
                >
                  Add to this conversation
                </label>

                <textarea
                  id="support-reply"
                  ref={replyInputRef}
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={4}
                  maxLength={5000}
                  placeholder="Write your message here..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.pdf"
                  onChange={(event) => handleFileChange(event, 'reply')}
                  className="hidden"
                />

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-sky-700"
                    >
                      <Paperclip size={17} />
                      Attach file
                    </button>

                    {replyAttachment && (
                      <span className="inline-flex max-w-full items-center gap-2 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs text-sky-800">
                        <span className="max-w-40 truncate">{replyAttachment}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment('reply')}
                          aria-label="Remove attachment"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!reply.trim() && !replyAttachment}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={16} />
                    Send message
                  </button>
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Demo mode: messages are saved in this browser only. They
                  are not delivered to the ScholaNode team.
                </p>
              </form>
            )}
          </section>
        )}

        {/* Helpful footer */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-sky-700">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#071A52]">
                A little more information helps us help you
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Describe what happened, what you expected, and any steps
                that led to the problem. Screenshots can also be useful.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600" />
            Please keep your account details private.
          </div>
        </div>
      </div>
    </main>
  );
}