import { getRoleLabel } from '../../../utils/roles';

export const AUDIENCE_OPTIONS = [
  { value: 'STAFF', label: 'Staff' },
  { value: 'STUDENTS', label: 'Students' },
  { value: 'PARENTS', label: 'Parents' },
  { value: 'SECURITY', label: 'Security' },
];

const AUDIENCE_LABELS = {
  STAFF: 'Staff',
  STUDENTS: 'Students',
  PARENTS: 'Parents',
  SECURITY: 'Security',
};

const AUDIENCE_STYLES = {
  STAFF: 'border-violet-200 bg-violet-50 text-violet-700',
  STUDENTS: 'border-blue-200 bg-blue-50 text-blue-700',
  PARENTS: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  SECURITY: 'border-amber-200 bg-amber-50 text-amber-700',
};

const AUDIENCE_BY_ROLE = {
  LEADER: 'STAFF',
  VICE_LEADER: 'STAFF',
  ADMINISTRATOR: 'STAFF',
  EXAM_OFFICER: 'STAFF',
  STAFF: 'STAFF',
  STUDENT: 'STUDENTS',
  PARENT: 'PARENTS',
  SECURITY: 'SECURITY',
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function getAudienceLabel(audience) {
  return AUDIENCE_LABELS[audience] || 'Everyone';
}

export function getAudienceStyle(audience) {
  return AUDIENCE_STYLES[audience] || 'border-slate-200 bg-slate-50 text-slate-600';
}

export function getAudienceForRole(role) {
  return AUDIENCE_BY_ROLE[role] || null;
}

export function formatAnnouncementDate(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return dateFormatter.format(date);
}

export function getCreatorName(creator) {
  if (!creator) return '';

  return [creator.firstName, creator.surName].filter(Boolean).join(' ').trim();
}

export function getCreatorRoleLabel(creator) {
  return creator?.role ? getRoleLabel(creator.role) : '';
}
