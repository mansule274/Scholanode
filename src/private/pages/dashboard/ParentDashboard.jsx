import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  AlertCircle,
  BellOff,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Download,
  GraduationCap,
  QrCode,
  RefreshCw,
  School,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useUserContext } from "../../../context/UserContext";
import { getParentDashboard } from "../people/parentApi";
import {
  avatarPalettes,
  getClassName,
  getDisplayName,
  getInitials,
  getPeriodLabel,
  getRelationshipLabel,
  titleCase,
} from "../parent/childDisplay";
import ChildStatusBadge from "../parent/ChildStatusBadge";

function getAttendanceSummary(attendance) {
  const presentDays = Number(attendance?.presentDays) || 0;
  const absentDays = Number(attendance?.absentDays) || 0;
  const totalRecordedDays = Number(attendance?.totalRecordedDays) || 0;
  const rawPercentage = attendance?.percentage;
  const hasPercentage =
    rawPercentage !== null &&
    rawPercentage !== undefined &&
    rawPercentage !== "" &&
    Number.isFinite(Number(rawPercentage));

  const derivedPercentage = hasPercentage
    ? Math.round(Number(rawPercentage))
    : totalRecordedDays > 0
      ? Math.round((presentDays / totalRecordedDays) * 100)
      : null;

  return {
    available: attendance?.available !== false,
    presentDays,
    absentDays,
    totalRecordedDays,
    percentage:
      derivedPercentage === null
        ? null
        : Math.min(100, Math.max(0, derivedPercentage)),
  };
}

function getAttendanceTone(percentage) {
  if (percentage === null) {
    return { text: "text-slate-400", bar: "bg-slate-300" };
  }
  if (percentage >= 90) {
    return {
      text: "text-emerald-700",
      bar: "bg-gradient-to-r from-emerald-500 to-teal-400",
    };
  }
  if (percentage >= 75) {
    return {
      text: "text-sky-700",
      bar: "bg-gradient-to-r from-sky-500 to-cyan-400",
    };
  }
  if (percentage >= 50) {
    return {
      text: "text-amber-700",
      bar: "bg-gradient-to-r from-amber-500 to-orange-400",
    };
  }
  return {
    text: "text-rose-700",
    bar: "bg-gradient-to-r from-rose-500 to-pink-400",
  };
}

function AttendanceBlock({ attendance, periodLabel }) {
  const summary = getAttendanceSummary(attendance);
  const tone = getAttendanceTone(summary.percentage);

  if (!summary.available) {
    return (
      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3 text-xs font-medium text-slate-500">
        Attendance is not available for this student yet.
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-600">
            <ClipboardCheck size={14} className="shrink-0 text-slate-400" />
            Attendance
          </p>
          {periodLabel && (
            <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {periodLabel}
            </p>
          )}
        </div>
        <p
          className={`shrink-0 text-xl font-extrabold leading-none ${tone.text}`}
        >
          {summary.percentage === null ? "—" : `${summary.percentage}%`}
        </p>
      </div>

      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label="Term attendance progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={summary.percentage ?? 0}
      >
        <div
          className={`h-full rounded-full ${tone.bar}`}
          style={{ width: `${summary.percentage ?? 0}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
        {summary.totalRecordedDays > 0 ? (
          <>
            <span>
              Present{" "}
              <b className="font-bold text-slate-700">{summary.presentDays}</b>
              {" · "}Absent{" "}
              <b className="font-bold text-slate-700">{summary.absentDays}</b>
            </span>
            <span className="shrink-0">
              {summary.totalRecordedDays}{" "}
              {summary.totalRecordedDays === 1 ? "day" : "days"}
            </span>
          </>
        ) : (
          <span>No attendance recorded yet this term</span>
        )}
      </div>
    </div>
  );
}

function CardAction({ icon: Icon, label, onClick, primary = false, disabled = false }) {
  if (primary) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0A2463] px-2.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon size={14} />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function ChildCard({
  child,
  palette,
  periodLabel,
  onShowQr,
  onOpenResults,
  onOpenProfile,
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className={`h-1 bg-gradient-to-r ${palette}`} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${palette} text-base font-black text-white shadow-sm`}
          >
            {getInitials(child)}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-[#071A52]">
              {getDisplayName(child)}
            </h3>
            <p className="truncate font-mono text-xs text-slate-500">
              {child?.admissionNumber || "No admission number"}
            </p>
          </div>

          <ChildStatusBadge status={child?.admissionStatus} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">
            {getClassName(child)}
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
            {getRelationshipLabel(child?.relationship)}
          </span>
          {child?.receivesNotifications === false && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
              <BellOff size={12} />
              Alerts off
            </span>
          )}
        </div>

        <AttendanceBlock
          attendance={child?.attendance}
          periodLabel={periodLabel}
        />

        <div className="mt-4 grid grid-cols-3 gap-2">
          <CardAction
            icon={BookOpen}
            label="Results"
            onClick={() => onOpenResults(child)}
          />
          <CardAction
            icon={QrCode}
            label="QR Code"
            primary
            disabled={!child?.qrToken}
            onClick={() => onShowQr(child)}
          />
          <CardAction
            icon={UserRound}
            label="Profile"
            onClick={() => onOpenProfile(child)}
          />
        </div>
      </div>
    </article>
  );
}

function ChildQrModal({ child, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function downloadQrCode() {
    const canvas = document.getElementById("parent-child-qr-canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${getDisplayName(child).replace(/\s+/g, "-")}-QR.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${getDisplayName(child)} QR badge`}
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A2463] text-xs font-black text-white">
              {getInitials(child)}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-extrabold text-[#071A52]">
                {getDisplayName(child)}
              </h2>
              <p className="truncate text-[13px] text-slate-500">
                {getClassName(child)} · {child?.admissionNumber || "—"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close QR badge"
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4">
            <div className="rounded-xl bg-white p-2 shadow-sm">
              <QRCodeCanvas
                id="parent-child-qr-canvas"
                value={child.qrToken}
                size={260}
                level="H"
                includeMargin
                className="block h-auto max-w-full"
                style={{ width: "min(70vw, 260px)", height: "auto" }}
              />
            </div>
            <p className="mt-3 text-center text-[13px] font-semibold text-slate-500">
              Present this code at the school gate scanner
            </p>
          </div>

          <p className="mt-2 text-center text-xs leading-5 text-slate-500">
            Increase your phone brightness if the scanner has difficulty reading
            the code.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-5">
          <button
            type="button"
            onClick={downloadQrCode}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0A2463] px-3 py-3 text-sm font-bold text-white transition hover:bg-[#123A8F]"
          >
            <Download size={16} />
            Download
          </button>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ParentDashboard() {
  const { user, school } = useUserContext();
  const navigate = useNavigate();

  const [children, setChildren] = useState([]);
  const [parentProfile, setParentProfile] = useState(null);
  const [childrenCount, setChildrenCount] = useState(null);
  const [attendancePeriod, setAttendancePeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [selectedChild, setSelectedChild] = useState(null);

  const schoolName = school?.schoolName || school?.name || "School";
  const parentName = useMemo(() => {
    const name = [parentProfile?.firstName, parentProfile?.surName]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (name) return titleCase(name);

    const fallback = [user?.firstName, user?.surName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return titleCase(fallback) || user?.fullName || "Parent";
  }, [parentProfile, user]);

  const periodLabel = useMemo(
    () => getPeriodLabel(attendancePeriod),
    [attendancePeriod]
  );

  const todayLabel = new Date().toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const payload = await getParentDashboard();
        if (cancelled) return;

        const dashboard = payload?.data || {};
        const list = Array.isArray(dashboard.children) ? dashboard.children : [];

        setChildren(list);
        setParentProfile(dashboard.parent || null);
        setAttendancePeriod(dashboard.attendancePeriod || null);
        setChildrenCount(
          Number.isFinite(Number(dashboard?.summary?.childrenCount))
            ? Number(dashboard.summary.childrenCount)
            : list.length
        );
      } catch (requestError) {
        if (cancelled) return;

        setChildren([]);
        setParentProfile(null);
        setAttendancePeriod(null);
        setChildrenCount(null);
        setError(
          requestError?.response?.data?.message ||
            "We could not load your dashboard. Check your connection and try again."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [refreshToken]);

  return (
    <div className="min-h-full bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-5 text-white shadow-sm sm:p-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full border-[30px] border-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-cyan-400/[0.08] blur-2xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-100">
                <GraduationCap size={14} />
                Parent portal
              </div>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Welcome back, {parentName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-blue-100">
                <span className="inline-flex items-center gap-1.5">
                  <School size={14} />
                  {schoolName}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  {todayLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-black">
                <Users size={19} />
              </span>
              <div>
                <p className="text-2xl font-extrabold leading-none">
                  {childrenCount ?? "—"}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-blue-200">
                  Linked {childrenCount === 1 ? "child" : "children"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-[#071A52]">
                My children
              </h2>
              <p className="mt-1 text-[13px] text-slate-500">
                Students linked to your parent account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRefreshToken((value) => value + 1)}
              disabled={loading}
              aria-label="Refresh children"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <AlertCircle size={20} />
              </div>
              <p className="mt-3 text-base font-bold text-slate-800">
                Your dashboard could not be loaded
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                {error}
              </p>
              <button
                type="button"
                onClick={() => setRefreshToken((value) => value + 1)}
                className="mt-4 cursor-pointer rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F]"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="grid gap-4 md:grid-cols-2" aria-hidden="true">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                      <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                  </div>
                  <div className="mt-3 h-8 animate-pulse rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          ) : children.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Users size={20} />
              </div>
              <p className="mt-3 text-base font-bold text-slate-800">
                No children linked yet
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                Contact your school administrator to link your children to this
                account.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {children.map((child, index) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  palette={avatarPalettes[index % avatarPalettes.length]}
                  periodLabel={periodLabel}
                  onShowQr={setSelectedChild}
                  onOpenResults={(item) =>
                    navigate(`/children/${item.id}/results`)
                  }
                  onOpenProfile={(item) =>
                    navigate(`/children/${item.id}/profile`)
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedChild && (
        <ChildQrModal
          child={selectedChild}
          onClose={() => setSelectedChild(null)}
        />
      )}
    </div>
  );
}
