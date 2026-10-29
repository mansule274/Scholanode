import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  History,
  Loader2,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useUserContext } from "../../context/UserContext";
import { getScanHistory } from "./gateScannerApi";

// The API groups scans by the school's day, not the browser's day.
const SCHOOL_TIME_ZONE = "Africa/Lagos";

function getSchoolDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHOOL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function shiftDate(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function getStudentName(record) {
  const names = [record?.student?.user?.firstName, record?.student?.user?.surName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return names || "Unnamed student";
}

function getStudentInitials(record) {
  const first = record?.student?.user?.firstName?.[0] || "";
  const last = record?.student?.user?.surName?.[0] || "";
  return `${first}${last}`.toUpperCase() || "SN";
}

function getClassName(record) {
  const currentClass = record?.student?.currentClass;
  const name = [currentClass?.classLevel, currentClass?.arm]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || "No class";
}

function getOfficerName(record) {
  const names = [record?.scannedBy?.firstName, record?.scannedBy?.surName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return names || "Gate security";
}

function getScanType(record) {
  return String(record?.scanType || "").toUpperCase() === "RETURN"
    ? "RETURN"
    : "ARRIVAL";
}

function ScanTypeBadge({ scanType }) {
  const isReturn = scanType === "RETURN";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${
        isReturn
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isReturn ? "bg-amber-500" : "bg-emerald-500"
        }`}
      />
      {isReturn ? "Return" : "Arrival"}
    </span>
  );
}

function StudentAvatar({ record }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-[11px] font-black text-cyan-900">
      {getStudentInitials(record)}
    </span>
  );
}

function ScanDetailsModal({ record, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Gate scan details"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <StudentAvatar record={record} />
            <div>
              <h2 className="text-base font-extrabold text-[#071A52]">
                {getStudentName(record)}
              </h2>
              <p className="font-mono text-[11px] text-slate-500">
                {record?.student?.admissionNumber || "No admission number"}
              </p>
            </div>
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

        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Gate scan
              </p>
              <div className="mt-1">
                <ScanTypeBadge scanType={getScanType(record)} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recorded
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-800">
                {formatTime(record?.scannedAt)}
              </p>
              <p className="text-[11px] text-slate-500">
                {formatDate(record?.scannedAt)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Class
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {getClassName(record)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Gender
              </p>
              <p className="mt-0.5 text-sm font-semibold capitalize text-slate-800">
                {record?.student?.gender
                  ? String(record.student.gender).toLowerCase()
                  : "—"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Recorded by
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">
              {getOfficerName(record)}
            </p>
            <p className="text-[11px] capitalize text-slate-500">
              {String(record?.scannedBy?.role || "Gate security")
                .toLowerCase()
                .replace(/_/g, " ")}
            </p>
          </div>
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

function TableSkeleton() {
  return (
    <div className="divide-y divide-slate-100" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-4">
          <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-2.5 w-24 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="hidden h-3 w-24 animate-pulse rounded bg-slate-100 sm:block" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function ScanHistoryPage() {
  const navigate = useNavigate();
  const { user, school } = useUserContext();

  const today = useMemo(() => getSchoolDate(), []);
  const schoolName = school?.schoolName || school?.name || "School";
  const isSecurity = String(user?.role || "").toUpperCase() === "SECURITY";

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    pageSize: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [scanType, setScanType] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [myScans, setMyScans] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [refreshToken, setRefreshToken] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const requestId = (requestIdRef.current += 1);
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setLoadError("");

      try {
        const payload = await getScanHistory({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          scanType,
          search,
          myScans: isSecurity ? myScans : false,
          page,
          limit,
        });

        if (requestId !== requestIdRef.current) return;

        const totalPages = payload?.pagination?.totalPages ?? 0;
        if (page > 1 && page > totalPages) {
          setPage(Math.max(totalPages, 1));
          return;
        }

        setRecords(Array.isArray(payload?.data) ? payload.data : []);
        setPagination({
          totalItems: payload?.pagination?.totalItems ?? 0,
          currentPage: payload?.pagination?.currentPage ?? page,
          pageSize: payload?.pagination?.pageSize ?? limit,
          totalPages: payload?.pagination?.totalPages ?? 0,
        });
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        setRecords([]);
        setPagination({
          totalItems: 0,
          currentPage: 1,
          pageSize: limit,
          totalPages: 0,
        });
        setLoadError(
          error?.response?.data?.message ||
            "We could not load the scan history. Check your connection and try again."
        );
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    startDate,
    endDate,
    scanType,
    search,
    myScans,
    isSecurity,
    page,
    limit,
    refreshToken,
  ]);

  const hasActiveFilters =
    startDate !== today ||
    endDate !== today ||
    scanType !== "ALL" ||
    Boolean(search) ||
    myScans;

  const rangeLabel =
    (startDate || today) === (endDate || today)
      ? formatDate(`${startDate || today}T00:00:00`)
      : `${formatDate(`${startDate || today}T00:00:00`)} – ${formatDate(
          `${endDate || today}T00:00:00`
        )}`;

  const firstRow = pagination.totalItems
    ? (pagination.currentPage - 1) * pagination.pageSize + 1
    : 0;
  const lastRow = Math.min(
    pagination.currentPage * pagination.pageSize,
    pagination.totalItems
  );

  function applyQuickRange(kind) {
    setPage(1);
    if (kind === "today") {
      setStartDate(today);
      setEndDate(today);
      return;
    }
    if (kind === "week") {
      setStartDate(shiftDate(today, -6));
      setEndDate(today);
      return;
    }
    setStartDate(`${today.slice(0, 7)}-01`);
    setEndDate(today);
  }

  function clearFilters() {
    setStartDate(today);
    setEndDate(today);
    setScanType("ALL");
    setSearchInput("");
    setMyScans(false);
    setPage(1);
  }

  async function exportCsv() {
    if (exporting) return;

    setExporting(true);
    setExportMessage("");

    try {
      const collected = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const payload = await getScanHistory({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          scanType,
          search,
          myScans: isSecurity ? myScans : false,
          page: currentPage,
          limit: 100,
        });

        collected.push(...(Array.isArray(payload?.data) ? payload.data : []));
        totalPages = payload?.pagination?.totalPages ?? 1;
        currentPage += 1;
      } while (currentPage <= totalPages);

      if (!collected.length) {
        setExportMessage("There are no scans to export for these filters.");
        return;
      }

      const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
      const header = [
        "Date",
        "Time",
        "Student",
        "Admission Number",
        "Class",
        "Scan Type",
        "Recorded By",
      ];

      const rows = collected.map((record) => [
        formatDate(record.scannedAt),
        formatTime(record.scannedAt),
        getStudentName(record),
        record?.student?.admissionNumber || "",
        getClassName(record),
        getScanType(record) === "RETURN" ? "Return" : "Arrival",
        getOfficerName(record),
      ]);

      const csv = [header, ...rows]
        .map((row) => row.map(escapeCsv).join(","))
        .join("\n");
      const blob = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scholanode-gate-scans-${today}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setExportMessage(`Exported ${collected.length} scan${collected.length === 1 ? "" : "s"}.`);
    } catch (error) {
      setExportMessage(
        error?.response?.data?.message || "The export could not be generated. Try again."
      );
    } finally {
      setExporting(false);
    }
  }

  const tableRows = records.map((record) => (
    <tr
      key={record.id}
      onClick={() => setSelectedRecord(record)}
      className="group cursor-pointer transition hover:bg-slate-50/70"
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <StudentAvatar record={record} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#071A52] group-hover:text-blue-700">
              {getStudentName(record)}
            </p>
            <p className="truncate font-mono text-[11px] text-slate-500">
              {record?.student?.admissionNumber || "—"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">
        {getClassName(record)}
      </td>
      <td className="px-5 py-3.5">
        <p className="text-sm font-bold text-slate-800">
          {formatTime(record.scannedAt)}
        </p>
        <p className="text-[11px] text-slate-500">
          {formatDate(record.scannedAt)}
        </p>
      </td>
      <td className="px-5 py-3.5">
        <ScanTypeBadge scanType={getScanType(record)} />
      </td>
      <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">
        {getOfficerName(record)}
      </td>
      <td className="px-5 py-3.5 text-right">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setSelectedRecord(record);
          }}
          className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold text-[#123A8F] transition hover:bg-blue-50"
        >
          Details
        </button>
      </td>
    </tr>
  ));

  const mobileCards = records.map((record) => (
    <button
      key={record.id}
      type="button"
      onClick={() => setSelectedRecord(record)}
      className="flex w-full cursor-pointer items-center gap-3 p-4 text-left transition hover:bg-slate-50"
    >
      <StudentAvatar record={record} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-bold text-[#071A52]">
            {getStudentName(record)}
          </p>
          <ScanTypeBadge scanType={getScanType(record)} />
        </div>
        <p className="mt-0.5 truncate text-[11px] text-slate-500">
          {record?.student?.admissionNumber || "—"} · {getClassName(record)}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          {formatDate(record.scannedAt)} · {formatTime(record.scannedAt)} ·{" "}
          {getOfficerName(record)}
        </p>
      </div>
    </button>
  ));

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
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-700">
            <History size={14} />
            Gate operations · {schoolName}
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#071A52] sm:text-3xl">
            Scan History
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Every student recorded at the gate, newest first.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/verify-student")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#071A52] to-[#123A8F] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
          >
            <QrCode size={15} />
            Scan a student
          </button>
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
            disabled={exporting}
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

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-3 border-b border-slate-100 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search student name or admission number..."
                maxLength={100}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <select
              value={scanType}
              onChange={(event) => {
                setScanType(event.target.value);
                setPage(1);
              }}
              aria-label="Scan type"
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="ALL">All scans</option>
              <option value="ARRIVAL">Arrivals only</option>
              <option value="RETURN">Returns only</option>
            </select>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label
                htmlFor="scan-start-date"
                className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                From
              </label>
              <input
                id="scan-start-date"
                type="date"
                value={startDate}
                max={endDate || today}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setPage(1);
                }}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div>
              <label
                htmlFor="scan-end-date"
                className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                To
              </label>
              <input
                id="scan-end-date"
                type="date"
                value={endDate}
                min={startDate || undefined}
                max={today}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setPage(1);
                }}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              {[
                { key: "today", label: "Today" },
                { key: "week", label: "7 days" },
                { key: "month", label: "This month" },
              ].map((range) => (
                <button
                  key={range.key}
                  type="button"
                  onClick={() => applyQuickRange(range.key)}
                  className="cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition hover:bg-white hover:text-[#071A52]"
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              {isSecurity && (
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600">
                  <input
                    type="checkbox"
                    checked={myScans}
                    onChange={(event) => {
                      setMyScans(event.target.checked);
                      setPage(1);
                    }}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                  />
                  My scans
                </label>
              )}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <RotateCcw size={13} />
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={12} />
              {rangeLabel}
            </span>
            {search && <span>Search: “{search}”</span>}
            {isSecurity && myScans && <span>Only my scans</span>}
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
              Scan history could not be loaded
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              {loadError}
            </p>
            <button
              type="button"
              onClick={() => setRefreshToken((value) => value + 1)}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#071A52] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#123A8F]"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        ) : loading && records.length === 0 ? (
          <TableSkeleton />
        ) : records.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <History size={22} />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-800">
              {hasActiveFilters
                ? "No scans match these filters"
                : "No scans recorded today"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {hasActiveFilters
                ? "Try a wider date range or clear the search."
                : "Scans will appear here as soon as the gate records a student."}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/verify-student")}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#071A52] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#123A8F]"
              >
                <QrCode size={14} />
                Scan a student
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={`hidden md:block ${loading ? "opacity-60" : ""}`}>
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Class</th>
                    <th className="px-5 py-3">Date &amp; time</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Recorded by</th>
                    <th className="px-5 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">{tableRows}</tbody>
              </table>
            </div>

            <div
              className={`divide-y divide-slate-100 md:hidden ${
                loading ? "opacity-60" : ""
              }`}
            >
              {mobileCards}
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
                scans
              </>
            ) : (
              "No scans to show"
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
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-600 outline-none focus:border-blue-500"
            >
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
              disabled={
                loading || pagination.currentPage >= pagination.totalPages
              }
              aria-label="Next page"
              className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {selectedRecord && (
        <ScanDetailsModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
