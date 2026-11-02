import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bug,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Headphones,
  HelpCircle,
  KeyRound,
  Lightbulb,
  Loader2,
  MessageSquare,
  MessagesSquare,
  Plus,
  RefreshCw,
  RotateCcw,
  SendHorizonal,
  Wrench,
  X,
} from 'lucide-react';

import { useUserContext } from '../../context/UserContext';
import {
  createSupportConversation,
  getMySupportConversations,
  getSupportMessages,
  reopenSupportConversation,
  sendSupportMessage,
} from './support/supportApi';
import {
  SUPPORT_CATEGORIES,
  SUPPORT_FILTERS,
  extractConversationList,
  extractCreatedConversation,
  extractCreatedMessage,
  extractMessageList,
  formatSupportDay,
  formatSupportListTime,
  formatSupportTime,
  getCategoryLabel,
  getConversationPreview,
  getStatusLabel,
  getStatusStyle,
  isSameSupportDay,
  mergeConversations,
  mergeMessages,
  normalizeConversation,
  normalizeMessage,
  normalizePagination,
} from './support/supportDisplay';

const CONVERSATION_PAGE_SIZE = 30;
const MESSAGE_PAGE_SIZE = 100;
const EMPTY_PAGINATION = {
  totalItems: 0,
  currentPage: 1,
  pageSize: CONVERSATION_PAGE_SIZE,
  totalPages: 1,
};
const DEFAULT_DRAFT = { category: 'TECHNICAL_ISSUE', message: '' };

const CATEGORY_ICONS = {
  TECHNICAL_ISSUE: Wrench,
  ACCOUNT_AND_ACCESS: KeyRound,
  BILLING_AND_PAYMENT: CreditCard,
  BUG_REPORT: Bug,
  FEATURE_REQUEST: Lightbulb,
  GENERAL_INQUIRY: HelpCircle,
  OTHER: MessageSquare,
};

const STATUS_DOTS = {
  OPEN: 'bg-sky-500',
  IN_PROGRESS: 'bg-amber-500',
  RESOLVED: 'bg-emerald-500',
  CLOSED: 'bg-slate-400',
};

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  );
}

function CategoryAvatar({ category, size = 'md' }) {
  const Icon = CATEGORY_ICONS[category] || MessageSquare;
  const dimensions =
    size === 'lg' ? 'h-11 w-11 rounded-2xl' : 'h-10 w-10 rounded-xl';

  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-blue-50 text-[#123A8F] ${dimensions}`}
    >
      <Icon size={size === 'lg' ? 20 : 18} />
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${getStatusStyle(
        status
      )}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          STATUS_DOTS[status] || STATUS_DOTS.OPEN
        }`}
      />
      {getStatusLabel(status)}
    </span>
  );
}

function MessageComposer({
  value,
  onChange,
  onSubmit,
  sending = false,
  disabled = false,
  placeholder,
  autoFocus = false,
  error = '',
  hint = '',
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] font-medium text-rose-700"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={10000}
          disabled={disabled || sending}
          autoFocus={autoFocus}
          aria-label="Message"
          className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
        />

        <button
          type="submit"
          disabled={sending || disabled || !value.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#071A52] text-white transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <SendHorizonal size={18} />
          )}
        </button>
      </div>

      {hint && <p className="px-1 text-xs leading-5 text-slate-400">{hint}</p>}
    </form>
  );
}

function ConversationSkeleton() {
  return (
    <div className="divide-y divide-slate-100" aria-hidden="true">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="flex animate-pulse items-start gap-3 p-3.5">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />
          <div className="min-w-0 flex-1">
            <div className="h-3.5 w-28 rounded bg-slate-100" />
            <div className="mt-2 h-3 w-full rounded bg-slate-100" />
            <div className="mt-2 h-3 w-20 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
        >
          <div className="h-16 w-3/5 animate-pulse rounded-2xl bg-slate-200/70" />
        </div>
      ))}
    </div>
  );
}

function EmptyConversationList({ onStart }) {
  return (
    <div className="flex flex-col items-center px-5 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#123A8F]">
        <MessagesSquare size={26} />
      </div>
      <h3 className="mt-3 text-base font-extrabold text-[#071A52]">
        No conversations yet
      </h3>
      <p className="mt-1 max-w-xs text-[13px] leading-5 text-slate-500">
        Start a conversation and our team will reply here. You can return to
        it at any time.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-4 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F]"
      >
        <Plus size={16} />
        New conversation
      </button>
    </div>
  );
}

export default function HelpSupport() {
  const { user } = useUserContext();
  const userId = user?.id ?? null;

  const [conversations, setConversations] = useState([]);
  const [listPagination, setListPagination] = useState(EMPTY_PAGINATION);
  const [listPage, setListPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [listNotice, setListNotice] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refreshKey, setRefreshKey] = useState(0);

  const [activeId, setActiveId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);

  const [messages, setMessages] = useState([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesPagination, setMessagesPagination] = useState(EMPTY_PAGINATION);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');

  const [composerText, setComposerText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [reopening, setReopening] = useState(false);
  const [reopenError, setReopenError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const messagesRef = useRef(null);
  const stickToBottomRef = useRef(true);

  const loadConversations = useCallback(
    async ({ page = 1, append = false, silent = false } = {}) => {
      if (!silent) {
        setListLoading(true);
        setListError('');
      }

      try {
        const response = await getMySupportConversations({
          page,
          limit: CONVERSATION_PAGE_SIZE,
          status: statusFilter === 'ALL' ? '' : statusFilter,
        });

        const { conversations: list, pagination } =
          extractConversationList(response);
        const normalized = list
          .map((item) => normalizeConversation(item, userId))
          .filter(Boolean);

        setConversations((current) =>
          append
            ? mergeConversations(current, normalized)
            : mergeConversations([], normalized)
        );
        setListPagination(
          normalizePagination(
            pagination,
            page,
            CONVERSATION_PAGE_SIZE,
            append ? 0 : normalized.length
          )
        );
        if (!silent) setListPage(page);

        setActiveConversation((current) => {
          if (!current) return current;

          return normalized.find((item) => item.id === current.id) || current;
        });
      } catch (error) {
        if (!silent) {
          if (!append) setConversations([]);

          setListError(
            getErrorMessage(
              error,
              'We could not load your conversations. Check your connection and try again.'
            )
          );
        }
      } finally {
        if (!silent) setListLoading(false);
      }
    },
    [statusFilter, userId]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;

      await loadConversations({ page: 1 });
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [loadConversations, refreshKey]);

  const loadMessages = useCallback(
    async ({ page = 1, append = false, silent = false } = {}) => {
      if (!activeId) return;

      if (!silent) {
        setMessagesLoading(true);
        setMessagesError('');
      }

      try {
        const response = await getSupportMessages(activeId, {
          page,
          limit: MESSAGE_PAGE_SIZE,
        });

        const { messages: list, pagination } = extractMessageList(response);
        const normalized = list
          .map((item, index) => normalizeMessage(item, index, userId))
          .filter(Boolean);

        setMessages((current) =>
          append
            ? mergeMessages(current, normalized)
            : mergeMessages([], normalized)
        );
        setMessagesPagination(
          normalizePagination(pagination, page, MESSAGE_PAGE_SIZE)
        );
        if (!silent) setMessagesPage(page);

        const latest = normalized.reduce((current, item) => {
          if (!current) return item;

          const currentTime = new Date(current.createdAt || 0).getTime();
          const itemTime = new Date(item.createdAt || 0).getTime();

          return itemTime >= currentTime ? item : current;
        }, null);

        if (latest) {
          setConversations((current) =>
            current.map((conversation) =>
              conversation.id === activeId
                ? {
                    ...conversation,
                    lastMessage: latest,
                    lastMessageText: latest.text?.trim() || '',
                    updatedAt: latest.createdAt || conversation.updatedAt,
                  }
                : conversation
            )
          );
        }
      } catch (error) {
        if (!silent) {
          setMessagesError(
            getErrorMessage(
              error,
              'We could not load this conversation. Check your connection and try again.'
            )
          );
        }
      } finally {
        if (!silent) setMessagesLoading(false);
      }
    },
    [activeId, userId]
  );

  useEffect(() => {
    if (!activeId) return undefined;

    const load = async () => {
      await loadMessages({ page: 1 });
    };

    load();

    return undefined;
  }, [activeId, loadMessages]);

  useEffect(() => {
    if (!activeId) return undefined;

    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;

      loadMessages({ page: 1, append: true, silent: true });
      loadConversations({ page: 1, append: true, silent: true });
    }, 20000);

    return () => clearInterval(interval);
  }, [activeId, loadMessages, loadConversations]);

  useEffect(() => {
    const node = messagesRef.current;

    if (!node || !stickToBottomRef.current) return;

    node.scrollTop = node.scrollHeight;
  }, [messages]);

  const handleMessagesScroll = (event) => {
    const node = event.currentTarget;

    stickToBottomRef.current =
      node.scrollHeight - node.scrollTop - node.clientHeight < 80;
  };

  const conversationStatus = activeConversation?.status || 'OPEN';
  const canReply =
    conversationStatus === 'OPEN' || conversationStatus === 'IN_PROGRESS';
  const hasMoreMessages = messagesPagination.totalPages > messagesPage;

  function resetThreadState() {
    setMessages([]);
    setMessagesLoading(true);
    setMessagesPage(1);
    setMessagesPagination(EMPTY_PAGINATION);
    setMessagesError('');
    setComposerText('');
    setSendError('');
    setReopenError('');
    stickToBottomRef.current = true;
  }

  function openConversation(conversation) {
    if (conversation.id === activeId) {
      setActiveConversation(conversation);
      return;
    }

    resetThreadState();
    setActiveId(conversation.id);
    setActiveConversation(conversation);
  }

  function closeThread() {
    setActiveId(null);
    setActiveConversation(null);
    resetThreadState();
  }

  function openComposer() {
    setDraft(DEFAULT_DRAFT);
    setCreateError('');
    setCreateOpen(true);
  }

  function closeComposer() {
    if (creating) return;

    setCreateOpen(false);
    setDraft(DEFAULT_DRAFT);
    setCreateError('');
  }

  function handleStatusFilter(value) {
    if (value === statusFilter) return;

    setStatusFilter(value);
    setConversations([]);
    setListPage(1);
    setListError('');
  }

  async function handleCreate(event) {
    event.preventDefault();

    const message = draft.message.trim();

    if (!draft.category) {
      setCreateError('Choose a category so the right team can help.');
      return;
    }

    if (!message) {
      setCreateError('Write a short message so we know how to help.');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      const response = await createSupportConversation({
        category: draft.category,
        message,
      });

      const created = extractCreatedConversation(response, userId);

      setCreateOpen(false);
      setDraft(DEFAULT_DRAFT);
      setListNotice('');
      setRefreshKey((value) => value + 1);

      if (created) {
        const conversation = {
          ...created,
          status: created.status || 'OPEN',
          lastMessageText: created.lastMessageText || message,
          updatedAt: created.updatedAt || new Date().toISOString(),
        };

        resetThreadState();
        setActiveId(conversation.id);
        setActiveConversation(conversation);
      } else {
        setListNotice(
          'Your conversation was created. Open it from the list to continue.'
        );
      }
    } catch (error) {
      setCreateError(
        getErrorMessage(
          error,
          'We could not start this conversation. Please try again.'
        )
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleSend(event) {
    event.preventDefault();

    const message = composerText.trim();

    if (!message || !activeId || sending) return;

    setSending(true);
    setSendError('');

    try {
      const response = await sendSupportMessage(activeId, { message });
      const created = extractCreatedMessage(response, userId);

      setComposerText('');
      stickToBottomRef.current = true;

      if (created) {
        setMessages((current) => mergeMessages(current, [created]));
      } else {
        await loadMessages({ page: 1, append: true, silent: true });
      }

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeId
            ? {
                ...conversation,
                lastMessage: created || conversation.lastMessage,
                lastMessageText: message,
                updatedAt: created?.createdAt || new Date().toISOString(),
              }
            : conversation
        )
      );
    } catch (error) {
      setSendError(
        getErrorMessage(
          error,
          'Your message was not sent. Check your connection and try again.'
        )
      );
    } finally {
      setSending(false);
    }
  }

  async function handleReopen() {
    if (!activeId || reopening) return;

    setReopening(true);
    setReopenError('');

    try {
      const response = await reopenSupportConversation(activeId);
      const updated = extractCreatedConversation(response, userId);
      const nextStatus = updated?.status || 'OPEN';

      setActiveConversation((current) =>
        current
          ? { ...current, ...(updated || {}), status: nextStatus }
          : current
      );
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeId
            ? { ...conversation, status: nextStatus }
            : conversation
        )
      );

      stickToBottomRef.current = true;
      await loadMessages({ page: 1 });
    } catch (error) {
      setReopenError(
        getErrorMessage(
          error,
          'We could not reopen this conversation. Please try again.'
        )
      );
    } finally {
      setReopening(false);
    }
  }

  async function handleLoadMore() {
    if (listLoading) return;

    await loadConversations({ page: listPage + 1, append: true });
  }

  async function handleLoadEarlierMessages() {
    if (messagesLoading) return;

    await loadMessages({ page: messagesPage + 1, append: true });
  }

  const currentListPage = listPagination.currentPage || listPage;
  const hasMoreConversations = listPagination.totalPages > currentListPage;

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-[13px] text-slate-500"
      >
        <span>School</span>
        <ChevronRight size={14} />
        <span className="font-semibold text-[#071A52]">Help &amp; Support</span>
      </nav>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-5 text-white shadow-sm sm:p-6">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border-[28px] border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-20 right-28 h-40 w-40 rounded-full bg-cyan-400/[0.08] blur-2xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <Headphones size={23} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                Support centre
              </p>
              <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                Help &amp; Support
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-6 text-blue-100">
                Message the ScholaNode team about a problem, your account or an
                idea. Replies from our team appear in the same conversation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openComposer}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0A2463] transition hover:bg-blue-50"
          >
            <Plus size={16} />
            New conversation
          </button>
        </div>
      </section>

      {listNotice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-3.5 text-sm text-sky-800"
        >
          <span>{listNotice}</span>
          <button
            type="button"
            onClick={() => setListNotice('')}
            aria-label="Dismiss message"
            className="cursor-pointer rounded-md p-0.5 transition hover:bg-sky-100"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:h-[calc(100vh-250px)] lg:min-h-[600px] lg:grid-cols-[330px_minmax(0,1fr)] lg:items-stretch">
        <aside
          className={`${
            activeId ? 'hidden lg:flex' : 'flex'
          } min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:h-full`}
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-extrabold text-[#071A52]">
                Conversations
              </h2>
              {listLoading && conversations.length > 0 && (
                <Loader2 size={15} className="animate-spin text-slate-400" />
              )}
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {SUPPORT_FILTERS.map((filter) => {
                const active = statusFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => handleStatusFilter(filter.value)}
                    aria-pressed={active}
                    className={`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'bg-[#071A52] text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {listLoading && conversations.length === 0 ? (
              <ConversationSkeleton />
            ) : listError && conversations.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <AlertCircle size={22} />
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-800">
                  Unable to load conversations
                </h3>
                <p className="mt-1 text-[13px] leading-5 text-slate-500">
                  {listError}
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
            ) : conversations.length === 0 ? (
              <EmptyConversationList onStart={openComposer} />
            ) : (
              <>
                {listError && (
                  <p
                    role="alert"
                    className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-[13px] text-rose-700"
                  >
                    {listError}
                  </p>
                )}

                <div className="divide-y divide-slate-100">
                  {conversations.map((conversation) => {
                    const active = conversation.id === activeId;

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => openConversation(conversation)}
                        aria-current={active ? 'true' : undefined}
                        className={`flex w-full cursor-pointer items-start gap-3 p-3.5 text-left transition ${
                          active
                            ? 'bg-blue-50/80'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <CategoryAvatar category={conversation.category} />

                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-bold text-[#071A52]">
                              {getCategoryLabel(conversation.category)}
                            </span>
                            <span className="shrink-0 text-xs text-slate-400">
                              {formatSupportListTime(conversation.updatedAt)}
                            </span>
                          </span>

                          <span className="mt-0.5 block truncate text-[13px] text-slate-500">
                            {getConversationPreview(conversation)}
                          </span>

                          <span className="mt-1.5 flex items-center gap-1.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                STATUS_DOTS[conversation.status] ||
                                STATUS_DOTS.OPEN
                              }`}
                            />
                            <span className="text-xs font-medium text-slate-500">
                              {getStatusLabel(conversation.status)}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {hasMoreConversations && (
                  <div className="border-t border-slate-100 p-3 text-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={listLoading}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-bold text-[#123A8F] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {listLoading && (
                        <Loader2 size={14} className="animate-spin" />
                      )}
                      Load more conversations
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>

        <section
          className={`${
            activeId ? 'flex' : 'hidden lg:flex'
          } h-[calc(100dvh-230px)] min-h-[440px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:h-full`}
        >
          {!activeConversation ? (
            <div className="flex h-full min-h-[440px] flex-col items-center justify-center px-8 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#123A8F]">
                <MessagesSquare size={28} />
              </div>
              <h2 className="mt-4 text-lg font-extrabold text-[#071A52]">
                Select a conversation
              </h2>
              <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
                Open a conversation to read the replies or continue the
                discussion with our team.
              </p>
              <button
                type="button"
                onClick={openComposer}
                className="mt-5 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F]"
              >
                <Plus size={16} />
                New conversation
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 bg-white p-3.5 sm:p-4">
                <button
                  type="button"
                  onClick={closeThread}
                  aria-label="Back to conversations"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#071A52] lg:hidden"
                >
                  <ArrowLeft size={18} />
                </button>

                <CategoryAvatar
                  category={activeConversation.category}
                  size="lg"
                />

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-extrabold text-[#071A52]">
                    {getCategoryLabel(activeConversation.category)}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusBadge status={conversationStatus} />
                    {formatSupportDay(activeConversation.createdAt) && (
                      <span className="text-xs text-slate-400">
                        Started {formatSupportDay(activeConversation.createdAt)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => loadMessages({ page: 1 })}
                  disabled={messagesLoading}
                  aria-label="Refresh messages"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#071A52] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={messagesLoading ? 'animate-spin' : ''}
                  />
                </button>
              </div>

              <div
                ref={messagesRef}
                onScroll={handleMessagesScroll}
                className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-3.5 sm:p-5"
              >
                {messagesLoading && messages.length === 0 ? (
                  <MessageSkeleton />
                ) : messagesError && messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                      <AlertCircle size={22} />
                    </div>
                    <h3 className="mt-3 text-base font-bold text-slate-800">
                      Unable to load this conversation
                    </h3>
                    <p className="mt-1 max-w-sm text-[13px] leading-5 text-slate-500">
                      {messagesError}
                    </p>
                    <button
                      type="button"
                      onClick={() => loadMessages({ page: 1 })}
                      className="mt-4 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F]"
                    >
                      <RefreshCw size={15} />
                      Try again
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#123A8F]">
                      <MessagesSquare size={22} />
                    </div>
                    <h3 className="mt-3 text-base font-bold text-slate-800">
                      No messages yet
                    </h3>
                    <p className="mt-1 max-w-sm text-[13px] leading-5 text-slate-500">
                      Send the first message and our team will reply here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hasMoreMessages && (
                      <div className="pb-1 text-center">
                        <button
                          type="button"
                          onClick={handleLoadEarlierMessages}
                          disabled={messagesLoading}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-[#123A8F] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {messagesLoading && (
                            <Loader2 size={13} className="animate-spin" />
                          )}
                          Load earlier messages
                        </button>
                      </div>
                    )}

                    {messages.map((message, index) => {
                      const fromSupport = message.isFromSupport;
                      const previous = index > 0 ? messages[index - 1] : null;
                      const showDay =
                        !previous ||
                        !isSameSupportDay(previous.createdAt, message.createdAt);

                      return (
                        <Fragment key={message.id}>
                          {showDay && (
                            <div className="flex justify-center py-2">
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                                {formatSupportDay(message.createdAt)}
                              </span>
                            </div>
                          )}

                          <div
                            className={`flex ${
                              fromSupport ? 'justify-start' : 'justify-end'
                            }`}
                          >
                            <div
                              className={`flex max-w-[88%] flex-col sm:max-w-[75%] ${
                                fromSupport ? 'items-start' : 'items-end'
                              }`}
                            >
                              {fromSupport && (
                                <div className="mb-1 flex items-center gap-1.5 px-1">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#071A52] text-white">
                                    <Headphones size={12} />
                                  </span>
                                  <span className="text-xs font-semibold text-slate-600">
                                    {message.senderName ||
                                      'ScholaNode Support'}
                                  </span>
                                </div>
                              )}

                              <div
                                className={`space-y-2 px-3.5 py-2.5 text-sm leading-6 shadow-sm ${
                                  fromSupport
                                    ? 'rounded-2xl rounded-tl-md border border-slate-200 bg-white text-slate-700'
                                    : 'rounded-2xl rounded-tr-md bg-[#071A52] text-white'
                                }`}
                              >
                                {message.text && (
                                  <p className="whitespace-pre-wrap break-words">
                                    {message.text}
                                  </p>
                                )}
                              </div>

                              <span className="mt-1 px-1 text-xs text-slate-400">
                                {formatSupportTime(message.createdAt)}
                              </span>
                            </div>
                          </div>
                        </Fragment>
                      );
                    })}

                    {messagesError && (
                      <p
                        role="alert"
                        className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-center text-[13px] text-rose-700"
                      >
                        {messagesError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 bg-white p-3 sm:p-4">
                {canReply ? (
                  <MessageComposer
                    value={composerText}
                    onChange={(value) => {
                      setComposerText(value);
                      if (sendError) setSendError('');
                    }}
                    onSubmit={handleSend}
                    sending={sending}
                    placeholder="Write your message..."
                    error={sendError}
                  />
                ) : (
                  <div className="space-y-2">
                    <div
                      className={`flex flex-col gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center sm:justify-between ${
                        conversationStatus === 'RESOLVED'
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {conversationStatus === 'RESOLVED' ? (
                          <CheckCircle2
                            size={19}
                            className="mt-0.5 shrink-0 text-emerald-700"
                          />
                        ) : (
                          <MessageSquare
                            size={19}
                            className="mt-0.5 shrink-0 text-slate-500"
                          />
                        )}
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              conversationStatus === 'RESOLVED'
                                ? 'text-emerald-900'
                                : 'text-slate-800'
                            }`}
                          >
                            {conversationStatus === 'RESOLVED'
                              ? 'This conversation is resolved'
                              : 'This conversation is closed'}
                          </p>
                          <p
                            className={`mt-0.5 text-[13px] leading-5 ${
                              conversationStatus === 'RESOLVED'
                                ? 'text-emerald-800'
                                : 'text-slate-500'
                            }`}
                          >
                            {conversationStatus === 'RESOLVED'
                              ? 'If you still need help, reopen it and continue the discussion.'
                              : 'Reopen this conversation to continue, or start a new one for another issue.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleReopen}
                        disabled={reopening}
                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {reopening ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <RotateCcw size={15} />
                        )}
                        {reopening ? 'Reopening…' : 'Reopen'}
                      </button>
                    </div>

                    {reopenError && (
                      <p
                        role="alert"
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] font-medium text-rose-700"
                      >
                        {reopenError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {createOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeComposer();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-support-conversation"
            className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                  New conversation
                </p>
                <h2
                  id="new-support-conversation"
                  className="mt-1 text-lg font-extrabold text-[#071A52]"
                >
                  Message ScholaNode Support
                </h2>
              </div>

              <button
                type="button"
                onClick={closeComposer}
                disabled={creating}
                aria-label="Close new conversation"
                className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="mb-2 text-[13px] font-semibold text-slate-700">
                  What do you need help with?
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {SUPPORT_CATEGORIES.map((category) => {
                    const Icon = CATEGORY_ICONS[category.value];
                    const active = draft.category === category.value;

                    return (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => {
                          setDraft((current) => ({
                            ...current,
                            category: category.value,
                          }));
                          if (createError) setCreateError('');
                        }}
                        disabled={creating}
                        aria-pressed={active}
                        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          active
                            ? 'border-[#0A2463] bg-blue-50 text-[#071A52] ring-2 ring-[#0A2463]/10'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40'
                        }`}
                      >
                        <Icon size={16} className="shrink-0" />
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <MessageComposer
                value={draft.message}
                onChange={(value) => {
                  setDraft((current) => ({ ...current, message: value }));
                  if (createError) setCreateError('');
                }}
                onSubmit={handleCreate}
                sending={creating}
                placeholder="Describe what's happening..."
                autoFocus
                error={createError}
                hint="Our team replies in this conversation. Please do not include passwords or card details."
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
