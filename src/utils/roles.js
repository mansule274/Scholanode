export const ROLES = Object.freeze({
  LEADER: 'LEADER',
  VICE_LEADER: 'VICE_LEADER',
  ADMINISTRATOR: 'ADMINISTRATOR',
  EXAM_OFFICER: 'EXAM_OFFICER',
  STAFF: 'STAFF',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT',
  SECURITY: 'SECURITY',
});



export const ROLE_LABELS = Object.freeze({
  [ROLES.LEADER]: 'Leader',
  [ROLES.VICE_LEADER]: 'Vice Leader',
  [ROLES.ADMINISTRATOR]: 'Administrator',
  [ROLES.EXAM_OFFICER]: 'Exam Officer',
  [ROLES.STAFF]: 'Staff',
  [ROLES.PARENT]: 'Parent',
  [ROLES.STUDENT]: 'Student',
  [ROLES.SECURITY]: 'Security',
});



export function normalizeRole(role) {

  if (!role) return null;

  const upper = String(role).trim().toUpperCase();

  if (upper === 'VICE' || upper === 'VICE PRINCIPAL' || upper === 'VP') {
    return ROLES.VICE_LEADER;
  }
  if (upper === 'PRINCIPAL' || upper === 'HEAD TEACHER' || upper === 'SCHOOL LEADER') {
    return ROLES.LEADER;
  }

  return Object.values(ROLES).includes(upper) ? upper : null;
}

export function getRoleLabel(role) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole) return ROLE_LABELS[normalizedRole];
  if (!role) return '';

  return String(role)
    .trim()
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function isLeaderOrVice(role) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === ROLES.LEADER || normalizedRole === ROLES.VICE_LEADER;
}

export function canAccessNavItem(item, userRole) {
  const normalizedRole = normalizeRole(userRole);

  if (isLeaderOrVice(normalizedRole)) {
    return true;
  }

  if (!item.allowedRoles || item.allowedRoles.length === 0) {
    return true;
  }

  return item.allowedRoles.some((allowedRole) => normalizeRole(allowedRole) === normalizedRole);
}
