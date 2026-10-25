import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileImage,
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
  X,
} from 'lucide-react';

const STORAGE_KEY = 'scholanode:help-support:v2';
const MAX_IMAGE_SIZE = 1024 * 1024; // 1 MB for the local demo

const CATEGORIES = [
  { value: 'TECHNICAL_SUPPORT', label: 'Technical problem' },
  { value: 'ACCOUNT_ACCESS', label: 'Login or account access' },
  { value: 'BILLING', label: 'Billing and payments' },
  { value: 'FEATURE_REQUEST', label: 'Feature request' },
  { value: 'SUGGESTION', label: 'Suggestion' },
  { value: 'GENERAL_FEEDBACK', label: 'General feedback' },
  { value: 'OTHER', label: 'Something else' },
];

const FILTERS = [
  ['ALL', 'All'],
  ['OPEN', 'Open'],
  ['IN_PROGRESS', 'In progress'],
  ['RESOLVED', 'Resolved'],
  ['CLOSED', 'Closed'],
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

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getCategoryLabel(value) {
  return (
    CATEGORIES.find((item) => item.value === value)?.label ||
    'General enquiry'
  );
}

function isFeedbackCategory(category) {
  return [
    'FEATURE_REQUEST',
    'SUGGESTION',
    'GENERAL_FEEDBACK',
  ].includes(category);
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
      createdAt: new Date(
        now - 1000 * 60 * 60 * 24 * 2
      ).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 35).toISOString(),
      messages: [
        {
          id: 'demo-101-m1',
          sender: 'school',
          senderName: 'School administrator',
          text:
            'We are having difficulty generating our class attendance report. The report does not appear after we select the term.',
          createdAt: new Date(
            now - 1000 * 60 * 60 * 24 * 2
          ).toISOString(),
        },
        {
          id: 'demo-101-m2',
          sender: 'support',
          senderName: 'ScholaNode Support',
          text:
            'Thank you for explaining the problem. Please include the affected class and term if you have not already done so. This will help the team investigate.',
          createdAt: new Date(
            now - 1000 * 60 * 60 * 24 * 1.8
          ).toISOString(),
        },
        {
          id: 'demo-101-m3',
          sender: 'school',
          senderName: 'School administrator',
          text: 'It affects Primary 5A for the first term.',
          createdAt: new Date(
            now - 1000 * 60 * 35
          ).toISOString(),
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
      createdAt: new Date(
        now - 1000 * 60 * 60 * 24 * 5
      ).toISOString(),
      updatedAt: new Date(
        now - 1000 * 60 * 60 * 24 * 5
      ).toISOString(),
      messages: [
        {
          id: 'demo-102-m1',
          sender: 'school',
          senderName: 'School administrator',
          text:
            'We would appreciate more options for controlling which school updates parents receive.',
          createdAt: new Date(
            now - 1000 * 60 * 60 * 24 * 5
          ).toISOString(),
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

      return Array.isArray(parsed)
        ? parsed
        : createDemoConversations();
    }
  } catch (error) {
    console.warn(
      'Could not read Help & Support history.',
      error
    );
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
  if (
    category === 'FEATURE_REQUEST' ||
    category === 'SUGGESTION'
  ) {
    return <Lightbulb size={size} />;
  }

  if (category === 'GENERAL_FEEDBACK') {
    return <MessageSquareText size={size} />;
  }

  return <LifeBuoy size={size} />;
}

function EmptyState({ onStart, filtered = false }) {
  return (
    <div className="flex flex-col items-center px-5 py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
        <Inbox size={26} />
      </div>

      <h3 className="font-bold text-[#071A52]">
        {filtered
          ? 'No matching conversations'
          : 'No conversations yet'}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
        {filtered
          ? 'Try another search or choose a different status filter.'
          : 'Start a conversation whenever you need help or want to share an idea.'}
      </p>

      {!filtered && (
        <button
          type="button"
          onClick={onStart}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123A8F]"
        >
          <Plus size={16} />
          Start a conversation
        </button>
      )}
    </div>
  );
}

function ImagePreview({
  attachment,
  onRemove,
  compact = false,
}) {
  if (!attachment) return null;

  return (
    <div
      className={`relative inline-flex max-w-full items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 p-2.5 ${
        compact ? 'mt-2' : 'mt-3'
      }`}
    >
      {attachment.dataUrl ? (
        <img
          src={attachment.dataUrl}
          alt={`Preview of ${attachment.name}`}
          className="h-16 w-20 rounded-lg border border-slate-200 bg-white object-cover"
        />
      ) : (
        <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-white text-sky-700">
          <FileImage size={23} />
        </div>
      )}

      <div className="min-w-0 pt-1">
        <p className="max-w-52 break-all text-xs font-semibold text-slate-700">
          {attachment.name}
        </p>

        <p className="mt-1 text-[11px] text-slate-500">
          Screenshot attached
        </p>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove screenshot"
          className="rounded-lg p-1 text-slate-500 transition hover:bg-white hover:text-rose-600"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export default function HelpSupport() {
  const [conversations, setConversations] =
    useState(readConversations);

  // Views: home, new, list, thread
  const [view, setView] = useState('home');

  const [conversationType, setConversationType] =
    useState('problem');

  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const [subject, setSubject] = useState('');
  const [category, setCategory] =
    useState('TECHNICAL_SUPPORT');
  const [description, setDescription] = useState('');
  const [newAttachment, setNewAttachment] = useState(null);

  const [reply, setReply] = useState('');
  const [replyAttachment, setReplyAttachment] =
    useState(null);

  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const newFileInputRef = useRef(null);
  const replyFileInputRef = useRef(null);

  // Persist demo data in the current browser.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(conversations)
      );
    } catch (error) {
      console.warn(
        'Could not save Help & Support history. Browser storage may be full.',
        error
      );

      setNotice(
        'Browser storage is full. Try removing screenshots or resetting the demo data.'
      );
    }
  }, [conversations]);

  const activeConversation = useMemo(
    () =>
      conversations.find((item) => item.id === activeId) ||
      null,
    [conversations, activeId]
  );

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...conversations]
      .filter(
        (item) =>
          filter === 'ALL' || item.status === filter
      )
      .filter((item) => {
        if (!query) return true;

        const messageText = (item.messages || [])
          .map((message) => message.text || '')
          .join(' ');

        return [
          item.subject,
          item.reference,
          getCategoryLabel(item.category),
          messageText,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      );
  }, [conversations, filter, search]);

  const activeCount = conversations.filter((item) =>
    ['OPEN', 'IN_PROGRESS'].includes(item.status)
  ).length;

  const resolvedCount = conversations.filter((item) =>
    ['RESOLVED', 'CLOSED'].includes(item.status)
  ).length;

  const totalMessages = conversations.reduce(
    (total, item) =>
      total + (item.messages?.length || 0),
    0
  );

  function resetForm() {
    setSubject('');
    setDescription('');
    setNewAttachment(null);
    setFormError('');
  }

  function startConversation(type = 'problem') {
    setConversationType(type);

    setCategory(
      type === 'feedback'
        ? 'SUGGESTION'
        : 'TECHNICAL_SUPPORT'
    );

    resetForm();
    setNotice('');
    setView('new');
  }

  function openConversationList() {
    setSearch('');
    setFilter('ALL');
    setNotice('');
    setView('list');
  }

  function goHome() {
    setView('home');
    setActiveId(null);
    setReply('');
    setReplyAttachment(null);
    setNotice('');
    resetForm();
  }

  function goToConversationList() {
    setView('list');
    setReply('');
    setReplyAttachment(null);
    setFormError('');
    setNotice('');
  }

  function openConversation(id) {
    setActiveId(id);
    setView('thread');
    setReply('');
    setReplyAttachment(null);
    setFormError('');
    setNotice('');
  }

  function handleImageChange(event, target) {
    const file = event.target.files?.[0];

    // Allow selecting the same file again after removing it.
    event.target.value = '';

    if (!file) return;

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setFormError(
        'Please attach a PNG, JPG, or WebP image.'
      );
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFormError(
        'The screenshot must be 1 MB or smaller in this demo.'
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setFormError(
          'We could not read that image. Please try again.'
        );
        return;
      }

      const attachment = {
        id: makeId(),
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result,
      };

      if (target === 'new') {
        setNewAttachment(attachment);
      } else {
        setReplyAttachment(attachment);
      }

      setFormError('');
      setNotice('');
    };

    reader.onerror = () => {
      setFormError(
        'We could not read that image. Please try another file.'
      );
    };

    reader.readAsDataURL(file);
  }

  function handleCreateConversation(event) {
    event.preventDefault();
    setFormError('');
    setNotice('');

    if (!subject.trim()) {
      setFormError(
        'Please enter a short subject for your conversation.'
      );
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      setFormError(
        'Please provide a little more detail in your message.'
      );
      return;
    }

    const now = new Date().toISOString();

    const firstMessage = {
      id: makeId(),
      sender: 'school',
      senderName: 'Your school',
      text: description.trim(),
      attachment: newAttachment,
      createdAt: now,
    };

    const conversation = {
      id: makeId(),
      reference: `SN-DEMO-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      subject: subject.trim(),
      category,
      status: 'OPEN',
      isDemo: false,
      createdAt: now,
      updatedAt: now,
      messages: [firstMessage],
    };

    setConversations((current) => [
      conversation,
      ...current,
    ]);

    setActiveId(conversation.id);
    setView('thread');

    setSubject('');
    setDescription('');
    setNewAttachment(null);
    setFormError('');

    setNotice(
      'Demo conversation created locally. The ScholaNode support team has not received it.'
    );
  }

  function handleSendReply(event) {
    event.preventDefault();

    if (
      (!reply.trim() && !replyAttachment) ||
      !activeConversation
    ) {
      return;
    }

    setFormError('');

    const now = new Date().toISOString();

    const message = {
      id: makeId(),
      sender: 'school',
      senderName: 'Your school',
      text: reply.trim(),
      attachment: replyAttachment,
      createdAt: now,
    };

    setConversations((current) =>
      current.map((item) =>
        item.id === activeConversation.id
          ? {
              ...item,
              messages: [...item.messages, message],
              updatedAt: now,
              status:
                item.status === 'CLOSED' ||
                item.status === 'RESOLVED'
                  ? 'OPEN'
                  : item.status,
            }
          : item
      )
    );

    setReply('');
    setReplyAttachment(null);

    setNotice(
      'Your reply was added to this browser demo. Nothing was sent to the support team.'
    );
  }

  function resetDemo() {
    const confirmed = window.confirm(
      'Reset Help & Support to the original sample conversations? Your locally created conversations, replies, and attachments will be lost.'
    );

    if (!confirmed) return;

    setConversations(createDemoConversations());
    setView('home');
    setActiveId(null);
    setSearch('');
    setFilter('ALL');
    setReply('');
    setReplyAttachment(null);
    resetForm();

    setNotice(
      'The sample conversations have been restored.'
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* PAGE HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
              <LifeBuoy size={16} />
              School assistance
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-[#071A52] sm:text-3xl">
              Help &amp; Support
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Need assistance with ScholaNode, or have an idea
              to share? Start a conversation and keep your
              questions, replies, and supporting screenshots
              together in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Local demo mode
            </span>

            <button
              type="button"
              onClick={resetDemo}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              title="Reset the local demo data"
            >
              <X size={14} />
              Reset demo
            </button>
          </div>
        </header>

        {/* DETAILED HERO - PRESERVED */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-r from-[#071A52] via-[#0A2463] to-[#123A8F] px-6 py-8 text-white shadow-xl shadow-blue-950/10 sm:px-9 sm:py-10 lg:px-11 lg:py-12">
          <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-80 w-80 rounded-full border-[42px] border-white/[0.04]" />
          <div className="pointer-events-none absolute -bottom-32 right-1/4 -z-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute left-1/3 top-0 -z-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative grid gap-9 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3.5 py-2 text-xs font-semibold text-cyan-100">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-300/15">
                  <MessageCircle size={13} />
                </span>
                Your school matters to us
              </div>

              <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.65rem]">
                We&apos;re here to help your school move forward.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/90 sm:text-base sm:leading-8">
                Every school deserves a smooth experience with
                ScholaNode. Whether you have encountered a
                technical problem, need help with your account
                or billing, or have an idea that could make
                school management easier, this is the place to
                reach out.
              </p>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/80">
                Start a conversation, explain what you need,
                and return to the same thread whenever you
                have more details to share. You can also attach
                screenshots to help explain a problem more
                clearly.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      School-specific conversations
                    </p>
                    <p className="mt-1 text-xs leading-5 text-blue-100/70">
                      Keep your support discussions organised
                      instead of losing them across messages.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                    <MessageSquareText size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      Follow up in one thread
                    </p>
                    <p className="mt-1 text-xs leading-5 text-blue-100/70">
                      Add clarifications, replies, and screenshots
                      to the same conversation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex lg:justify-center">
              <div className="relative flex h-64 w-64 items-center justify-center rounded-[2rem] border border-white/15 bg-white/[0.07] shadow-inner">
                <div className="absolute inset-4 rounded-[1.5rem] border border-white/10" />

                <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] bg-gradient-to-br from-cyan-300/20 to-blue-300/10 text-cyan-100 shadow-lg shadow-blue-950/20">
                  <Headphones size={72} strokeWidth={1.25} />
                </div>

                <div className="absolute -right-3 top-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-[#123A8F] text-cyan-100 shadow-lg">
                  <LifeBuoy size={23} />
                </div>

                <div className="absolute -bottom-3 -left-3 flex items-center gap-2 rounded-xl border border-white/15 bg-[#0A2463] px-3 py-2.5 shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <span className="text-xs font-semibold text-white">
                    Here to support you
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-xs text-blue-100/80">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={15} className="text-cyan-300" />
              Report a problem
            </span>

            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={15} className="text-cyan-300" />
              Share an idea
            </span>

            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={15} className="text-cyan-300" />
              Keep the conversation history
            </span>
          </div>
        </section>

        {/* GLOBAL NOTICE */}
        {notice && (
          <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-sky-700"
            />

            <p className="flex-1 leading-6">{notice}</p>

            <button
              type="button"
              onClick={() => setNotice('')}
              aria-label="Dismiss notification"
              className="rounded-md p-0.5 hover:bg-sky-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* HOME: ONLY TWO MAIN ACTIONS */}
        {view === 'home' && (
          <>
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#071A52]">
                  How can we help?
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Start a new conversation or return to a previous
                  discussion. Your conversation history is available
                  whenever you need it.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {/* NEW CONVERSATION */}
                <button
                  type="button"
                  onClick={() => startConversation('problem')}
                  className="group flex min-h-60 flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md sm:p-6"
                >
                  <div className="flex w-full items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0A2463] transition group-hover:bg-sky-50 group-hover:text-sky-700">
                      <Plus size={25} />
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Start here
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#071A52]">
                    New conversation
                  </h3>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    Need technical assistance, help with account access
                    or billing, or want to share feedback? Start a new
                    discussion and explain what you need.
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-xs font-medium text-slate-400">
                      Help · Suggestions · Feedback
                    </span>

                    <span className="flex shrink-0 items-center gap-2 text-sm font-bold text-[#0A2463] transition group-hover:text-sky-700">
                      Get started
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </button>

                {/* MY CONVERSATIONS */}
                <button
                  type="button"
                  onClick={openConversationList}
                  className="group flex min-h-60 flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md sm:p-6"
                >
                  <div className="flex w-full items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 transition group-hover:bg-cyan-100">
                      <Inbox size={25} />
                    </div>

                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                      {conversations.length}{' '}
                      {conversations.length === 1
                        ? 'conversation'
                        : 'conversations'}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#071A52]">
                    My conversations
                  </h3>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    View your previous discussions, check their status,
                    read messages, attach screenshots to replies, or
                    continue a conversation.
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-xs font-medium text-slate-400">
                      {activeCount} awaiting resolution
                    </span>

                    <span className="flex shrink-0 items-center gap-2 text-sm font-bold text-[#0A2463] transition group-hover:text-cyan-700">
                      View history
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </button>
              </div>
            </section>

            {/* SMALL SUMMARY - NO CONVERSATION LIST */}
            <section className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                  <MessageSquareText size={19} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Total conversations
                  </p>
                  <p className="mt-0.5 text-xl font-extrabold text-[#071A52]">
                    {conversations.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Clock3 size={19} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Active conversations
                  </p>
                  <p className="mt-0.5 text-xl font-extrabold text-[#071A52]">
                    {activeCount}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 size={19} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Resolved or closed
                  </p>
                  <p className="mt-0.5 text-xl font-extrabold text-[#071A52]">
                    {resolvedCount}
                  </p>
                </div>
              </div>
            </section>

            <p className="flex items-center gap-2 text-xs leading-5 text-slate-400">
              <ShieldCheck size={14} />
              Your school&apos;s conversations are organised in one
              place. This preview stores demo data in your browser.
            </p>
          </>
        )}

        {/* MY CONVERSATIONS: SEPARATE VIEW */}
        {view === 'list' && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* LIST HEADER */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={goHome}
                  aria-label="Back to Help & Support home"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-extrabold text-[#071A52]">
                      My conversations
                    </h2>

                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                      {conversations.length} total
                    </span>
                  </div>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Review previous discussions, check their status,
                    or open a conversation to continue the discussion.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search subject, reference, or message..."
                    aria-label="Search conversations"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => startConversation('problem')}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123A8F]"
                >
                  <Plus size={17} />
                  New conversation
                </button>
              </div>
            </div>

            {/* STATUS FILTERS */}
            <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-5 pt-3 sm:px-6">
              {FILTERS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`shrink-0 border-b-2 px-3 pb-3 text-sm font-semibold transition ${
                    filter === value
                      ? 'border-sky-500 text-[#071A52]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {label}

                  {value === 'ALL' && (
                    <span className="ml-1.5 text-xs text-slate-400">
                      {conversations.length}
                    </span>
                  )}

                  {value === 'OPEN' && (
                    <span className="ml-1.5 text-xs text-slate-400">
                      {
                        conversations.filter(
                          (item) => item.status === 'OPEN'
                        ).length
                      }
                    </span>
                  )}

                  {value === 'IN_PROGRESS' && (
                    <span className="ml-1.5 text-xs text-slate-400">
                      {
                        conversations.filter(
                          (item) =>
                            item.status === 'IN_PROGRESS'
                        ).length
                      }
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* CONVERSATION ITEMS */}
            {filteredConversations.length === 0 ? (
              <EmptyState
                filtered={
                  Boolean(search.trim()) || filter !== 'ALL'
                }
                onStart={() => startConversation('problem')}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredConversations.map((conversation) => {
                  const messages = conversation.messages || [];

                  const lastMessage =
                    messages[messages.length - 1];

                  const hasAttachment = messages.some(
                    (message) => message.attachment
                  );

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() =>
                        openConversation(conversation.id)
                      }
                      className="group flex w-full items-start gap-3.5 px-5 py-5 text-left transition hover:bg-slate-50 sm:px-6"
                    >
                      <div
                        className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          isFeedbackCategory(conversation.category)
                            ? 'bg-cyan-50 text-cyan-700'
                            : 'bg-blue-50 text-blue-800'
                        }`}
                      >
                        <CategoryIcon
                          category={conversation.category}
                          size={20}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-sm font-bold text-[#071A52] transition group-hover:text-blue-700">
                            {conversation.subject}
                          </h3>

                          {conversation.isDemo && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                              Sample
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          {conversation.reference} ·{' '}
                          {getCategoryLabel(conversation.category)}
                        </p>

                        <p className="mt-2 line-clamp-2 break-words text-sm leading-5 text-slate-500">
                          {lastMessage?.text ||
                            (lastMessage?.attachment
                              ? 'Screenshot attached'
                              : 'No message content')}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <StatusBadge
                            status={conversation.status}
                          />

                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <MessageCircle size={13} />

                            {messages.length}{' '}
                            {messages.length === 1
                              ? 'message'
                              : 'messages'}
                          </span>

                          {hasAttachment && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Paperclip size={12} />
                              Attachment
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
                        <span className="text-xs text-slate-400">
                          {formatDate(conversation.updatedAt)}
                        </span>

                        <ChevronRight
                          size={18}
                          className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-700"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* LIST FOOTER */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-400 sm:px-6">
              <span>
                Showing {filteredConversations.length} of{' '}
                {conversations.length} conversations
              </span>

              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} />
                School-specific conversation history
              </span>
            </div>
          </section>
        )}

        {/* NEW CONVERSATION FORM */}
        {view === 'new' && (
          <section className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={goHome}
                aria-label="Back to Help & Support"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                  {conversationType === 'problem'
                    ? 'Get assistance'
                    : 'Share your ideas'}
                </p>

                <h2 className="mt-0.5 text-lg font-bold text-[#071A52]">
                  {conversationType === 'problem'
                    ? 'Tell us what you need help with'
                    : 'Share feedback or a suggestion'}
                </h2>
              </div>
            </div>

            {/* CONVERSATION TYPE */}
            <div className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-2 sm:p-6">
              <button
                type="button"
                onClick={() => {
                  setConversationType('problem');
                  setCategory('TECHNICAL_SUPPORT');
                  setFormError('');
                }}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                  conversationType === 'problem'
                    ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100'
                    : 'border-slate-200 bg-white hover:border-blue-200'
                }`}
              >
                <LifeBuoy
                  size={21}
                  className="mt-0.5 shrink-0 text-blue-800"
                />

                <div>
                  <p className="text-sm font-bold text-[#071A52]">
                    Get help
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Technical problems, account access, or billing.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConversationType('feedback');
                  setCategory('SUGGESTION');
                  setFormError('');
                }}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                  conversationType === 'feedback'
                    ? 'border-cyan-300 bg-cyan-50 ring-2 ring-cyan-100'
                    : 'border-slate-200 bg-white hover:border-cyan-200'
                }`}
              >
                <Lightbulb
                  size={21}
                  className="mt-0.5 shrink-0 text-cyan-700"
                />

                <div>
                  <p className="text-sm font-bold text-[#071A52]">
                    Share feedback
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Ideas, suggestions, and feature requests.
                  </p>
                </div>
              </button>
            </div>

            <form
              onSubmit={handleCreateConversation}
              className="space-y-5 p-5 sm:p-7"
            >
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="flex gap-3">
                  {conversationType === 'problem' ? (
                    <LifeBuoy
                      size={20}
                      className="mt-0.5 shrink-0 text-blue-800"
                    />
                  ) : (
                    <Lightbulb
                      size={20}
                      className="mt-0.5 shrink-0 text-blue-800"
                    />
                  )}

                  <p className="text-sm leading-6 text-blue-900">
                    {conversationType === 'problem'
                      ? 'Describe the issue clearly. Include what you were trying to do, what happened instead, and which part of ScholaNode was affected. You can attach a screenshot if it helps explain the problem.'
                      : 'Tell us about your idea, the problem it would solve for your school, or how an existing feature could be improved. You can include a screenshot to help illustrate your suggestion.'}
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="support-category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category <span className="text-rose-500">*</span>
                </label>

                <select
                  id="support-category"
                  required
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  {(conversationType === 'problem'
                    ? CATEGORIES.filter((item) =>
                        [
                          'TECHNICAL_SUPPORT',
                          'ACCOUNT_ACCESS',
                          'BILLING',
                          'OTHER',
                        ].includes(item.value)
                      )
                    : CATEGORIES.filter((item) =>
                        [
                          'FEATURE_REQUEST',
                          'SUGGESTION',
                          'GENERAL_FEEDBACK',
                          'OTHER',
                        ].includes(item.value)
                      )
                  ).map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="support-subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject <span className="text-rose-500">*</span>
                </label>

                <input
                  id="support-subject"
                  required
                  maxLength={120}
                  value={subject}
                  onChange={(event) =>
                    setSubject(event.target.value)
                  }
                  placeholder={
                    conversationType === 'problem'
                      ? 'e.g. Unable to open attendance register'
                      : 'e.g. Suggestion for the class timetable'
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {subject.length}/120
                </p>
              </div>

              <div>
                <label
                  htmlFor="support-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  {conversationType === 'problem'
                    ? 'Describe the problem'
                    : 'Your message'}{' '}
                  <span className="text-rose-500">*</span>
                </label>

                <textarea
                  id="support-description"
                  required
                  minLength={5}
                  maxLength={5000}
                  rows={6}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder={
                    conversationType === 'problem'
                      ? 'What happened? Which part of ScholaNode were you using? What did you expect to happen?'
                      : 'Describe your idea, suggestion, or feedback...'
                  }
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {description.length}/5000
                </p>
              </div>

              {/* OPTIONAL SCREENSHOT */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Screenshot{' '}
                  <span className="font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <input
                  ref={newFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) =>
                    handleImageChange(event, 'new')
                  }
                  className="hidden"
                />

                {newAttachment ? (
                  <ImagePreview
                    attachment={newAttachment}
                    onRemove={() => setNewAttachment(null)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      newFileInputRef.current?.click()
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3.5 py-3 text-sm font-medium text-slate-600 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700"
                  >
                    <Paperclip size={16} />
                    Add a screenshot
                  </button>
                )}

                <p className="mt-1.5 text-xs leading-5 text-slate-400">
                  PNG, JPG, or WebP. Maximum 1 MB in this browser
                  demo.
                </p>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                Avoid including passwords, payment-card details,
                or unnecessary sensitive student information.
              </div>

              {formError && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                  {formError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={goHome}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123A8F]"
                >
                  Create conversation
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </section>
        )}

        {/* CONVERSATION THREAD */}
        {view === 'thread' && activeConversation && (
          <section className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* THREAD HEADER */}
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
              <div className="flex min-w-0 items-start gap-3">
                <button
                  type="button"
                  onClick={goToConversationList}
                  aria-label="Back to conversations"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#123A8F]">
                  <CategoryIcon
                    category={activeConversation.category}
                    size={20}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words font-bold text-[#071A52]">
                      {activeConversation.subject}
                    </h2>

                    {activeConversation.isDemo && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        Sample
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {activeConversation.reference} ·{' '}
                    {getCategoryLabel(activeConversation.category)} ·
                    Started{' '}
                    {formatDate(activeConversation.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pl-12 sm:pl-0">
                <StatusBadge status={activeConversation.status} />

                <button
                  type="button"
                  onClick={goToConversationList}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Inbox size={16} />
                  All conversations
                </button>
              </div>
            </div>

            {activeConversation.isDemo && (
              <div className="border-b border-amber-100 bg-amber-50 px-4 py-2.5 text-xs leading-5 text-amber-800">
                Sample conversation — these messages are examples,
                not a real exchange with ScholaNode Support.
              </div>
            )}

            {notice && (
              <div className="flex items-start gap-2 border-b border-sky-100 bg-sky-50 px-4 py-2.5 text-xs leading-5 text-sky-800">
                <CheckCircle2
                  size={15}
                  className="mt-0.5 shrink-0"
                />
                <p>{notice}</p>
              </div>
            )}

            {/* MESSAGE HISTORY */}
            <div className="space-y-5 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex justify-center">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-400">
                  Conversation started{' '}
                  {formatDate(activeConversation.createdAt)}
                </span>
              </div>

              {(activeConversation.messages || []).map((message) => {
                const isSchool = message.sender === 'school';
                const attachment = message.attachment || null;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isSchool ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex max-w-[92%] flex-col sm:max-w-[78%] ${
                        isSchool ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="mb-1.5 flex items-center gap-2 px-1">
                        {!isSchool && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#071A52] text-white">
                            <Headphones size={13} />
                          </div>
                        )}

                        <span className="text-xs font-semibold text-slate-600">
                          {message.senderName ||
                            (isSchool
                              ? 'Your school'
                              : 'ScholaNode Support')}
                        </span>

                        {isSchool && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            Your school
                          </span>
                        )}
                      </div>

                      <div
                        className={`w-full rounded-2xl px-3.5 py-3 ${
                          isSchool
                            ? 'rounded-tr-md bg-[#071A52] text-white'
                            : 'rounded-tl-md border border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {message.text && (
                          <p className="whitespace-pre-wrap break-words text-sm leading-6">
                            {message.text}
                          </p>
                        )}

                        {attachment && (
                          <div className={message.text ? 'mt-3' : ''}>
                            {attachment.dataUrl ? (
                              <a
                                href={attachment.dataUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block overflow-hidden rounded-xl"
                                title="Open screenshot in a new tab"
                              >
                                <img
                                  src={attachment.dataUrl}
                                  alt={`Attachment: ${attachment.name}`}
                                  className="max-h-72 max-w-full rounded-xl object-contain"
                                />
                              </a>
                            ) : (
                              <div
                                className={`flex items-center gap-2 rounded-lg p-2 text-xs ${
                                  isSchool
                                    ? 'bg-white/10'
                                    : 'bg-slate-50'
                                }`}
                              >
                                <FileImage size={16} />
                                <span className="break-all">
                                  {attachment.name}
                                </span>
                              </div>
                            )}

                            <p
                              className={`mt-1 text-[10px] ${
                                isSchool
                                  ? 'text-blue-200'
                                  : 'text-slate-400'
                              }`}
                            >
                              {attachment.name}
                            </p>
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

            {/* CLOSED CONVERSATION */}
            {activeConversation.status === 'CLOSED' ? (
              <div className="border-t border-slate-100 p-5">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">
                      This conversation is closed
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Start a new conversation if you need help
                      with another issue.
                    </p>

                    <button
                      type="button"
                      onClick={() => startConversation('problem')}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#123A8F] transition hover:text-sky-700"
                    >
                      <Plus size={15} />
                      New conversation
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* REPLY FORM */
              <form
                onSubmit={handleSendReply}
                className="border-t border-slate-100 p-4 sm:p-5"
              >
                {activeConversation.status === 'RESOLVED' && (
                  <p className="mb-3 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
                    This conversation is marked resolved. Sending
                    a new message will reopen it in this demo.
                  </p>
                )}

                <label
                  htmlFor="support-reply"
                  className="mb-2 block text-sm font-bold text-[#071A52]"
                >
                  Reply to this conversation
                </label>

                <textarea
                  id="support-reply"
                  value={reply}
                  onChange={(event) =>
                    setReply(event.target.value)
                  }
                  rows={3}
                  maxLength={5000}
                  placeholder="Write your message or explain what you have tried..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-6 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />

                <input
                  ref={replyFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) =>
                    handleImageChange(event, 'reply')
                  }
                  className="hidden"
                />

                {replyAttachment && (
                  <ImagePreview
                    attachment={replyAttachment}
                    onRemove={() => setReplyAttachment(null)}
                    compact
                  />
                )}

                {formError && (
                  <p className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                    {formError}
                  </p>
                )}

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      replyFileInputRef.current?.click()
                    }
                    className="inline-flex w-fit items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-sky-700"
                  >
                    <Paperclip size={16} />
                    Attach screenshot
                  </button>

                  <button
                    type="submit"
                    disabled={!reply.trim() && !replyAttachment}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={15} />
                    Send message
                  </button>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Demo mode: messages and screenshot previews are
                  saved in this browser only. Nothing is sent to
                  the support team.
                </p>
              </form>
            )}
          </section>
        )}
      </div>
    </main>
  );
}