import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  Fingerprint,
  History,
  Info,
  Keyboard,
  Phone,
  QrCode,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";
import { useUserContext } from "../../context/UserContext";

const STUDENTS_STORAGE_KEY = "scholanode:gate-scan-students";
const SCANS_STORAGE_KEY = "scholanode:gate-scan-records";
const LEGACY_SCANS_KEY = "scholanode_gate_scan_records_v1";

const DEMO_STUDENTS = [
  {
    id: "STU001",
    firstName: "Amina",
    surName: "Yusuf",
    admissionNumber: "SN/2026/001",
    className: "Primary 4 Gold",
    gender: "Female",
    parentId: "PAR001",
    parentName: "Musa Yusuf",
    parentPhone: "0803 111 2200",
    relationship: "Daughter",
    qrCode: "SCHOLA-SN-2026-001",
    avatar: "bg-fuchsia-100 text-fuchsia-700",
  },
  {
    id: "STU002",
    firstName: "Ibrahim",
    surName: "Yusuf",
    admissionNumber: "SN/2026/002",
    className: "Primary 6 Blue",
    gender: "Male",
    parentId: "PAR001",
    parentName: "Musa Yusuf",
    parentPhone: "0803 111 2200",
    relationship: "Son",
    qrCode: "SCHOLA-SN-2026-002",
    avatar: "bg-sky-100 text-sky-700",
  },
  {
    id: "STU003",
    firstName: "Fatima",
    surName: "Yusuf",
    admissionNumber: "SN/2026/003",
    className: "Primary 2 Green",
    gender: "Female",
    parentId: "PAR001",
    parentName: "Musa Yusuf",
    parentPhone: "0803 111 2200",
    relationship: "Daughter",
    qrCode: "SCHOLA-SN-2026-003",
    avatar: "bg-amber-100 text-amber-700",
  },
  {
    id: "STU004",
    firstName: "Abdullahi",
    surName: "Yusuf",
    admissionNumber: "SN/2026/004",
    className: "Nursery 2",
    gender: "Male",
    parentId: "PAR001",
    parentName: "Musa Yusuf",
    parentPhone: "0803 111 2200",
    relationship: "Son",
    qrCode: "SCHOLA-SN-2026-004",
    avatar: "bg-orange-100 text-orange-700",
  },
  {
    id: "STU005",
    firstName: "Yusuf",
    surName: "Bello",
    admissionNumber: "SN/2026/005",
    className: "Primary 5 Gold",
    gender: "Male",
    parentId: "PAR002",
    parentName: "Aisha Bello",
    parentPhone: "0806 333 4400",
    relationship: "Son",
    qrCode: "SCHOLA-SN-2026-005",
    avatar: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "STU006",
    firstName: "Maryam",
    surName: "Sani",
    admissionNumber: "SN/2026/006",
    className: "JSS 1 A",
    gender: "Female",
    parentId: "PAR003",
    parentName: "Abubakar Sani",
    parentPhone: "0802 555 6600",
    relationship: "Daughter",
    qrCode: "SCHOLA-SN-2026-006",
    avatar: "bg-violet-100 text-violet-700",
  },
];

function readLocalStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function getFullName(student) {
  if (!student) return "";
  return `${student.firstName || ""} ${student.surName || ""}`.trim();
}

function getInitials(student) {
  if (!student) return "SN";
  const first = student.firstName?.[0] || "";
  const last = student.surName?.[0] || "";
  return `${first}${last}`.toUpperCase() || "SN";
}

function getTodayKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function playAudioChime(type = "success") {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(370, ctx.currentTime);
      osc.frequency.setValueAtTime(280, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {
    // Audio synthesis blocked by autoplay policy
  }
}

function StudentAvatar({ student, size = "md" }) {
  const sizeClass =
    size === "lg"
      ? "h-16 w-16 text-lg rounded-2xl"
      : size === "sm"
      ? "h-10 w-10 text-xs rounded-xl"
      : "h-12 w-12 text-sm rounded-xl";

  return (
    <div
      className={`flex shrink-0 items-center justify-center font-black shadow-sm ${sizeClass} ${
        student?.avatar || "bg-cyan-100 text-cyan-800"
      }`}
    >
      {getInitials(student)}
    </div>
  );
}

function StatusBadge({ status, direction = "ENTRY" }) {
  if (status === "SUCCESS" || status === "VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={13} />
        {direction === "EXIT" ? "Exit Approved" : "Gate Entry Verified"}
      </span>
    );
  }

  if (status === "DUPLICATE" || status === "ALREADY_VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
        <Info size={13} />
        Repeat Scan
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
      <XCircle size={13} />
      Not Found
    </span>
  );
}

export default function VerifyStudent() {
  const navigate = useNavigate();
  const { user, school } = useUserContext();

  const officerName = useMemo(() => {
    if (user?.firstName || user?.surName) {
      return `${user.firstName || ""} ${user.surName || ""}`.trim();
    }
    if (user?.fullName || user?.name) {
      return user.fullName || user.name;
    }
    return "Security Officer";
  }, [user]);

  const officerLoginId = user?.loginId || "SEC/0001";
  const schoolName = school?.schoolName || "FEDERAL UNIVERSITY DUTSE";
  const schoolCode = school?.schoolCode || "FUD";

  // Persistent student roster & scan logs
  const [students] = useState(() => readLocalStorage(STUDENTS_STORAGE_KEY, DEMO_STUDENTS));
  const [scanRecords, setScanRecords] = useState(() => {
    const modern = readLocalStorage(SCANS_STORAGE_KEY, null);
    if (modern && Array.isArray(modern)) return modern;
    return readLocalStorage(LEGACY_SCANS_KEY, []);
  });

  // UI state
  const [mode, setMode] = useState("qr"); // "qr" | "admission" | "search"
  const [direction, setDirection] = useState("ENTRY"); // "ENTRY" | "EXIT"
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Search inputs
  const [qrValue, setQrValue] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [directorySearch, setDirectorySearch] = useState("");

  // Result state
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [familySelections, setFamilySelections] = useState({});
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  const inputRef = useRef(null);

  // Sync scan records to localStorage across both keys
  useEffect(() => {
    try {
      localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(scanRecords));
      localStorage.setItem(LEGACY_SCANS_KEY, JSON.stringify(scanRecords));
    } catch {
      // Storage unavailable
    }
  }, [scanRecords]);

  const todayKey = getTodayKey();

  const todayRecords = useMemo(() => {
    return scanRecords.filter((r) => r.date === todayKey || r.dateKey === todayKey);
  }, [scanRecords, todayKey]);

  const verifiedTodayCount = useMemo(() => {
    return new Set(
      todayRecords
        .filter((r) => r.status === "SUCCESS" || r.status === "VERIFIED")
        .map((r) => r.studentId)
    ).size;
  }, [todayRecords]);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Family siblings who share the same parentId
  const familyMembers = useMemo(() => {
    if (!selectedStudent || !selectedStudent.parentId) return [];
    return students.filter(
      (s) => s.parentId === selectedStudent.parentId && s.id !== selectedStudent.id
    );
  }, [students, selectedStudent]);

  // Check if student has already scanned today in the same direction
  function getTodayScan(studentId, dir = direction) {
    return todayRecords.find(
      (r) =>
        r.studentId === studentId &&
        (r.status === "SUCCESS" || r.status === "VERIFIED") &&
        (!r.direction || r.direction === dir)
    );
  }

  function handleLookup(query, method = "QR") {
    const term = String(query || "").trim().toLowerCase();
    setMessage("");

    if (!term) {
      setMessage("Please enter or scan student credentials first.");
      setResult(null);
      return;
    }

    const found = students.find((s) => {
      const matchAdm = s.admissionNumber?.toLowerCase() === term;
      const matchQr = s.qrCode?.toLowerCase() === term;
      const matchCode = `${schoolCode}/${s.admissionNumber}`.toLowerCase() === term;
      return matchAdm || matchQr || matchCode;
    });

    if (!found) {
      if (soundEnabled) playAudioChime("warning");
      setSelectedStudentId("");
      setFamilySelections({});
      setResult({
        status: "NOT_FOUND",
        method,
        value: query.trim(),
      });
      return;
    }

    const prevScan = getTodayScan(found.id, direction);

    setSelectedStudentId(found.id);
    setFamilySelections({});
    setResult({
      status: "FOUND",
      method,
      value: query.trim(),
      studentId: found.id,
      alreadyVerified: Boolean(prevScan),
      lastScanTime: prevScan ? formatTime(prevScan.scannedAt) : null,
    });

    if (soundEnabled) {
      playAudioChime(prevScan ? "warning" : "success");
    }
  }

  function confirmVerification() {
    if (!selectedStudent || result?.status !== "FOUND") return;

    const selectedSiblings = familyMembers.filter((s) => familySelections[s.id]);
    const studentsToProcess = [selectedStudent, ...selectedSiblings];

    const nowIso = new Date().toISOString();
    const newRecords = studentsToProcess.map((st) => {
      const prev = getTodayScan(st.id, direction);
      return {
        id: `SCAN-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        studentId: st.id,
        studentName: getFullName(st),
        admissionNumber: st.admissionNumber,
        className: st.className,
        date: todayKey,
        dateKey: todayKey,
        scannedAt: nowIso,
        method: result.method === "QR" ? "QR" : "MANUAL",
        direction,
        status: prev ? "DUPLICATE" : "SUCCESS",
        scannerName: `${officerName} (${officerLoginId})`,
        message: prev
          ? `Repeat ${direction === "ENTRY" ? "arrival" : "exit"} recorded.`
          : `${direction === "ENTRY" ? "Gate entry" : "Gate exit"} verified successfully.`,
        parentNotification: "SIMULATED",
      };
    });

    setScanRecords((prev) => [...newRecords, ...prev]);

    setResult({
      ...result,
      status: "VERIFIED",
      verifiedIds: studentsToProcess.map((s) => s.id),
      processedRecords: newRecords,
    });

    if (soundEnabled) playAudioChime("success");

    setMessage(
      studentsToProcess.length === 1
        ? `${getFullName(selectedStudent)} has been recorded at the gate.`
        : `${studentsToProcess.length} students have been recorded at the gate together.`
    );
  }

  function resetToScanNext() {
    setResult(null);
    setMessage("");
    setQrValue("");
    setAdmissionNumber("");
    setSelectedStudentId("");
    setFamilySelections({});
    if (inputRef.current) inputRef.current.focus();
  }

  const filteredHistory = useMemo(() => {
    const search = historySearch.trim().toLowerCase();
    const list = [...scanRecords].sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt));
    if (!search) return list.slice(0, 15);
    return list
      .filter((r) =>
        [r.studentName, r.admissionNumber, r.className, r.method, r.scannerName].some((val) =>
          String(val || "").toLowerCase().includes(search)
        )
      )
      .slice(0, 15);
  }, [scanRecords, historySearch]);

  const filteredDirectory = useMemo(() => {
    const q = directorySearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [getFullName(s), s.admissionNumber, s.className, s.parentName].some((val) =>
        String(val || "").toLowerCase().includes(q)
      )
    );
  }, [students, directorySearch]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(73,166,255,0.08),_transparent_40%),#f8fafc] px-4 py-6 sm:px-6 lg:px-8 text-slate-800">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Top Navigation & Status Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft size={16} />
              Dashboard
            </button>
            <div className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Gate Terminal Online · {officerLoginId}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direction Toggle */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setDirection("ENTRY");
                  setResult(null);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  direction === "ENTRY"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ArrowDownLeft size={14} />
                Arrival / Entry
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirection("EXIT");
                  setResult(null);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  direction === "EXIT"
                    ? "bg-[#071A52] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ArrowUpRight size={14} />
                Dismissal / Exit
              </button>
            </div>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              title={soundEnabled ? "Sound enabled" : "Sound muted"}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50 cursor-pointer"
            >
              {soundEnabled ? <Volume2 size={16} className="text-emerald-600" /> : <VolumeX size={16} className="text-slate-400" />}
            </button>

            {/* History Toggle */}
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
            >
              <History size={15} />
              {showHistory ? "Hide Log" : "Live Log"}
            </button>
          </div>
        </div>

        {/* High Impact Banner */}
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#061541] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-[0_20px_50px_-25px_rgba(7,26,82,0.6)] sm:p-8">
          <div className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border-[40px] border-white/[0.05]" />
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-cyan-200 backdrop-blur-md">
                  <ShieldCheck size={14} />
                  {schoolName}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md ${
                  direction === "ENTRY" ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30" : "bg-cyan-400/20 text-cyan-200 border border-cyan-400/30"
                }`}>
                  {direction === "ENTRY" ? "Morning Entry Gate" : "Dismissal Exit Gate"}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                Verify Student Gate Pass
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                Gate Officer <span className="font-bold text-white">{officerName}</span> ({officerLoginId}). Scan digital student ID, verify photo and admission status, and optionally verify attending siblings arriving together.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 sm:min-w-64">
              <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Today Verified</p>
                  <UserCheck size={16} className="text-emerald-300" />
                </div>
                <p className="mt-2 text-3xl font-black tabular-nums">{verifiedTodayCount}</p>
                <p className="text-[11px] text-blue-200/80">Active students</p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Total Scans</p>
                  <Clock3 size={16} className="text-cyan-300" />
                </div>
                <p className="mt-2 text-3xl font-black tabular-nums">{todayRecords.length}</p>
                <p className="text-[11px] text-blue-200/80">Arrival logs</p>
              </div>
            </div>
          </div>
        </section>

        {/* Verification Core Layout */}
        <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">

          {/* LEFT COLUMN: Input & Scanner Workstation */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-[#071A52]">Gate Scanner & Lookup</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Choose scanning method or search student record.</p>
                </div>

                {/* Mode Selector Tabs */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("qr");
                      setMessage("");
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      mode === "qr" ? "bg-white text-[#071A52] shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <QrCode size={14} />
                    QR Scanner
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("admission");
                      setMessage("");
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      mode === "admission" ? "bg-white text-[#071A52] shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Keyboard size={14} />
                    Admission No
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("search");
                      setMessage("");
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      mode === "search" ? "bg-white text-[#071A52] shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Search size={14} />
                    Roster
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-6">

              {/* MODE 1: QR CODE SCANNER */}
              {mode === "qr" && (
                <>
                  <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-cyan-300 bg-gradient-to-b from-cyan-50/70 via-slate-50 to-white p-6 sm:p-8">
                    {/* Viewfinder Target */}
                    <div className="relative mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-2xl border-2 border-cyan-400 bg-white/90 shadow-lg shadow-cyan-500/10 backdrop-blur-sm sm:h-52 sm:w-52">
                      {/* Corner Target Markers */}
                      <span className="absolute -left-1 -top-1 h-4 w-4 border-l-4 border-t-4 border-[#071A52]" />
                      <span className="absolute -right-1 -top-1 h-4 w-4 border-r-4 border-t-4 border-[#071A52]" />
                      <span className="absolute -bottom-1 -left-1 h-4 w-4 border-b-4 border-l-4 border-[#071A52]" />
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 border-b-4 border-r-4 border-[#071A52]" />

                      {/* Animated Laser Scanning Line */}
                      <div className="absolute inset-x-2 top-0 h-1 rounded-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_12px_#06b6d4] animate-[bounce_2.4s_infinite]" />

                      <QrCode size={80} strokeWidth={1.2} className="text-[#071A52]/80" />

                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cyan-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-cyan-800">
                        <Camera size={11} /> Ready to Scan
                      </div>
                    </div>

                    <p className="mt-4 text-center text-xs text-slate-500">
                      Scan student badge with a barcode gun or camera, or enter payload below:
                    </p>

                    {/* Barcode / Gun Scanner Input */}
                    <div className="mx-auto mt-4 flex max-w-md gap-2">
                      <div className="relative flex-1">
                        <input
                          ref={inputRef}
                          type="text"
                          value={qrValue}
                          onChange={(e) => setQrValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleLookup(qrValue, "QR");
                          }}
                          placeholder="e.g. SCHOLA-SN-2026-001"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-mono text-slate-800 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLookup(qrValue, "QR")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#071A52] to-[#123A8F] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 cursor-pointer"
                      >
                        <Search size={16} />
                        Verify
                      </button>
                    </div>
                  </div>

                  {/* Sample Badge Chips for Quick Testing */}
                  <div>
                    <div className="mb-2.5 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Interactive Test Badges
                      </h3>
                      <span className="text-[11px] text-slate-400">Click to simulate instant badge tap</span>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {students.slice(0, 4).map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setQrValue(st.qrCode);
                            handleLookup(st.qrCode, "QR");
                          }}
                          className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-cyan-400 hover:bg-cyan-50/40 hover:shadow-sm cursor-pointer"
                        >
                          <StudentAvatar student={st} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-[#071A52] group-hover:text-cyan-900">
                              {getFullName(st)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {st.admissionNumber} · {st.className}
                            </p>
                          </div>
                          <ArrowRight size={14} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-600" />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* MODE 2: ADMISSION NUMBER LOOKUP */}
              {mode === "admission" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-800 shadow-sm">
                      <Fingerprint size={28} />
                    </div>
                    <h3 className="mt-3 font-extrabold text-[#071A52]">Manual Admission Number Search</h3>
                    <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                      Use this when a student does not have their QR badge or the code is damaged.
                    </p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleLookup(admissionNumber, "Admission number");
                      }}
                      className="mx-auto mt-4 max-w-md space-y-3"
                    >
                      <input
                        type="text"
                        value={admissionNumber}
                        onChange={(e) => setAdmissionNumber(e.target.value)}
                        placeholder="e.g. SN/2026/001"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50"
                      />
                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123A8F] cursor-pointer"
                      >
                        <Search size={16} />
                        Lookup Student
                      </button>
                    </form>
                  </div>

                  {/* Fast picks */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
                    <p className="text-xs font-bold text-[#071A52]">Quick Pick Student Numbers:</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {students.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setAdmissionNumber(st.admissionNumber);
                            handleLookup(st.admissionNumber, "Admission number");
                          }}
                          className="rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-900 transition hover:border-cyan-400 hover:bg-cyan-50 cursor-pointer"
                        >
                          {st.admissionNumber} ({st.firstName})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 3: DIRECTORY ROSTER SEARCH */}
              {mode === "search" && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={directorySearch}
                      onChange={(e) => setDirectorySearch(e.target.value)}
                      placeholder="Search student by name, class, or parent..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50"
                    />
                  </div>

                  <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                    {filteredDirectory.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleLookup(st.admissionNumber, "Roster select")}
                        className="flex w-full items-center justify-between p-3 text-left transition hover:bg-cyan-50/50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <StudentAvatar student={st} size="sm" />
                          <div>
                            <p className="text-sm font-bold text-[#071A52]">{getFullName(st)}</p>
                            <p className="text-xs text-slate-500">{st.admissionNumber} · {st.className}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-cyan-700">Select</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* System Feedback Message */}
              {message && (
                <div className="flex items-start gap-2.5 rounded-xl border border-cyan-200 bg-cyan-50/80 p-3.5 text-xs font-semibold text-cyan-900">
                  <Info size={16} className="mt-0.5 shrink-0 text-cyan-700" />
                  <span>{message}</span>
                </div>
              )}

              {/* Error: Not Found */}
              {result?.status === "NOT_FOUND" && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4">
                  <XCircle size={22} className="mt-0.5 text-rose-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-800">Student Not Found</h4>
                    <p className="mt-0.5 text-xs text-rose-700">
                      No registered student in {schoolCode} matches "{result.value}". Please check admission number or verify with administration.
                    </p>
                    <button
                      type="button"
                      onClick={() => setResult(null)}
                      className="mt-2 text-xs font-bold text-rose-800 underline hover:text-rose-900 cursor-pointer"
                    >
                      Clear and try again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT COLUMN: Verification Pass & Family Sibling Detection */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-[#071A52]">Verification Card</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Student credential review & sibling group pass.</p>
                </div>
                {result && <StatusBadge status={result.status} direction={direction} />}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {!selectedStudent || !result || result.status === "NOT_FOUND" ? (
                /* Empty State */
                <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
                    <UserRound size={32} />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-slate-700">Awaiting Student Badge</h3>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                    Scan a student QR badge or enter their admission number. Their full verified card and linked family members will appear here.
                  </p>
                </div>
              ) : (
                /* Active Verified Card */
                <div className="space-y-5">
                  {/* Primary Student Hero Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/40 p-5">
                    <div className="flex items-start gap-4">
                      <StudentAvatar student={selectedStudent} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-[#071A52]">
                            {getFullName(selectedStudent)}
                          </h3>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                            {selectedStudent.className}
                          </span>
                        </div>
                        <p className="text-xs font-mono font-bold text-slate-600 mt-1">
                          {selectedStudent.admissionNumber}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {schoolName} · Verified Pupil
                        </p>
                      </div>
                    </div>

                    {/* Guardian & Emergency Phone */}
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-blue-100/80 pt-3.5">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Parent / Guardian</p>
                        <p className="mt-0.5 text-xs font-bold text-slate-800">{selectedStudent.parentName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact Number</p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Phone size={11} className="text-slate-400" />
                          <span>{selectedStudent.parentPhone || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning: Repeated Scan Detection */}
                  {result.alreadyVerified && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/90 p-4">
                      <ShieldAlert size={18} className="mt-0.5 text-amber-700 shrink-0" />
                      <div className="text-xs text-amber-900">
                        <p className="font-bold">Notice: Prior Scan Detected Today</p>
                        <p className="mt-0.5 text-amber-800">
                          This student was already recorded at the gate at <span className="font-semibold">{result.lastScanTime}</span>. You can still confirm if this is an authorized re-entry.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Family / Sibling Detection */}
                  {familyMembers.length > 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#071A52]">
                            Linked Siblings / Family Members
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Select siblings physically present at the gate with this student:
                          </p>
                        </div>
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-800">
                          {familyMembers.length} linked
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {familyMembers.map((sib) => {
                          const isChecked = Boolean(familySelections[sib.id]);
                          const isAlreadyDone = Boolean(getTodayScan(sib.id, direction));

                          return (
                            <label
                              key={sib.id}
                              className={`flex items-center gap-3 rounded-xl border p-3 transition cursor-pointer ${
                                isChecked
                                  ? "border-cyan-400 bg-cyan-50/80 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={result.status === "VERIFIED"}
                                onChange={(e) =>
                                  setFamilySelections((prev) => ({
                                    ...prev,
                                    [sib.id]: e.target.checked,
                                  }))
                                }
                                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                              />
                              <StudentAvatar student={sib} size="sm" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold text-slate-800">{getFullName(sib)}</p>
                                <p className="text-[11px] text-slate-500">{sib.admissionNumber} · {sib.className}</p>
                              </div>
                              {isAlreadyDone && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  Already In
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500">
                      <Users size={14} className="text-slate-400" />
                      <span>Single student arrival · No other siblings linked under guardian.</span>
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  {result.status === "VERIFIED" ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
                        <Check size={24} strokeWidth={3} />
                      </div>
                      <h4 className="mt-2 text-base font-extrabold text-emerald-900">
                        {direction === "ENTRY" ? "Arrival Recorded" : "Exit Approved"}
                      </h4>
                      <p className="mt-1 text-xs text-emerald-800">
                        {result.verifiedIds?.length || 1} student(s) successfully logged by officer {officerName}.
                      </p>

                      <button
                        type="button"
                        onClick={resetToScanNext}
                        className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-900/10 transition hover:bg-emerald-800 cursor-pointer"
                      >
                        <QrCode size={16} />
                        Scan Next Student
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <button
                        type="button"
                        onClick={confirmVerification}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#071A52] to-[#123A8F] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:brightness-110 cursor-pointer"
                      >
                        <CheckCircle2 size={18} />
                        Confirm & Record Pass (
                        {1 + Object.values(familySelections).filter(Boolean).length} Student
                        {1 + Object.values(familySelections).filter(Boolean).length > 1 ? "s" : ""}
                        )
                      </button>

                      <button
                        type="button"
                        onClick={resetToScanNext}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Real-time Scan Log Drawer */}
        {showHistory && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h3 className="text-base font-extrabold text-[#071A52]">Live Gate Entry Logs</h3>
                <p className="text-xs text-slate-500">Real-time gate pass recordings for today.</p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Filter logs by name or ID..."
                  className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50"
                />
              </div>
            </div>

            {filteredHistory.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredHistory.map((rec) => (
                  <div key={rec.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-900">
                        {rec.studentName?.charAt(0) || "S"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#071A52]">{rec.studentName}</p>
                        <p className="text-[11px] text-slate-500">{rec.admissionNumber} · {rec.className}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-mono">{formatTime(rec.scannedAt)}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {rec.method || "QR"}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        rec.direction === "EXIT" ? "bg-cyan-50 text-cyan-800" : "bg-emerald-50 text-emerald-800"
                      }`}>
                        {rec.direction === "EXIT" ? "Exit" : "Entry"}
                      </span>
                      <StatusBadge status={rec.status} direction={rec.direction} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No scan logs match your query.
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}