import { getStaffDisplayName, isProfilePending } from '../../../utils/staffDisplay';

export const SUPPORT_CATEGORIES = [
  { value: 'TECHNICAL_ISSUE', label: 'Technical issue' },
  { value: 'ACCOUNT_AND_ACCESS', label: 'Account & access' },
  { value: 'BILLING_AND_PAYMENT', label: 'Billing & payments' },
  { value: 'BUG_REPORT', label: 'Bug report' },
  { value: 'FEATURE_REQUEST', label: 'Feature request' },
  { value: 'GENERAL_INQUIRY', label: 'General inquiry' },
  { value: 'OTHER', label: 'Something else' },
];

export const SUPPORT_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export const SUPPORT_FILTERS = [
  { value: 'ALL', label: 'All' },
  ...SUPPORT_STATUSES,
];

const CATEGORY_LABELS = Object.fromEntries(
  SUPPORT_CATEGORIES.map((category) => [category.value, category.label]),
);

const STATUS_LABELS = Object.fromEntries(
  SUPPORT_STATUSES.map((status) => [status.value, status.label]),
);

const STATUS_STYLES = {
  OPEN: 'border-sky-200 bg-sky-50 text-sky-700',
  IN_PROGRESS: 'border-amber-200 bg-amber-50 text-amber-700',
  RESOLVED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  CLOSED: 'border-slate-200 bg-slate-100 text-slate-600',
};

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
});

const dayMonthFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
});

const fullDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function toDate(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function toNumber(value, fallback) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

export function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || 'Support';
}

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || 'Open';
}

export function getStatusStyle(status) {
  return STATUS_STYLES[status] || STATUS_STYLES.OPEN;
}

export function formatSupportTime(value) {
  const date = toDate(value);

  return date ? timeFormatter.format(date) : '';
}

export function formatSupportListTime(value) {
  const date = toDate(value);

  if (!date) return '';

  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return timeFormatter.format(date);
  }

  return date.getFullYear() === now.getFullYear()
    ? dayMonthFormatter.format(date)
    : fullDateFormatter.format(date);
}

export function formatSupportDay(value) {
  const date = toDate(value);

  if (!date) return '';

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.getFullYear() === now.getFullYear()
    ? dayMonthFormatter.format(date)
    : fullDateFormatter.format(date);
}

export function formatSupportDateTime(value) {
  const date = toDate(value);

  return date ? dateTimeFormatter.format(date) : '';
}

export function isSameSupportDay(first, second) {
  const firstDate = toDate(first);
  const secondDate = toDate(second);

  if (!firstDate || !secondDate) return false;

  return firstDate.toDateString() === secondDate.toDateString();
}

export function getSenderName(sender) {
  if (!sender || typeof sender !== 'object') return '';

  // Senders can also be students or parents, so only a genuinely pending staff
  // account is relabelled; every other sender keeps the name the backend sends.
  if (isProfilePending(sender)) return getStaffDisplayName(sender);

  if (typeof sender.name === 'string' && sender.name.trim()) {
    return sender.name.trim();
  }

  if (typeof sender.fullName === 'string' && sender.fullName.trim()) {
    return sender.fullName.trim();
  }

  return [sender.firstName, sender.surName ?? sender.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function isSupportMessage(message, currentUserId) {
  if (!message || typeof message !== 'object') return false;

  if (typeof message.isFromSupport === 'boolean') return message.isFromSupport;

  const marker = String(
    message.senderType || message.senderKind || message.direction || '',
  ).toUpperCase();

  if (marker) {
    if (
      marker.includes('SUPPORT') ||
      marker.includes('AGENT') ||
      marker.includes('PLATFORM') ||
      marker === 'OUTBOUND'
    ) {
      return true;
    }

    if (
      marker.includes('SCHOOL') ||
      marker.includes('USER') ||
      marker.includes('CUSTOMER') ||
      marker === 'INBOUND'
    ) {
      return false;
    }
  }

  const role = String(
    message.senderRole || message.sender?.role || '',
  ).toUpperCase();

  if (
    role.includes('SUPER_ADMIN') ||
    role.includes('SUPPORT') ||
    role.includes('AGENT')
  ) {
    return true;
  }

  if (role.startsWith('SCHOOL_')) return false;

  const senderId =
    message.senderId ?? message.sender?.id ?? message.userId ?? null;

  if (senderId && currentUserId) {
    return String(senderId) !== String(currentUserId);
  }

  return false;
}

export function normalizeMessage(raw, index = 0, currentUserId = null) {
  if (!raw || typeof raw !== 'object') return null;

  const text =
    typeof raw.message === 'string'
      ? raw.message
      : typeof raw.text === 'string'
        ? raw.text
        : typeof raw.content === 'string'
          ? raw.content
          : '';

  const createdAt = raw.createdAt || raw.sentAt || null;
  const id =
    raw.id ??
    raw.messageId ??
    raw._id ??
    `${createdAt || 'message'}:${text.slice(0, 80)}`;

  if (!text.trim()) return null;

  return {
    ...raw,
    id: String(id ?? `message-${index}`),
    text,
    createdAt,
    senderId: raw.senderId ?? raw.sender?.id ?? raw.userId ?? null,
    senderName: getSenderName(raw.sender),
    isFromSupport: isSupportMessage(raw, currentUserId),
  };
}

export function normalizeConversation(raw, currentUserId = null) {
  if (!raw || typeof raw !== 'object') return null;

  const id = raw.id ?? raw.conversationId ?? raw._id;

  if (!id) return null;

  const lastCandidate =
    raw.lastMessage ??
    raw.latestMessage ??
    (Array.isArray(raw.messages) ? raw.messages[raw.messages.length - 1] : null);

  const lastMessage =
    lastCandidate && typeof lastCandidate === 'object'
      ? normalizeMessage(lastCandidate, 0, currentUserId)
      : null;

  const lastMessageText =
    typeof lastCandidate === 'string'
      ? lastCandidate
      : lastMessage?.text?.trim() ||
        (typeof raw.lastMessageText === 'string' ? raw.lastMessageText : '');

  return {
    ...raw,
    id: String(id),
    category: raw.category || 'OTHER',
    status: String(raw.status || 'OPEN').toUpperCase(),
    createdAt: raw.createdAt || null,
    updatedAt:
      raw.updatedAt ||
      raw.lastMessageAt ||
      lastMessage?.createdAt ||
      raw.createdAt ||
      null,
    lastMessage,
    lastMessageText,
  };
}

export function extractConversationList(payload) {
  const body = asObject(payload) || {};
  const data = asObject(body.data) || {};

  const conversations =
    (Array.isArray(data.conversations) && data.conversations) ||
    (Array.isArray(data.supports) && data.supports) ||
    (Array.isArray(data.items) && data.items) ||
    (Array.isArray(body.conversations) && body.conversations) ||
    (Array.isArray(body.supports) && body.supports) ||
    (Array.isArray(body.items) && body.items) ||
    (Array.isArray(body.data) && body.data) ||
    (Array.isArray(payload) && payload) ||
    [];

  return {
    conversations,
    pagination: data.pagination || body.pagination || null,
  };
}

export function extractMessageList(payload) {
  const body = asObject(payload) || {};
  const data = asObject(body.data) || {};

  const messages =
    (Array.isArray(data.messages) && data.messages) ||
    (Array.isArray(data.supportMessages) && data.supportMessages) ||
    (Array.isArray(data.items) && data.items) ||
    (Array.isArray(body.messages) && body.messages) ||
    (Array.isArray(body.items) && body.items) ||
    (Array.isArray(body.data) && body.data) ||
    (Array.isArray(payload) && payload) ||
    [];

  return {
    messages,
    pagination: data.pagination || body.pagination || null,
  };
}

export function extractCreatedConversation(payload, currentUserId = null) {
  const body = asObject(payload) || {};
  const data = asObject(body.data) || {};

  const candidate =
    asObject(data.conversation) ||
    asObject(data.supportConversation) ||
    asObject(body.conversation) ||
    asObject(body.supportConversation) ||
    (data.id ? data : null) ||
    (body.id ? body : null);

  return candidate ? normalizeConversation(candidate, currentUserId) : null;
}

export function extractCreatedMessage(payload, currentUserId = null) {
  const body = asObject(payload) || {};
  const data = asObject(body.data) || {};

  const candidate =
    asObject(data.message) ||
    asObject(data.supportMessage) ||
    asObject(body.message) ||
    asObject(body.supportMessage) ||
    null;

  return candidate ? normalizeMessage(candidate, 0, currentUserId) : null;
}

export function normalizePagination(
  pagination,
  fallbackPage = 1,
  fallbackSize = 20,
  loadedCount = 0,
) {
  const pageSize = Math.max(
    1,
    toNumber(pagination?.pageSize ?? pagination?.limit, fallbackSize),
  );
  const currentPage = Math.max(
    1,
    toNumber(pagination?.currentPage ?? pagination?.page, fallbackPage),
  );
  const totalItems = Math.max(
    loadedCount,
    toNumber(
      pagination?.totalItems ?? pagination?.total ?? pagination?.count,
      loadedCount,
    ),
  );
  const totalPages = Math.max(
    1,
    toNumber(pagination?.totalPages, Math.ceil(totalItems / pageSize)),
  );

  return { totalItems, currentPage, pageSize, totalPages };
}

export function mergeMessages(current, incoming) {
  const byId = new Map();

  [...current, ...incoming].forEach((message) => {
    if (message?.id) byId.set(message.id, message);
  });

  return Array.from(byId.values()).sort((first, second) => {
    const firstTime = toDate(first.createdAt)?.getTime() || 0;
    const secondTime = toDate(second.createdAt)?.getTime() || 0;

    return firstTime - secondTime;
  });
}

export function mergeConversations(current, incoming) {
  const byId = new Map();

  [...current, ...incoming].forEach((conversation) => {
    if (conversation?.id) byId.set(conversation.id, conversation);
  });

  return Array.from(byId.values()).sort((first, second) => {
    const firstTime = toDate(first.updatedAt)?.getTime() || 0;
    const secondTime = toDate(second.updatedAt)?.getTime() || 0;

    return secondTime - firstTime;
  });
}

export function getConversationPreview(conversation) {
  if (!conversation) return '';

  if (conversation.lastMessageText) return conversation.lastMessageText;

  return 'Open to read this conversation';
}
