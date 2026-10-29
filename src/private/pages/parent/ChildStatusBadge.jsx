import { admissionStatusStyles, titleCase } from "./childDisplay";

export default function ChildStatusBadge({ status }) {
  const normalized = String(status || "").toUpperCase();
  const tone = admissionStatusStyles[normalized];
  const label =
    tone?.label ||
    (normalized
      ? titleCase(normalized.toLowerCase().replace(/_/g, " "))
      : "Unknown");

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
        tone ? tone.badge : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          tone ? tone.dot : "bg-slate-400"
        }`}
      />
      {label}
    </span>
  );
}
