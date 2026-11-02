export const INQUIRY_STATUSES = [
  { value: 'NEW', label: 'New' },
  { value: 'REVIEWED', label: 'Reviewed' },
];

const STATUS_LABELS = Object.fromEntries(
  INQUIRY_STATUSES.map((status) => [status.value, status.label])
);

const STATUS_STYLES = {
  NEW: 'border-amber-200 bg-amber-50 text-amber-700',
  REVIEWED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const longDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function getInquiryStatusLabel(status) {
  return STATUS_LABELS[status] || 'Unknown';
}

export function getInquiryStatusStyle(status) {
  return STATUS_STYLES[status] || 'border-slate-200 bg-slate-50 text-slate-600';
}

export function formatInquiryDate(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return dateTimeFormatter.format(date);
}

export function formatInquiryLongDate(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return longDateFormatter.format(date);
}

export function getInquiryInitials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  );
}

export function isEmailContact(contact = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(contact).trim());
}

export function getContactHref(contact = '') {
  const value = String(contact).trim();

  if (!value) return '';

  if (isEmailContact(value)) return `mailto:${value}`;

  return `tel:${value.replace(/[^\d+]/g, '')}`;
}
