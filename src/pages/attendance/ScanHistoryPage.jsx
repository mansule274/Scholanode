import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  History,
  Info,
  QrCode,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useUserContext } from "../../context/UserContext";

const SCAN_STORAGE_KEY = "scholanode:gate-scan-records";
const LEGACY_SCANS_KEY = "scholanode_gate_scan_records_v1";

const readStorage = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    if (!val) return fallback;
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const formatTime = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
};

function StatusBadge({ status, direction }) {
  if (status === "SUCCESS" || status === "VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={13} />
        {direction === "EXIT" ? "Exit Approved" : "Verified"}
      </span>
    );
  }

  if (status === "DUPLICATE" || status === "ALREADY_VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
        <Info size={13} />
        Repeat Scan
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
      <XCircle size={13} />
      Flagged
    </span>
  );
}

function MethodBadge({ method }) {
  const isQr = String(method || "").toUpperCase().includes("QR");
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold ${
        isQr ? "bg-cyan-50 text-cyan-800 border border-cyan-100" : "bg-slate-100 text-slate-700 border border-slate-200"
      }`}
    >
      {isQr ? <QrCode size={12} /> : <Search size={12} />}
      {isQr ? "QR Scan" : "Manual"}
    </span>
  );
}

function ScanDetailsModal({ record, onClose }) {
  if (!record) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              <History size={15} />
              Gate Scan Verification Details
            </div>
            <h2 className="mt-1 text-xl font-extrabold text-[#071A52]">
              {record.studentName || "Student Record"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 font-mono">
              {record.admissionNumber || "No admission ID"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Scan Status</p>
              <div className="mt-1">
                <StatusBadge status={record.status} direction={record.direction} />
              </div>
            </div>
            <MethodBadge method={record.method} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 p-3.5">
              <p className="text-xs text-slate-400">Class</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{record.className || "—"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5">
              <p className="text-xs text-slate-400">Direction</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {record.direction === "EXIT" ? "Departure / Exit" : "Arrival / Entry"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5">
              <p className="text-xs text-slate-400">Scan Date</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(record.scannedAt || record.date)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5">
              <p className="text-xs text-slate-400">Scan Time</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{formatTime(record.scannedAt)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3.5">
            <p className="text-xs text-slate-400">Verifying Officer</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{record.scannerName || "Gate Security"}</p>
          </div>

          {record.message && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Log Message</p>
              <p className="mt-1 text-sm text-slate-700">{record.message}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 p-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#071A52] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123A8F] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScanHistoryPage() {
  const navigate = useNavigate();
  const { school } = useUserContext();

  const [scanRecords, setScanRecords] = useState(() => {
    const modern = readStorage(SCAN_STORAGE_KEY, null);
    if (modern && Array.isArray(modern)) return modern;
    return readStorage(LEGACY_SCANS_KEY, []);
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const schoolName = school?.schoolName || "FEDERAL UNIVERSITY DUTSE";

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return [...scanRecords]
      .filter((record) => {
        if (statusFilter !== "ALL" && record.status !== statusFilter) return false;
        if (methodFilter !== "ALL" && record.method !== methodFilter) return false;

        if (query) {
          const matchString = `${record.studentName} ${record.admissionNumber} ${record.className} ${record.scannerName} ${record.message}`.toLowerCase();
          if (!matchString.includes(query)) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
  }, [scanRecords, searchTerm, statusFilter, methodFilter]);

  const handleRefresh = () => {
    const modern = readStorage(SCAN_STORAGE_KEY, null);
    if (modern && Array.isArray(modern)) {
      setScanRecords(modern);
    } else {
      setScanRecords(readStorage(LEGACY_SCANS_KEY, []));
    }
  };

  const exportCsv = () => {
    const headers = [
      "Student Name",
      "Admission Number",
      "Class",
      "Direction",
      "Date",
      "Time",
      "Method",
      "Status",
      "Scanner",
      "Details",
    ];

    const escapeCsv = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;

    const rows = filteredRecords.map((r) => [
      r.studentName,
      r.admissionNumber,
      r.className,
      r.direction || "ENTRY",
      r.date || formatDate(r.scannedAt),
      formatTime(r.scannedAt),
      r.method,
      r.status,
      r.scannerName,
      r.message,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scholanode-gate-scans-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full space-y-6 bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#071A52] transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
            <History size={16} />
            Gate Operations · {schoolName}
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#071A52] sm:text-3xl">
            Gate Scan History
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete real-time log of student gate arrivals and departures captured by security personnel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/verify-student")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#071A52] to-[#123A8F] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110 cursor-pointer"
          >
            <QrCode size={15} />
            Scan Next Student
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#123A8F] shadow-sm transition hover:bg-blue-50 cursor-pointer"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Search & Filters */}
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:p-5 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, admission number, class or officer..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs sm:text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Verified / Approved</option>
              <option value="DUPLICATE">Repeat Scans</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
            </select>
          </div>

          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs sm:text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 cursor-pointer"
            >
              <option value="ALL">All Scan Methods</option>
              <option value="QR">QR Code Scanner</option>
              <option value="MANUAL">Manual Admission Lookups</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Student Details</th>
                <th className="px-5 py-3.5">Class</th>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Method</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Officer</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="group transition hover:bg-slate-50/70 cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#071A52] group-hover:text-blue-700">
                      {record.studentName || "—"}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {record.admissionNumber || "—"}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {record.className || "—"}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{formatTime(record.scannedAt)}</p>
                    <p className="text-[11px] text-slate-400">{formatDate(record.scannedAt || record.date)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <MethodBadge method={record.method} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={record.status} direction={record.direction} />
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                    {record.scannerName || "Security"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecord(record);
                      }}
                      className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#123A8F] hover:bg-blue-50 transition cursor-pointer"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <History size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-700">No scan records match your filter</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing your search or status filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="divide-y divide-slate-100 md:hidden">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              onClick={() => setSelectedRecord(record)}
              className="p-4 space-y-2 hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-sm text-[#071A52]">{record.studentName}</p>
                  <p className="text-xs text-slate-500 font-mono">{record.admissionNumber} · {record.className}</p>
                </div>
                <StatusBadge status={record.status} direction={record.direction} />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>{formatDate(record.scannedAt)} {formatTime(record.scannedAt)}</span>
                <MethodBadge method={record.method} />
              </div>
            </div>
          ))}

          {filteredRecords.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching gate records found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 text-xs text-slate-500 sm:flex-row sm:items-center">
          <span>
            Showing <strong className="text-slate-700">{filteredRecords.length}</strong> of{" "}
            <strong className="text-slate-700">{scanRecords.length}</strong> recorded gate scans
          </span>
          <span className="text-[11px] text-slate-400">
            ScholaNode Gate Access & Security Operations
          </span>
        </div>
      </section>

      {/* Details Modal */}
      <ScanDetailsModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}
