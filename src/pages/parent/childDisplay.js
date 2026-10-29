export function titleCase(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatTermName(termName) {
  return titleCase(
    String(termName || "")
      .toLowerCase()
      .replace(/_/g, " ")
  );
}

export function getPeriodLabel(period) {
  const term = formatTermName(period?.termName);
  const session = String(period?.sessionName || "").trim();

  return [term, session].filter(Boolean).join(" · ");
}

export function getInitials(student) {
  const first = student?.firstName?.[0] || "";
  const last = student?.surName?.[0] || "";
  return `${first}${last}`.toUpperCase() || "SN";
}

export function getDisplayName(student) {
  const name = [student?.firstName, student?.surName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return titleCase(name) || "Unnamed student";
}

export function getClassName(student) {
  const name = [student?.class?.classLevel, student?.class?.arm]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || "No class assigned";
}

export function getRelationshipLabel(relationship) {
  const value = String(relationship || "").trim();
  if (!value) return "Guardian";
  return titleCase(value.toLowerCase());
}

export const avatarPalettes = [
  "from-blue-600 to-cyan-500",
  "from-violet-600 to-indigo-500",
  "from-emerald-600 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
];

export const admissionStatusStyles = {
  ACTIVE: {
    label: "Active",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  GRADUATED: {
    label: "Graduated",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  TRANSFERRED: {
    label: "Transferred",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};
