import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Loader2,
  RefreshCw,
  RotateCcw,
  UserRound,
  X,
} from "lucide-react";
import { useUserContext } from "../../../context/UserContext";
import { getAttendanceHistory, getAttendanceRegister } from "./attendanceApi";
import { getClasses } from "../academic/classesApi";
import ProfilePendingBadge from "../../components/ProfilePendingBadge";
import {
  PENDING_PROFILE_HINT,
  getStaffDisplayName,
  isProfilePending,
} from "../../../utils/staffDisplay";
import { downloadFile, toCsv } from "../../../utils/csv";
import { collectAllPages } from "../../../utils/pagedExport";

// A date-only value (YYYY-MM-DD) is read as UTC midnight by Date, which can
// roll the day back a calendar day in negative-offset zones; treat it as local.
function formatDate(value) {
  if (!value) return "—";
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
    ? `${value}T00:00:00`
    : value;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getClassLabel(register) {
  const label = [register?.class?.classLevel, register?.class?.arm]
    .filter(Boolean)
    .join(" ")
    .trim();
  return label || "—";
}

function getCreatedByName(register) {
  return getStaffDisplayName(register?.createdBy) || "Unknown staff";
}

function normalizeStatus(status) {
  const value = String(status || "").toUpperCase();
  if (value === "PRESENT") return "PRESENT";
  if (value === "ABSENT") return "ABSENT";
  return "UNCONFIRMED";
}

function StatusBadge({ status }) {
  const config = {
    PRESENT: {
      wrapper: "border-emerald-200 bg-emerald-50 text-emerald-800",
      dot: "bg-emerald-500",
      label: "Present",
    },
    ABSENT: {
      wrapper: "border-rose-200 bg-rose-50 text-rose-800",
      dot: "bg-rose-500",
      label: "Absent",
    },
    UNCONFIRMED: {
      wrapper: "border-slate-200 bg-slate-50 text-slate-600",
      dot: "bg-slate-400",
      label: "Unconfirmed",
    },
  }[normalizeStatus(status)];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-bold ${config.wrapper}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function RegisterStatusBadge({ status }) {
  const isSubmitted = String(status || "").toUpperCase() === "SUBMITTED";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
        isSubmitted
          ? "border-blue-200 bg-blue-50 text-blue-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      {isSubmitted ? "Submitted" : "Draft"}
    </span>
  );
}

function getStudentName(student) {
  const name = [student?.firstName, student?.surName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || `Student ${student?.admissionNumber || ""}`.trim() || "Student";
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-slate-100" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-4">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
          <div className="hidden flex-1 space-y-2 sm:block">
            <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-2.5 w-24 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

// Read-only register detail: fetched fresh when a row is opened. The server
// always returns canEdit false for administrators, so editing is never offered.
function RegisterDetailModal({ registerId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const payload = await getAttendanceRegister(registerId);
        if (active) setDetail(payload?.data ?? null);
      } catch (requestError) {
        if (!active) return;
        setDetail(null);
        setError(
          requestError?.response?.data?.message ||
            "This attendance register could not be loaded. Check your connection and try again."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [registerId, attempt]);

  const summary = detail?.attendanceSummary;
  const students = Array.isArray(detail?.students) ? detail.students : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Attendance register details"
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-600">
              Read-only register
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-[#071A52]">
              {getClassLabel({ class: detail?.attendanceRegister?.class })}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatDate(detail?.attendanceRegister?.attendanceDate)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-sm font-semibold text-slate-500">
              <Loader2 size={20} className="animate-spin text-cyan-600" />
              Loading register…
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <AlertCircle size={22} />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-800">
                Register could not be loaded
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                {error}
              </p>
              <button
                type="button"
                onClick={() => setAttempt((value) => value + 1)}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#071A52] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#123A8F]"
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Meta label="Session" value={detail?.attendanceRegister?.session?.sessionName} />
                <Meta label="Term" value={detail?.attendanceRegister?.term?.termName} />
                <Meta
                  label="Status"
                  value={<RegisterStatusBadge status={detail?.attendanceRegister?.status} />}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Recorded by
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {getStaffDisplayName(detail?.attendanceRegister?.createdBy) || "Unknown staff"}
                  </p>
                  {isProfilePending(detail?.attendanceRegister?.createdBy) && (
                    <ProfilePendingBadge />
                  )}
                </div>
                {isProfilePending(detail?.attendanceRegister?.createdBy) && (
                  <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                    {PENDING_PROFILE_HINT}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-slate-400">
                  Created {formatDateTime(detail?.attendanceRegister?.createdAt)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Count label="Total students" value={summary?.totalStudents} />
                <Count label="Present" value={summary?.presentCount} tone="emerald" />
                <Count label="Absent" value={summary?.absentCount} tone="rose" />
                <Count label="Unconfirmed" value={summary?.unconfirmedCount} tone="slate" />
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Students ({students.length})
                </p>
                {students.length === 0 ? (
                  <p className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-xs text-slate-500">
                    No students are recorded on this register.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
                    {students.map((student) => (
                      <li
                        key={student.attendanceRecordId ?? student.studentId}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#071A52]">
                            {getStudentName(student)}
                          </p>
                          <p className="truncate font-mono text-[11px] text-slate-500">
                            {student.admissionNumber || "—"}
                            {student.gender ? ` · ${String(student.gender).toLowerCase()}` : ""}
                          </p>
                        </div>
                        <StatusBadge status={student.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-[#071A52] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123A8F]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold text-slate-800">
        {value || "—"}
      </div>
    </div>
  );
}

function Count({ label, value, tone = "navy" }) {
  const tones = {
    navy: "text-[#071A52]",
    emerald: "text-emerald-700",
    rose: "text-rose-700",
    slate: "text-slate-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-center">
      <p className={`text-xl font-extrabold ${tones[tone]}`}>
        {typeof value === "number" ? value : "—"}
      </p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

function SummaryCard({ label, value, hint, tone = "navy" }) {
  const tones = {
    navy: "text-[#071A52]",
    emerald: "text-emerald-700",
    rose: "text-rose-700",
    amber: "text-amber-700",
    slate: "text-slate-600",
  };
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-extrabold ${tones[tone]}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>
    </div>
  );
}

const filterSelectClass =
  "w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10";

export default function AttendanceHistoryPage() {
  const navigate = useNavigate();
  const { school } = useUserContext();
  const schoolName = school?.schoolName || school?.name || "School";

  const [registers, setRegisters] = useState([]);
  const [summary, setSummary] = useState(null);
  const [availablePeriods, setAvailablePeriods] = useState({
    sessions: [],
    terms: [],
  });
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    pageSize: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  const [classId, setClassId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [termId, setTermId] = useState("");
  const [status, setStatus] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [committed, setCommitted] = useState({
    classId: "",
    sessionId: "",
    termId: "",
    status: "ALL",
    fromDate: "",
    toDate: "",
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selected, setSelected] = useState(null);

  const [classOptions, setClassOptions] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);

  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  const requestIdRef = useRef(0);

  const buildParams = (overrides = {}) => {
    const params = {
      page: overrides.page ?? page,
      limit: overrides.limit ?? limit,
    };
    if (committed.classId) params.classId = committed.classId;
    if (committed.sessionId) params.sessionId = committed.sessionId;
    if (committed.termId) params.termId = committed.termId;
    if (committed.status !== "ALL") params.status = committed.status;
    if (committed.fromDate) params.fromDate = committed.fromDate;
    if (committed.toDate) params.toDate = committed.toDate;
    return params;
  };

  // Filters are committed after a short pause so typing or stepping a date does
  // not fire a request per keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCommitted({
        classId,
        sessionId,
        termId,
        status,
        fromDate,
        toDate,
      });
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [classId, sessionId, termId, status, fromDate, toDate]);

  useEffect(() => {
    let active = true;
    getClasses()
      .then((response) => {
        if (!active) return;
        const payload = response?.data?.data ?? response?.data ?? response ?? {};
        const data = payload?.data ?? payload;
        const records = Array.isArray(data.classes)
          ? data.classes
          : Array.isArray(data)
            ? data
            : [];
        setClassOptions(
          records
            .map((item) => {
              const id = item.id ?? item._id ?? item.classId;
              const label = [item.classLevel || item.levelName || item.name, item.arm]
                .filter(Boolean)
                .join(" ")
                .trim();
              return id && label ? { id, label } : null;
            })
            .filter(Boolean)
        );
      })
      .catch(() => {
        if (active) setClassOptions([]);
      })
      .finally(() => {
        if (active) setClassesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const requestId = (requestIdRef.current += 1);

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const payload = await getAttendanceHistory(buildParams());

        if (requestId !== requestIdRef.current) return;

        const totalPages = payload?.pagination?.totalPages ?? 0;
        if (page > 1 && page > totalPages) {
          setPage(Math.max(totalPages, 1));
          return;
        }

        setRegisters(Array.isArray(payload?.data) ? payload.data : []);
        setSummary(payload?.summary ?? null);
        setAvailablePeriods({
          sessions: payload?.availablePeriods?.sessions ?? [],
          terms: payload?.availablePeriods?.terms ?? [],
        });
        setPagination({
          totalItems: payload?.pagination?.totalItems ?? 0,
          currentPage: payload?.pagination?.currentPage ?? page,
          pageSize: payload?.pagination?.pageSize ?? limit,
          totalPages,
        });
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        setRegisters([]);
        setSummary(null);
        setPagination({
          totalItems: 0,
          currentPage: 1,
          pageSize: limit,
          totalPages: 0,
        });
        setLoadError(
          error?.response?.data?.message ||
            "We could not load the attendance history. Check your connection and try again."
        );
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [committed, page, limit, refreshToken]);

  const hasActiveFilters =
    Boolean(committed.classId) ||
    Boolean(committed.sessionId) ||
    Boolean(committed.termId) ||
    committed.status !== "ALL" ||
    Boolean(committed.fromDate) ||
    Boolean(committed.toDate);

  // Terms belong to a session, so picking one narrows the other list.
  const termOptions = useMemo(() => {
    if (!committed.sessionId) return availablePeriods.terms;

    return availablePeriods.terms.filter(
      (term) => term.sessionId === committed.sessionId
    );
  }, [availablePeriods.terms, committed.sessionId]);

  const firstRow = pagination.totalItems
    ? (pagination.currentPage - 1) * pagination.pageSize + 1
    : 0;
  const lastRow = Math.min(
    pagination.currentPage * pagination.pageSize,
    pagination.totalItems
  );

  function clearFilters() {
    setClassId("");
    setSessionId("");
    setTermId("");
    setStatus("ALL");
    setFromDate("");
    setToDate("");
    setCommitted({
      classId: "",
      sessionId: "",
      termId: "",
      status: "ALL",
      fromDate: "",
      toDate: "",
    });
    setPage(1);
  }

  async function exportCsv() {
    if (exporting) return;
    setExporting(true);
    setExportMessage("");

    try {
      const { records, truncated } = await collectAllPages(
        async ({ page: pageNum, limit: pageLimit }) => {
          const payload = await getAttendanceHistory(
            buildParams({ page: pageNum, limit: pageLimit })
          );
          return {
            records: Array.isArray(payload?.data) ? payload.data : [],
            totalPages: payload?.pagination?.totalPages,
          };
        },
        { pageSize: 100 }
      );

      if (!records.length) {
        setExportMessage("There are no registers to export for these filters.");
        return;
      }

      const header = [
        "Date",
        "Class",
        "Session",
        "Term",
        "Recorded By",
        "Staff Profile Pending",
        "Total Students",
        "Present",
        "Absent",
        "Unconfirmed",
        "Register Status",
      ];

      const rows = records.map((register) => {
        const summary = register?.attendanceSummary || {};
        return [
          formatDate(register?.attendanceDate),
          getClassLabel(register),
          register?.session?.sessionName || "",
          register?.term?.termName || "",
          getCreatedByName(register),
          register?.createdBy ? (isProfilePending(register.createdBy) ? "YES" : "NO") : "",
          summary.totalStudents ?? "",
          summary.presentCount ?? "",
          summary.absentCount ?? "",
          summary.unconfirmedCount ?? "",
          String(register?.status || "").toUpperCase() === "SUBMITTED" ? "Submitted" : "Draft",
        ];
      });

      downloadFile(
        `\uFEFF${toCsv([header, ...rows])}`,
        `scholanode-attendance-history-${new Date().toISOString().slice(0, 10)}.csv`
      );
      setExportMessage(
        truncated
          ? `Exported the first ${records.length} registers (export limit reached).`
          : `Exported ${records.length} register${records.length === 1 ? "" : "s"}.`
      );
    } catch (error) {
      setExportMessage(
        error?.response?.data?.message || "The export could not be generated. Try again."
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="min-h-full space-y-5 bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-[#071A52]"
          >
            <ArrowLeft size={14} />
            Back to dashboard
          </button>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-600">
            <ClipboardCheck size={14} />
            Attendance · {schoolName}
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#071A52] sm:text-3xl">
            Attendance history
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Every class register recorded across the school. Read-only — corrections are made by each class&apos;s form master.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRefreshToken((value) => value + 1)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={exporting || loading || registers.length === 0}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#123A8F] shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Counts come from the server and cover every register matching the
          filters, so they stay the same as the table is paged. */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Class registers"
          value={summary?.totalRegisters ?? 0}
          hint="Across all pages of this filter"
        />
        <SummaryCard
          label="Present"
          value={summary?.presentCount ?? 0}
          hint={
            summary?.attendanceRate === null ||
            summary?.attendanceRate === undefined
              ? "Nothing marked yet"
              : `${summary.attendanceRate}% of ${summary.markedCount} marked`
          }
          tone="emerald"
        />
        <SummaryCard
          label="Absent"
          value={summary?.absentCount ?? 0}
          hint={
            summary?.markedCount
              ? `${Math.round((100 - summary.attendanceRate) * 10) / 10}% of ${summary.markedCount} marked`
              : "No marks recorded yet"
          }
          tone="rose"
        />
        <SummaryCard
          label="Unmarked"
          value={summary?.unmarkedCount ?? 0}
          hint={
            summary?.totalRecords
              ? `Of ${summary.totalRecords} student slots recorded`
              : "No registers found"
          }
          tone="amber"
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-3 border-b border-slate-100 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label
                htmlFor="history-class"
                className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                Class
              </label>
              <select
                id="history-class"
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
                disabled={classesLoading}
                className={filterSelectClass}
              >
                <option value="">
                  {classesLoading ? "Loading classes…" : "All classes"}
                </option>
                {classOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="history-session"
                className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                Academic session
              </label>
              <select
                id="history-session"
                value={sessionId}
                onChange={(event) => {
                  setSessionId(event.target.value);
                  setTermId("");
                }}
                disabled={availablePeriods.sessions.length === 0}
                className={filterSelectClass}
              >
                <option value="">All sessions</option>
                {availablePeriods.sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.sessionName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="history-term"
                className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                Term
              </label>
              <select
                id="history-term"
                value={termId}
                onChange={(event) => setTermId(event.target.value)}
                disabled={termOptions.length === 0}
                className={filterSelectClass}
              >
                <option value="">All terms</option>
                {termOptions.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.termName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="history-status"
                className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                Register status
              </label>
              <select
                id="history-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={filterSelectClass}
              >
                <option value="ALL">All statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="history-from"
                className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                From
              </label>
              <input
                id="history-from"
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="history-to"
                className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                To
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="history-to"
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(event) => setToDate(event.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    <RotateCcw size={13} />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={12} />
              {committed.fromDate || committed.toDate
                ? `${formatDate(committed.fromDate)} – ${formatDate(committed.toDate)}`
                : "All dates"}
            </span>
            {exportMessage && (
              <span className="font-semibold text-slate-600">{exportMessage}</span>
            )}
          </div>
        </div>

        {loadError ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertCircle size={22} />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-800">
              Attendance history could not be loaded
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">{loadError}</p>
            <button
              type="button"
              onClick={() => setRefreshToken((value) => value + 1)}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#071A52] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#123A8F]"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        ) : loading && registers.length === 0 ? (
          <TableSkeleton />
        ) : registers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ClipboardCheck size={22} />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-800">
              {hasActiveFilters
                ? "No registers match these filters"
                : "No attendance registers yet"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {hasActiveFilters
                ? "Try a wider date range or clear the class and status filters."
                : "Registers appear here once form masters start recording attendance."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={`hidden md:block ${loading ? "opacity-60" : ""}`}>
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Class</th>
                    <th className="px-5 py-3">Session</th>
                    <th className="px-5 py-3">Term</th>
                    <th className="px-5 py-3">Recorded by</th>
                    <th className="px-5 py-3 text-center">P / A / U</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registers.map((register) => {
                    const summary = register?.attendanceSummary || {};
                    return (
                      <tr
                        key={register.id}
                        onClick={() => setSelected(register)}
                        className="group cursor-pointer transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">
                          {formatDate(register.attendanceDate)}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-bold text-[#071A52] group-hover:text-blue-700">
                            {getClassLabel(register)}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">
                          {register?.session?.sessionName || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">
                          {register?.term?.termName || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-700">
                              {getCreatedByName(register)}
                            </span>
                            {isProfilePending(register.createdBy) && <ProfilePendingBadge />}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                            <span className="text-emerald-700">{summary.presentCount ?? 0}</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-rose-700">{summary.absentCount ?? 0}</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-500">{summary.unconfirmedCount ?? 0}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <RegisterStatusBadge status={register.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={`divide-y divide-slate-100 md:hidden ${loading ? "opacity-60" : ""}`}>
              {registers.map((register) => {
                const summary = register?.attendanceSummary || {};
                return (
                  <button
                    key={register.id}
                    type="button"
                    onClick={() => setSelected(register)}
                    className="flex w-full cursor-pointer flex-col gap-2 p-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-[#071A52]">
                        {getClassLabel(register)}
                      </p>
                      <RegisterStatusBadge status={register.status} />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {formatDate(register.attendanceDate)} ·{" "}
                      {register?.session?.sessionName || "—"} ·{" "}
                      {register?.term?.termName || "—"}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      <UserRound size={12} />
                      <span className="font-semibold">
                        {getCreatedByName(register)}
                      </span>
                      {isProfilePending(register.createdBy) && <ProfilePendingBadge />}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="text-emerald-700">
                        {summary.presentCount ?? 0} present
                      </span>
                      <span className="text-rose-700">{summary.absentCount ?? 0} absent</span>
                      <span className="text-slate-500">
                        {summary.unconfirmedCount ?? 0} unconfirmed
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-[11px] text-slate-500">
            {pagination.totalItems > 0 ? (
              <>
                Showing{" "}
                <strong className="text-slate-700">
                  {firstRow}–{lastRow}
                </strong>{" "}
                of <strong className="text-slate-700">{pagination.totalItems}</strong>{" "}
                registers
              </>
            ) : (
              "No registers to show"
            )}
          </p>

          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
              aria-label="Rows per page"
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-600 outline-none focus:border-cyan-500"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>

            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={loading || pagination.currentPage <= 1}
              aria-label="Previous page"
              className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="min-w-20 text-center text-[11px] font-bold text-slate-600">
              Page {pagination.currentPage} of {Math.max(pagination.totalPages, 1)}
            </span>
            <button
              type="button"
              onClick={() => setPage((value) => value + 1)}
              disabled={loading || pagination.currentPage >= pagination.totalPages}
              aria-label="Next page"
              className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {selected && (
        <RegisterDetailModal
          registerId={selected.id}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
