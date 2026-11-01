const LEVEL_LABELS = {
  PRIMARY: 'Primary',
  SECONDARY: 'Secondary',
  COMBINED: 'Combined',
};

const OWNERSHIP_LABELS = {
  GOVERNMENT: 'Government',
  PRIVATE: 'Private',
};

export function formatSchoolLevel(value) {
  if (!value) return null;
  return LEVEL_LABELS[value] || value;
}

export function formatOwnershipType(value) {
  if (!value) return null;
  return OWNERSHIP_LABELS[value] || value;
}

export function getSchoolInitials(name) {
  return (
    String(name || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('') || 'S'
  );
}
