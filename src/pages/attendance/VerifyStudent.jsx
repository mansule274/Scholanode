import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Fingerprint,
  History,
  Keyboard,
  Loader2,
  QrCode,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  Volume2,
  VolumeX,
  X,
  XCircle,
} from "lucide-react";
import jsQR from "jsqr";
import { useUserContext } from "../../context/UserContext";
import { recordGateScan, verifyGateStudent } from "./gateScannerApi";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ADMISSION_NUMBER_MAX_LENGTH = 30;
// This terminal records arrivals; the API also supports "RETURN" for a future return flow.
const SCAN_TYPE = "ARRIVAL";

function getStudentKey(student) {
  return student?.studentId || student?.id || "";
}

function normalizeStudent(student) {
  if (!student) return null;
  if (!student.user) return student;

  return {
    studentId: student.id || student.studentId,
    firstName: student.user.firstName,
    surName: student.user.surName,
    admissionNumber: student.admissionNumber,
    gender: student.gender,
    profileImageUrl: student.user.profileImageUrl,
    admissionStatus: student.admissionStatus,
    class: student.class || null,
    scanStatus: student.scanStatus || null,
  };
}

function getFullName(student) {
  const name = `${student?.firstName || ""} ${student?.surName || ""}`.trim();
  return name || "Unnamed student";
}

function getInitials(student) {
  const first = student?.firstName?.[0] || "";
  const last = student?.surName?.[0] || "";
  return `${first}${last}`.toUpperCase() || "SN";
}

function getClassName(student) {
  if (!student?.class) return "No class assigned";
  const name = [student.class.classLevel, student.class.arm]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || "No class assigned";
}

function isAlreadyRecorded(student) {
  return Boolean(student?.scanStatus?.alreadyRecorded);
}

function getScanTypeLabel(scanType) {
  return String(scanType || SCAN_TYPE).toUpperCase() === "RETURN"
    ? "Return"
    : "Arrival";
}

function formatScanTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatScanDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StudentAvatar({ student, size = "md" }) {
  const sizeClass =
    size === "lg"
      ? "h-16 w-16 rounded-2xl text-lg"
      : size === "sm"
      ? "h-10 w-10 rounded-xl text-xs"
      : "h-12 w-12 rounded-xl text-sm";

  if (student?.profileImageUrl) {
    return (
      <img
        src={student.profileImageUrl}
        alt={getFullName(student)}
        className={`shrink-0 object-cover shadow-sm ${sizeClass}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-cyan-100 font-black text-cyan-800 shadow-sm ${sizeClass}`}
    >
      {getInitials(student)}
    </div>
  );
}

function AdmissionStatusBadge({ status }) {
  const normalized = String(status || "").toUpperCase();
  const isActive = ["ACTIVE", "ADMITTED", "ENROLLED"].includes(normalized);
  const label = status
    ? String(status).replaceAll("_", " ").toLowerCase()
    : "not provided";
  const tone = !status
    ? "bg-slate-100 text-slate-500"
    : isActive
    ? "bg-emerald-100 text-emerald-800"
    : "bg-amber-100 text-amber-800";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${tone}`}
    >
      {label}
    </span>
  );
}

function StudentDetailsModal({ student, relation, schoolName, onClose }) {
  if (!student) return null;

  const recorded = isAlreadyRecorded(student);
  const scanType = getScanTypeLabel(student.scanStatus?.scanType);
  const scannedAt = formatScanDateTime(student.scanStatus?.scannedAt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${getFullName(student)} details`}
        className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-extrabold text-[#071A52]">
              Student details
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{relation}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close student details"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/40 p-4">
            <StudentAvatar student={student} size="lg" />
            <div className="min-w-0">
              <h3 className="text-lg font-black leading-tight text-[#071A52]">
                {getFullName(student)}
              </h3>
              <p className="mt-0.5 font-mono text-xs font-bold text-slate-600">
                {student.admissionNumber || "—"}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">{schoolName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Class
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {getClassName(student)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Gender
              </p>
              <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                {student.gender
                  ? String(student.gender).toLowerCase()
                  : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Admission status
              </p>
              <div className="mt-1">
                <AdmissionStatusBadge status={student.admissionStatus} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Today's {scanType.toLowerCase()}
              </p>
              <div className="mt-1">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    recorded
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {recorded ? "Recorded" : "Not recorded"}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`flex items-start gap-3 rounded-xl border p-3.5 ${
              recorded
                ? "border-amber-200 bg-amber-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <Clock
              size={18}
              className={`mt-0.5 shrink-0 ${
                recorded ? "text-amber-700" : "text-slate-400"
              }`}
            />
            <div>
              <p
                className={`text-sm font-bold ${
                  recorded ? "text-amber-900" : "text-slate-700"
                }`}
              >
                {recorded
                  ? `${scanType} already recorded today`
                  : `No ${scanType.toLowerCase()} recorded today`}
              </p>
              <p
                className={`mt-0.5 text-xs ${
                  recorded ? "text-amber-800" : "text-slate-500"
                }`}
              >
                {recorded && scannedAt
                  ? `Scanned on ${scannedAt}.`
                  : "This terminal records arrivals only."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
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
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
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
    return "Gate Officer";
  }, [user]);

  const officerLoginId = user?.loginId || "";
  const schoolName = school?.schoolName || school?.name || "School";

  const [mode, setMode] = useState("qr"); // "qr" | "admission"
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [admissionNumber, setAdmissionNumber] = useState("");

  const [stage, setStage] = useState("idle"); // "idle" | "found" | "recorded" | "notFound"
  const [student, setStudent] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familySelections, setFamilySelections] = useState({});
  const [notFoundValue, setNotFoundValue] = useState("");
  const [notFoundMethod, setNotFoundMethod] = useState("QR");
  const [recordedCount, setRecordedCount] = useState(0);
  const [recordMessage, setRecordMessage] = useState("");
  const [viewStudent, setViewStudent] = useState(null);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [cameraState, setCameraState] = useState("idle"); // "idle" | "starting" | "active" | "error"
  const [cameraError, setCameraError] = useState("");

  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const videoCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const cameraRequestRef = useRef(0);
  const decodeFrameRef = useRef(0);
  const lastDecodeAtRef = useRef(0);
  const resumeCameraRef = useRef(false);
  const verifyInFlight = useRef(false);
  const recordInFlight = useRef(false);
  const handleLookupRef = useRef(null);
  const scanBufferRef = useRef({ value: "", lastKeyAt: 0 });

  const primaryAlreadyRecorded = isAlreadyRecorded(student);

  const selectableFamilyMembers = useMemo(
    () => familyMembers.filter((member) => !isAlreadyRecorded(member)),
    [familyMembers]
  );

  const recordedFamilyCount = familyMembers.length - selectableFamilyMembers.length;

  const selectedFamilyCount = useMemo(
    () =>
      selectableFamilyMembers.filter(
        (member) => familySelections[getStudentKey(member)]
      ).length,
    [selectableFamilyMembers, familySelections]
  );

  const totalToRecord = student
    ? (primaryAlreadyRecorded ? 0 : 1) + selectedFamilyCount
    : 0;

  function clearLookupState() {
    setStage("idle");
    setStudent(null);
    setFamilyMembers([]);
    setFamilySelections({});
    setNotFoundValue("");
    setNotFoundMethod("QR");
    setRecordedCount(0);
    setRecordMessage("");
    setViewStudent(null);
  }

  function handleModeChange(nextMode) {
    if (nextMode !== "qr") {
      stopCamera({ forget: true });
    }
    setMode(nextMode);
    setError("");
    clearLookupState();
  }

  function resetToScanNext() {
    clearLookupState();
    setAdmissionNumber("");
    setError("");
    if (mode === "admission") {
      inputRef.current?.focus();
      return;
    }
    if (resumeCameraRef.current) {
      startCamera();
    }
  }

  function releaseCameraStream() {
    cameraRequestRef.current += 1;
    cancelAnimationFrame(decodeFrameRef.current);
    decodeFrameRef.current = 0;
    const stream = streamRef.current;
    streamRef.current = null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function stopCamera({ forget = false } = {}) {
    releaseCameraStream();
    if (forget) resumeCameraRef.current = false;
    setCameraState("idle");
  }

  function startDecodeLoop() {
    const tick = () => {
      const video = videoRef.current;
      if (!video || !streamRef.current) return;

      const now = performance.now();
      if (
        now - lastDecodeAtRef.current >= 200 &&
        video.readyState >= 2 &&
        video.videoWidth &&
        video.videoHeight
      ) {
        lastDecodeAtRef.current = now;

        const canvas =
          videoCanvasRef.current ||
          (videoCanvasRef.current = document.createElement("canvas"));
        const scale = Math.min(1, 640 / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);

        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = context.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQR(frame.data, frame.width, frame.height, {
          inversionAttempts: "dontInvert",
        });

        if (result?.data) {
          stopCamera();
          handleLookupRef.current?.(result.data, "QR");
          return;
        }
      }

      decodeFrameRef.current = requestAnimationFrame(tick);
    };

    decodeFrameRef.current = requestAnimationFrame(tick);
  }

  async function startCamera() {
    if (cameraState === "starting" || cameraState === "active") return;

    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("error");
      setCameraError(
        window.isSecureContext === false
          ? "Camera access needs a secure page. Open this site over https:// — browsers block the camera on plain http://, including LAN addresses."
          : "This browser cannot open the camera. Use a USB scanner instead, or open the Admission No tab."
      );
      return;
    }

    resumeCameraRef.current = true;
    const requestId = cameraRequestRef.current + 1;
    cameraRequestRef.current = requestId;
    setCameraState("starting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      if (requestId !== cameraRequestRef.current || !videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => {});
      setCameraState("active");
      startDecodeLoop();
    } catch (cameraFailure) {
      if (requestId !== cameraRequestRef.current) return;
      releaseCameraStream();
      setCameraState("error");
      setCameraError(
        cameraFailure?.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access for this site in your browser settings, then try again."
          : cameraFailure?.name === "NotFoundError"
          ? "No camera was found on this device. Use a USB scanner or the Admission No tab."
          : "The camera could not start. Close other apps using it, then try again."
      );
    }
  }

  async function handleLookup(rawValue, method) {
    if (verifyInFlight.current) return;
    if (streamRef.current) stopCamera();

    const value = String(rawValue || "").trim();
    setError("");
    clearLookupState();

    if (!value) {
      setError(
        method === "QR"
          ? "Scan a student badge first."
          : "Enter an admission number first."
      );
      return;
    }

    if (method === "QR" && !UUID_PATTERN.test(value)) {
      setError("This badge could not be read. Please scan it again.");
      return;
    }

    if (
      method === "ADMISSION_NUMBER" &&
      value.length > ADMISSION_NUMBER_MAX_LENGTH
    ) {
      setError(
        `Admission number cannot exceed ${ADMISSION_NUMBER_MAX_LENGTH} characters.`
      );
      return;
    }

    verifyInFlight.current = true;
    setVerifying(true);
    try {
      const payload = await verifyGateStudent({
        method,
        value,
        scanType: SCAN_TYPE,
      });
      const verifiedStudent = normalizeStudent(payload?.student);

      if (!verifiedStudent) {
        throw new Error("Student details were not returned.");
      }

      const primaryId = getStudentKey(verifiedStudent);
      const seenIds = new Set(primaryId ? [primaryId] : []);
      const siblings = (
        Array.isArray(payload?.familyMembers) ? payload.familyMembers : []
      )
        .map(normalizeStudent)
        .filter((member) => {
          const memberId = getStudentKey(member);
          if (!memberId || seenIds.has(memberId)) return false;
          seenIds.add(memberId);
          return true;
        });

      setStudent(verifiedStudent);
      setFamilyMembers(siblings);
      setFamilySelections({});
      setStage("found");

      const nothingNewToRecord =
        isAlreadyRecorded(verifiedStudent) &&
        siblings.every((member) => isAlreadyRecorded(member));
      if (soundEnabled) {
        playAudioChime(nothingNewToRecord ? "warning" : "success");
      }
    } catch (requestError) {
      const status = requestError?.response?.status;
      const message = requestError?.response?.data?.message;

      if (status === 404) {
        setNotFoundValue(value);
        setNotFoundMethod(method);
        setStage("notFound");
        if (soundEnabled) playAudioChime("warning");
      } else {
        setError(
          message || "We could not verify this student. Please try again."
        );
      }
    } finally {
      verifyInFlight.current = false;
      setVerifying(false);
    }
  }

  useEffect(() => {
    handleLookupRef.current = handleLookup;
  });

  useEffect(
    () => () => {
      cancelAnimationFrame(decodeFrameRef.current);
      const stream = streamRef.current;
      streamRef.current = null;
      if (stream) stream.getTracks().forEach((track) => track.stop());
    },
    []
  );

  useEffect(() => {
    if (!viewStudent) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setViewStudent(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewStudent]);

  // USB/keyboard-wedge scanners emit rapid keystrokes ending in Enter; badge
  // tokens never touch an input field, so they cannot be typed or pasted.
  useEffect(() => {
    if (
      mode !== "qr" ||
      verifying ||
      stage === "found" ||
      stage === "recorded"
    ) {
      scanBufferRef.current = { value: "", lastKeyAt: 0 };
      return undefined;
    }

    function handleScanKeyDown(event) {
      const now = Date.now();
      const buffer = scanBufferRef.current;

      if (now - buffer.lastKeyAt > 150) {
        buffer.value = "";
      }
      buffer.lastKeyAt = now;

      if (event.key === "Enter") {
        const scannedValue = buffer.value;
        buffer.value = "";
        if (scannedValue.length >= 8) {
          handleLookupRef.current?.(scannedValue, "QR");
        }
        return;
      }

      if (event.key === "Escape") {
        buffer.value = "";
        return;
      }

      if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        buffer.value += event.key;
      }
    }

    window.addEventListener("keydown", handleScanKeyDown);
    return () => window.removeEventListener("keydown", handleScanKeyDown);
  }, [mode, verifying, stage]);

  async function confirmVerification() {
    if (!student || recording || recordInFlight.current) return;

    const primaryId = getStudentKey(student);
    const studentIds = Array.from(
      new Set([
        ...(primaryAlreadyRecorded || !primaryId ? [] : [primaryId]),
        ...selectableFamilyMembers
          .filter((member) => familySelections[getStudentKey(member)])
          .map(getStudentKey),
      ])
    ).filter(Boolean);

    if (!studentIds.length) {
      setError(
        primaryAlreadyRecorded
          ? "This student's arrival is already recorded today. Select any siblings present who have not been recorded."
          : "This student record is missing an identifier. Please try again."
      );
      return;
    }

    setError("");
    recordInFlight.current = true;
    setRecording(true);
    try {
      const payload = await recordGateScan({
        studentIds,
        scanType: SCAN_TYPE,
      });
      setStage("recorded");
      setRecordedCount(payload?.totalRecorded ?? studentIds.length);
      setRecordMessage(
        payload?.message || "Student arrival(s) recorded successfully."
      );
      if (soundEnabled) playAudioChime("success");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "We could not record this scan. Please try again."
      );
    } finally {
      recordInFlight.current = false;
      setRecording(false);
    }
  }

  const terminalStatus = officerLoginId
    ? `Gate Terminal Online · ${officerLoginId}`
    : "Gate Terminal Online";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(73,166,255,0.08),_transparent_40%),#f8fafc] px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Navigation & Status Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Dashboard
            </button>
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm sm:inline-flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              {terminalStatus}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled((value) => !value)}
              title={soundEnabled ? "Sound enabled" : "Sound muted"}
              aria-label={
                soundEnabled ? "Mute scanner sound" : "Enable scanner sound"
              }
              aria-pressed={soundEnabled}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              {soundEnabled ? (
                <Volume2 size={16} className="text-emerald-600" />
              ) : (
                <VolumeX size={16} className="text-slate-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/scan-history")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <History size={15} />
              View History
            </button>
          </div>
        </div>

        {/* High Impact Banner */}
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#061541] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-[0_20px_50px_-25px_rgba(7,26,82,0.6)] sm:p-8">
          <div className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border-[40px] border-white/[0.05]" />
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-cyan-200 backdrop-blur-md">
                <ShieldCheck size={14} />
                {schoolName}
              </span>

              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                Verify Student Gate Pass
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                Gate Officer{" "}
                <span className="font-bold text-white">{officerName}</span>
                {officerLoginId ? ` (${officerLoginId})` : ""}. Scan a student QR
                badge or enter their admission number, review the record, then
                confirm arrival.
              </p>
            </div>

            <ol className="grid gap-2 text-xs font-semibold text-blue-100 sm:min-w-72">
              {[
                "Scan the student QR badge",
                "Or enter an admission number",
                "Review the student and linked siblings",
                "Confirm to record arrival",
              ].map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 backdrop-blur-md"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-[11px] font-black text-[#071A52]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Verification Core Layout */}
        <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT COLUMN: Input & Scanner Workstation */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-[#071A52]">
                    Gate Scanner &amp; Lookup
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Scan a student badge or verify by admission number.
                  </p>
                </div>

                <div className="inline-flex rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => handleModeChange("qr")}
                    aria-pressed={mode === "qr"}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      mode === "qr"
                        ? "bg-white text-[#071A52] shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <QrCode size={14} />
                    QR Scanner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange("admission")}
                    aria-pressed={mode === "admission"}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      mode === "admission"
                        ? "bg-white text-[#071A52] shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Keyboard size={14} />
                    Admission No
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* MODE 1: QR CODE SCANNER */}
              {mode === "qr" && (
                <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-cyan-300 bg-gradient-to-b from-cyan-50/70 via-slate-50 to-white p-6 sm:p-8">
                  <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-2xl border-2 border-cyan-400 bg-slate-900 shadow-lg shadow-cyan-500/10 sm:max-w-sm">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className={`h-56 w-full object-cover transition-opacity sm:h-64 ${
                        cameraState === "active" ? "opacity-100" : "opacity-0"
                      }`}
                    />

                    {cameraState !== "active" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-cyan-50/95 via-slate-50 to-white px-6 text-center">
                        {cameraState === "starting" ? (
                          <>
                            <Loader2
                              size={32}
                              className="animate-spin text-cyan-700"
                            />
                            <p className="mt-3 text-xs font-bold text-slate-600">
                              Opening camera...
                            </p>
                          </>
                        ) : (
                          <>
                            <QrCode
                              size={64}
                              strokeWidth={1.2}
                              className="text-[#071A52]/80"
                            />
                            <p className="mt-3 text-[11px] font-semibold text-slate-500">
                              Start the camera and hold the badge inside the
                              frame.
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    <span className="pointer-events-none absolute left-2 top-2 h-6 w-6 border-l-4 border-t-4 border-cyan-300" />
                    <span className="pointer-events-none absolute right-2 top-2 h-6 w-6 border-r-4 border-t-4 border-cyan-300" />
                    <span className="pointer-events-none absolute bottom-2 left-2 h-6 w-6 border-b-4 border-l-4 border-cyan-300" />
                    <span className="pointer-events-none absolute bottom-2 right-2 h-6 w-6 border-b-4 border-r-4 border-cyan-300" />

                    {cameraState === "active" && (
                      <div className="pointer-events-none absolute inset-x-3 top-0 h-1 rounded-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#06b6d4] animate-[bounce_2.4s_infinite]" />
                    )}

                    <div className="pointer-events-none absolute left-1/2 top-2.5 -translate-x-1/2 rounded-full bg-slate-900/60 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white">
                      {cameraState === "active" ? "Camera live" : "Badge camera"}
                    </div>
                  </div>

                  <p className="mt-4 text-center text-xs text-slate-500">
                    Point your camera at the student badge. The scan is captured
                    automatically.
                  </p>

                  {cameraError && (
                    <p
                      role="alert"
                      className="mx-auto mt-3 max-w-sm rounded-xl border border-rose-200 bg-rose-50/90 px-3 py-2 text-center text-[11px] font-semibold text-rose-800"
                    >
                      {cameraError}
                    </p>
                  )}

                  <div
                    role="status"
                    className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50/70 px-4 py-3 text-center text-xs font-bold text-cyan-900"
                  >
                    {verifying ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Verifying scanned badge...
                      </>
                    ) : cameraState === "active" ? (
                      <>
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                        Camera active — waiting for a badge...
                      </>
                    ) : stage === "found" || stage === "recorded" ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        Finish this student, then scan the next one.
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
                        Waiting for scan...
                      </>
                    )}
                  </div>

                  <div className="mt-3 flex justify-center">
                    {cameraState === "active" ? (
                      <button
                        type="button"
                        onClick={() => stopCamera({ forget: true })}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        <CameraOff size={15} />
                        Stop camera
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startCamera}
                        disabled={
                          cameraState === "starting" ||
                          verifying ||
                          stage === "found" ||
                          stage === "recorded"
                        }
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cameraState === "starting" ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Camera size={15} />
                        )}
                        {cameraState === "starting"
                          ? "Starting camera..."
                          : cameraState === "error"
                          ? "Try camera again"
                          : "Start Camera"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 2: ADMISSION NUMBER LOOKUP */}
              {mode === "admission" && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-800 shadow-sm">
                    <Fingerprint size={28} />
                  </div>
                  <h3 className="mt-3 font-extrabold text-[#071A52]">
                    Manual Admission Number Search
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                    Use this when a student does not have their QR badge or the
                    code cannot be read.
                  </p>

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleLookup(admissionNumber, "ADMISSION_NUMBER");
                    }}
                    className="mx-auto mt-4 max-w-md space-y-3"
                  >
                    <label htmlFor="admission-number" className="sr-only">
                      Admission number
                    </label>
                    <input
                      id="admission-number"
                      type="text"
                      value={admissionNumber}
                      autoComplete="off"
                      maxLength={ADMISSION_NUMBER_MAX_LENGTH}
                      onChange={(event) => {
                        setAdmissionNumber(event.target.value);
                        setError("");
                      }}
                      placeholder="e.g. SN/2026/001"
                      disabled={verifying}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 disabled:bg-slate-50"
                    />
                    <button
                      type="submit"
                      disabled={verifying}
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {verifying ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Search size={16} />
                      )}
                      {verifying ? "Looking up..." : "Lookup Student"}
                    </button>
                  </form>
                </div>
              )}

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-semibold text-rose-800"
                >
                  <XCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Not Found */}
              {stage === "notFound" && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4"
                >
                  <XCircle
                    size={22}
                    className="mt-0.5 shrink-0 text-rose-600"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-rose-800">
                      Student Not Found
                    </h4>
                    <p className="mt-0.5 text-xs text-rose-700">
                      {notFoundMethod === "QR" ? (
                        <>
                          No student matches this scanned badge. Scan the badge
                          again or verify by admission number.
                        </>
                      ) : (
                        <>
                          No student matches admission number{" "}
                          <span className="font-semibold">
                            "{notFoundValue}"
                          </span>
                          . Check the number and try again.
                        </>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStage("idle");
                        setNotFoundValue("");
                      }}
                      className="mt-2 cursor-pointer text-xs font-bold text-rose-800 underline hover:text-rose-900"
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
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-[#071A52]">
                    Verification Card
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Student record and linked siblings.
                  </p>
                </div>
                {stage === "found" &&
                  (primaryAlreadyRecorded &&
                  selectableFamilyMembers.length === 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      <Clock size={13} />
                      Already recorded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                      <CheckCircle2 size={13} />
                      Ready to record
                    </span>
                  ))}
                {stage === "recorded" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <Check size={13} />
                    Recorded
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {!student ? (
                <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
                    <UserRound size={32} />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-slate-700">
                    Awaiting Student Badge
                  </h3>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                    Scan a student badge or enter an admission number. The
                    verified student and their linked siblings will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/40 p-5">
                    <div className="flex items-start gap-4">
                      <StudentAvatar student={student} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-[#071A52]">
                            {getFullName(student)}
                          </h3>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                            {getClassName(student)}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-xs font-bold text-slate-600">
                          {student.admissionNumber || "—"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {schoolName} · Verified student
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setViewStudent({
                            student,
                            relation: "Primary student",
                          })
                        }
                        aria-label={`View ${getFullName(student)} details`}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-blue-200 bg-white/80 px-2.5 py-1.5 text-[11px] font-bold text-blue-800 transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </div>

                    {primaryAlreadyRecorded && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-5 text-amber-900">
                        <Clock size={14} className="mt-0.5 shrink-0" />
                        <span>
                          {getScanTypeLabel(student.scanStatus?.scanType)} already
                          recorded
                          {formatScanTime(student.scanStatus?.scannedAt)
                            ? ` at ${formatScanTime(
                                student.scanStatus?.scannedAt
                              )}`
                            : ""}
                          .{" "}
                          {selectableFamilyMembers.length > 0
                            ? "You can still record linked siblings who are present at the gate."
                            : "There is nothing new to record for this student."}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-blue-100/80 pt-3.5">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Gender
                        </p>
                        <p className="mt-0.5 text-xs font-bold capitalize text-slate-800">
                          {student.gender
                            ? String(student.gender).toLowerCase()
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Admission Status
                        </p>
                        <div className="mt-1">
                          <AdmissionStatusBadge
                            status={student.admissionStatus}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {familyMembers.length > 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#071A52]">
                            Linked Siblings / Family Members
                          </h4>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Select siblings physically present at the gate.
                            {recordedFamilyCount > 0
                              ? " Siblings already recorded today cannot be selected."
                              : ""}
                          </p>
                        </div>
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-800">
                          {familyMembers.length} linked
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {familyMembers.map((member) => {
                          const memberId = getStudentKey(member);
                          const isChecked = Boolean(familySelections[memberId]);
                          const memberRecorded = isAlreadyRecorded(member);
                          const memberScanTime = formatScanTime(
                            member.scanStatus?.scannedAt
                          );
                          const selectionDisabled =
                            stage === "recorded" || recording || memberRecorded;

                          return (
                            <div
                              key={memberId}
                              className={`flex items-center gap-2 rounded-xl border p-3 transition ${
                                memberRecorded
                                  ? "border-amber-200 bg-amber-50/60"
                                  : isChecked
                                  ? "border-cyan-400 bg-cyan-50/80 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <label
                                className={`flex min-w-0 flex-1 items-center gap-3 ${
                                  selectionDisabled
                                    ? "cursor-default"
                                    : "cursor-pointer"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={selectionDisabled}
                                  onChange={(event) =>
                                    setFamilySelections((previous) => ({
                                      ...previous,
                                      [memberId]: event.target.checked,
                                    }))
                                  }
                                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 disabled:opacity-60"
                                />
                                <StudentAvatar student={member} size="sm" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <p className="truncate text-xs font-bold text-slate-800">
                                      {getFullName(member)}
                                    </p>
                                    {memberRecorded && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                        <Clock size={10} />
                                        Recorded
                                        {memberScanTime ? ` ${memberScanTime}` : ""}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500">
                                    {member.admissionNumber || "—"} ·{" "}
                                    {getClassName(member)}
                                  </p>
                                  {memberRecorded && (
                                    <p className="mt-0.5 text-[10px] font-semibold text-amber-700">
                                      Already recorded today — cannot be
                                      selected.
                                    </p>
                                  )}
                                </div>
                              </label>

                              <button
                                type="button"
                                onClick={() =>
                                  setViewStudent({
                                    student: member,
                                    relation: "Linked sibling",
                                  })
                                }
                                aria-label={`View ${getFullName(member)} details`}
                                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                              >
                                <Eye size={12} />
                                View
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500">
                      <Users size={14} className="text-slate-400" />
                      <span>No linked siblings returned for this student.</span>
                    </div>
                  )}

                  {stage === "recorded" ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
                        <Check size={24} strokeWidth={3} />
                      </div>
                      <h4 className="mt-2 text-base font-extrabold text-emerald-900">
                        Arrival Recorded
                      </h4>
                      <p className="mt-1 text-xs text-emerald-800">
                        {recordedCount}{" "}
                        {recordedCount === 1 ? "student" : "students"} recorded by{" "}
                        {officerName}.
                      </p>
                      {recordMessage && (
                        <p className="mt-1 text-[11px] text-emerald-700">
                          {recordMessage}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={resetToScanNext}
                        className="mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-900/10 transition hover:bg-emerald-800"
                      >
                        <QrCode size={16} />
                        Scan Next Student
                      </button>
                    </div>
                  ) : primaryAlreadyRecorded &&
                    selectableFamilyMembers.length === 0 ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-5 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-sm">
                        <Clock size={23} />
                      </div>
                      <h4 className="mt-2 text-base font-extrabold text-amber-900">
                        No new arrival to record
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-amber-800">
                        This student's arrival was already recorded today
                        {formatScanTime(student.scanStatus?.scannedAt)
                          ? ` at ${formatScanTime(student.scanStatus?.scannedAt)}`
                          : ""}
                        . Scan the next student.
                      </p>

                      <button
                        type="button"
                        onClick={resetToScanNext}
                        className="mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-900/10 transition hover:bg-amber-800"
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
                        disabled={recording || totalToRecord === 0}
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#071A52] to-[#123A8F] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {recording ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={18} />
                        )}
                        {recording
                          ? "Recording arrival..."
                          : totalToRecord === 0
                          ? "Select a sibling to record"
                          : `Confirm & Record Arrival (${totalToRecord} Student${
                              totalToRecord === 1 ? "" : "s"
                            })`}
                      </button>

                      {!recording && totalToRecord === 0 && (
                        <p className="text-center text-[11px] font-semibold text-slate-500">
                          Select at least one linked sibling who is present at
                          the gate.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={resetToScanNext}
                        disabled={recording}
                        className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>

      {viewStudent && (
        <StudentDetailsModal
          student={viewStudent.student}
          relation={viewStudent.relation}
          schoolName={schoolName}
          onClose={() => setViewStudent(null)}
        />
      )}
    </div>
  );
}
