import { getRoleLabel } from '../../../utils/roles';

export const COMPLAINT_CATEGORIES = [
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'STAFF_CONDUCT', label: 'Staff conduct' },
  { value: 'STUDENT_WELFARE', label: 'Student welfare' },
  { value: 'FEES_AND_PAYMENTS', label: 'Fees & payments' },
  { value: 'FACILITIES', label: 'Facilities' },
  { value: 'ATTENDANCE', label: 'Attendance' },
  { value: 'GENERAL', label: 'General' },
];

export const COMPLAINT_STATUSES = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const CATEGORY_LABELS = Object.fromEntries(
  COMPLAINT_CATEGORIES.map((category) => [category.value, category.label])
);

const STATUS_LABELS = Object.fromEntries(
  COMPLAINT_STATUSES.map((status) => [status.value, status.label])
);

const STATUS_STYLES = {
  SUBMITTED: 'border-amber-200 bg-amber-50 text-amber-700',
  IN_PROGRESS: 'border-blue-200 bg-blue-50 text-blue-700',
  RESOLVED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  CLOSED: 'border-slate-200 bg-slate-100 text-slate-600',
};

export const STATUS_TRANSITIONS = {
  SUBMITTED: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  IN_PROGRESS: ['RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || 'General';
}

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || 'Unknown';
}

export function getStatusStyle(status) {
  return STATUS_STYLES[status] || 'border-slate-200 bg-slate-50 text-slate-600';
}

export function getNextStatuses(status) {
  return STATUS_TRANSITIONS[status] || [];
}

export function formatComplaintDate(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return dateFormatter.format(date);
}

export function getSenderName(sender) {
  if (!sender) return '';

  return [sender.firstName, sender.surName].filter(Boolean).join(' ').trim();
}

export function getSenderRoleLabel(sender) {
  return sender?.role ? getRoleLabel(sender.role) : '';
}
