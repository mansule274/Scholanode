const LAST_SCHOOL_KEY = 'scholanode:last-school';

export function readLastSchool() {
  try {
    const raw = window.localStorage.getItem(LAST_SCHOOL_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed?.schoolCode && parsed?.schoolName ? parsed : null;
  } catch {
    return null;
  }
}

export function saveLastSchool(school) {
  if (!school?.schoolCode || !school?.schoolName) return;

  try {
    window.localStorage.setItem(LAST_SCHOOL_KEY, JSON.stringify(school));
  } catch {
    // Storage may be unavailable in private browsing; remembering is optional.
  }
}

export function clearLastSchool() {
  try {
    window.localStorage.removeItem(LAST_SCHOOL_KEY);
  } catch {
    // Ignore storage failures.
  }
}
