import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileCheck2,
  Filter,
  History,
  Info,
  Loader2,
  LockKeyhole,
  Pencil,
  RotateCcw,
  Save,
  Search,
  Send,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import {
  createTodayAttendance,
  getAttendanceRegister,
  getMyAttendanceHistory,
  getTodayAttendance,
  saveAttendanceDraft as saveAttendanceDraftRequest,
  submitAttendance as submitAttendanceRequest,
} from "./attendanceApi";
import ProfilePendingBadge from "../../components/ProfilePendingBadge";
import {
  PENDING_PROFILE_HINT,
  getStaffDisplayName,
  isProfilePending,
} from "../../../utils/staffDisplay";
import { downloadFile, toCsv } from "../../../utils/csv";
import { collectAllPages } from "../../../utils/pagedExport";

const ALL_PERIODS = "ALL";
const HISTORY_DEBOUNCE_MS = 350;

const NO_EDIT_REASON = "Closed — outside the current session and term";

const normalizeTodayStudents = (students) =>
  students.map((student) => {
    if (!student?.studentId) {
      throw new Error("The attendance response contains a student without an ID.");
    }

    return {
      ...student,
      id: student.studentId,
      firstName: student.firstName ?? "",
      surname: student.surName ?? "",
      status: student.status ?? null,
    };
  });

const parseTodayAttendanceResponse = (response, requireRegister = false) => {
  const data = response?.data;
  if (
    response?.success !== true ||
    typeof data?.attendanceDate !== "string" ||
    !Object.prototype.hasOwnProperty.call(data, "class") ||
    !Object.prototype.hasOwnProperty.call(data, "attendanceRegister") ||
    !Array.isArray(data?.students)
  ) {
    throw new Error("The server returned an invalid today's attendance response.");
  }

  if (
    data.attendanceRegister !== null &&
    (typeof data.attendanceRegister !== "object" ||
      Array.isArray(data.attendanceRegister))
  ) {
    throw new Error("The server returned an invalid attendance register.");
  }

  if (requireRegister && !data.attendanceRegister) {
    throw new Error("The server did not return the created attendance register.");
  }

  return {
    ...data,
    students: normalizeTodayStudents(data.students),
  };
};

const buildHistoryParams = (filters, { page, limit }) => ({
  sessionId:
    filters.sessionId === ALL_PERIODS ? undefined : filters.sessionId || undefined,
  termId: filters.termId === ALL_PERIODS ? undefined : filters.termId || undefined,
  fromDate: filters.fromDate || undefined,
  toDate: filters.toDate || undefined,
  status: filters.status === ALL_PERIODS ? undefined : filters.status,
  page,
  limit,
});

const getClassLabel = (assignedClass) => {
  if (!assignedClass) return "No class assigned";
  if (typeof assignedClass === "string") return assignedClass;

  const classLevel =
    assignedClass.classLevel ??
    assignedClass.name ??
    assignedClass.className ??
    "";
  const arm = assignedClass.arm ?? assignedClass.section ?? "";
  const label = [classLevel, arm].filter(Boolean).join(" ");

  return label || "Assigned class";
};

// A form master who has not signed in yet arrives with no real name, so the
// chip falls back to their invitation email and finally to the shared pending
// label rather than disappearing from the workspace header.
const getFormMasterName = (formMaster) => {
  if (isProfilePending(formMaster)) return getStaffDisplayName(formMaster);

  return (
    [formMaster?.firstName, formMaster?.surName]
      .filter(Boolean)
      .join(" ") ||
    formMaster?.fullName ||
    formMaster?.name ||
    ""
  );
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return "—";

  return new Date(dateTime).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCounts = (students) => ({
  total: students.length,
  present: students.filter((student) => student.status === "PRESENT").length,
  absent: students.filter((student) => student.status === "ABSENT").length,
  unconfirmed: students.filter((student) => !student.status).length,
});

function TabButton({ active, icon: Icon, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-[#071A52] text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <Icon size={17} />
      {children}
    </button>
  );
}

function SummaryCard({ title, value, description, icon: Icon, color }) {
  const colorClasses = {
    navy: "bg-blue-50 text-[#123A8F] ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-rose-50 text-rose-700 ring-rose-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#49A6FF]/70 to-cyan-300/60" />
      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <div className={`rounded-xl p-3 ring-1 ring-inset ${colorClasses[color]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function Avatar({ student }) {
  const initials = `${student.firstName?.[0] || ""}${
    student.surname?.[0] || ""
  }`.toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#123A8F]">
      {initials}
    </div>
  );
}

function AttendanceToggle({ status, onChange, disabled = false }) {
  const buttons = [
    {
      value: "PRESENT",
      label: "Present",
      Icon: UserCheck,
      selected: "border-emerald-600 bg-emerald-600 text-white",
      unselected:
        "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50",
    },
    {
      value: "ABSENT",
      label: "Absent",
      Icon: UserX,
      selected: "border-rose-600 bg-rose-600 text-white",
      unselected: "border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {buttons.map(({ value, label, Icon, selected, unselected }) => {
        const isSelected = status === value;

        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => onChange(isSelected ? null : value)}
            title={
              isSelected
                ? `Click to clear ${label.toLowerCase()} status`
                : `Mark ${label.toLowerCase()}`
            }
            className={`inline-flex min-w-[104px] items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isSelected ? selected : unselected
            }`}
          >
            <Icon size={15} />
            {label}
            {isSelected && <CheckCircle2 size={14} />}
          </button>
        );
      })}
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function MiniStat({ label, value, color }) {
  const colors = {
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    navy: "bg-blue-50 text-[#123A8F]",
  };

  return (
    <div className={`rounded-xl p-3 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function StatusLabel({ status }) {
  if (status === "PRESENT") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={13} />
        Present
      </span>
    );
  }

  if (status === "ABSENT") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
        <UserX size={13} />
        Absent
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <Info size={13} />
      Unconfirmed
    </span>
  );
}

function RegisterStatusBadge({ status }) {
  const config = {
    NEW: {
      label: "Not started",
      classes: "bg-slate-100 text-slate-600",
    },
    DRAFT: {
      label: "Draft",
      classes: "bg-amber-50 text-amber-700",
    },
    SUBMITTED: {
      label: "Completed",
      classes: "bg-emerald-50 text-emerald-700",
    },
  };

  const item = config[status] || config.NEW;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${item.classes}`}
    >
      {status === "SUBMITTED" ? (
        <CheckCircle2 size={13} />
      ) : status === "DRAFT" ? (
        <Save size={13} />
      ) : (
        <CalendarDays size={13} />
      )}
      {item.label}
    </span>
  );
}

// One shell serves both cases: the form master corrects a register while its
// session and term are still current, and reviews it read-only afterwards.
function RegisterModal({ state, classLabel, onClose, onRetry, onToggleStudent, onSave }) {
  if (!state) return null;

  const detail = state.detail;
  const register = detail?.attendanceRegister;
  const canEdit = Boolean(detail?.permissions?.canEdit);
  const counts = getCounts(state.students);
  const hasUnmarked = counts.unconfirmed > 0;
  const modalClassLabel = register?.class
    ? getClassLabel(register.class)
    : classLabel;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-modal-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-[#123A8F]">
              <History size={17} />
              {canEdit ? "Review and correct register" : "Attendance register details"}
            </div>

            <h2
              id="register-modal-title"
              className="mt-1 text-xl font-bold text-slate-900"
            >
              {formatDate(register?.attendanceDate)}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {[
                modalClassLabel,
                register?.session?.sessionName,
                register?.term?.termName,
              ]
                .filter(Boolean)
                .join(" · ") || "Class information unavailable"}
            </p>

            {register?.status && (
              <div className="mt-3">
                <RegisterStatusBadge status={register.status} />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close attendance register details"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {state.loading ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
            <Loader2 size={26} className="animate-spin text-[#123A8F]" />
            <p className="mt-4 font-bold text-slate-800">Loading register</p>
            <p className="mt-1 text-sm text-slate-500">
              Retrieving the students recorded on this day.
            </p>
          </div>
        ) : !detail ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle size={22} />
            </div>
            <p className="mt-3 font-bold text-slate-900">
              This register could not be loaded
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-rose-700">
              {state.error}
            </p>
          </div>
        ) : (
          <div className="max-h-[calc(90vh-260px)] space-y-5 overflow-y-auto p-5">
            {!canEdit && (
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <LockKeyhole size={18} className="mt-0.5 shrink-0" />
                <p className="leading-5">
                  {detail.permissions?.reason || NO_EDIT_REASON}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat label="Total students" value={counts.total} color="navy" />
              <MiniStat label="Present" value={counts.present} color="green" />
              <MiniStat label="Absent" value={counts.absent} color="red" />
              <MiniStat label="Unconfirmed" value={counts.unconfirmed} color="amber" />
            </div>

            {canEdit && hasUnmarked && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">
                    {counts.unconfirmed} student
                    {counts.unconfirmed === 1 ? " is" : "s are"} not marked yet.
                  </p>
                  <p className="mt-1 leading-5">
                    Mark every student Present or Absent before saving this
                    register.
                  </p>
                </div>
              </div>
            )}

            {state.saveError && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
              >
                {state.saveError}
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Admission number</th>
                    <th className="px-4 py-3">
                      {canEdit ? "Correct attendance" : "Status"}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {state.students.map((student) => (
                    <tr key={student.studentId}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">
                          {student.firstName} {student.surname}
                        </p>
                        {student.gender && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {student.gender}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {student.admissionNumber}
                      </td>

                      <td className="px-4 py-3">
                        {canEdit ? (
                          <div className="space-y-1">
                            <AttendanceToggle
                              status={student.status}
                              disabled={state.saving}
                              onChange={(status) =>
                                onToggleStudent(student.studentId, status)
                              }
                            />
                            {!student.status && (
                              <p className="text-xs font-semibold text-amber-700">
                                Not marked yet
                              </p>
                            )}
                          </div>
                        ) : (
                          <StatusLabel status={student.status} />
                        )}
                      </td>
                    </tr>
                  ))}

                  {state.students.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-10 text-center text-sm text-slate-500"
                      >
                        No students are recorded on this register.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-500">
              Last updated: {formatDateTime(register?.updatedAt)}
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-4">
          {!state.loading && !detail && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw size={16} />
              Try again
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>

          {detail && canEdit && (
            <button
              type="button"
              onClick={onSave}
              disabled={state.saving || hasUnmarked}
              className="inline-flex items-center gap-2 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {state.saving ? "Saving…" : "Save Corrections"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function IncompleteSubmissionModal({
  open,
  unconfirmed,
  error,
  saving,
  onReturn,
  onSaveDraft,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="incomplete-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          <AlertTriangle size={24} />
        </div>

        <h2
          id="incomplete-title"
          className="mt-4 text-xl font-bold text-slate-900"
        >
          Attendance is incomplete
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          You still have{" "}
          <strong>
            {unconfirmed} unconfirmed student{unconfirmed === 1 ? "" : "s"}
          </strong>
          . Every student must be marked Present or Absent before you can
          submit this register.
        </p>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          You can return to finish marking the students or save your current
          progress as a draft and continue later.
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onReturn}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-semibold text-white hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil size={16} />
            Return to Attendance
          </button>

          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save Draft"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="divide-y divide-slate-100" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-4">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-2.5 w-24 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="hidden h-3 w-24 animate-pulse rounded bg-slate-100 sm:block" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function FormMasterAttendance() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("daily");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [students, setStudents] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState("");
  const [todayRefreshKey, setTodayRefreshKey] = useState(0);
  const [creatingToday, setCreatingToday] = useState(false);
  const [createTodayError, setCreateTodayError] = useState("");
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submissionPromptOpen, setSubmissionPromptOpen] = useState(false);
  const [isEditingSubmitted, setIsEditingSubmitted] = useState(false);

  const [historyFilters, setHistoryFilters] = useState({
    sessionId: ALL_PERIODS,
    termId: ALL_PERIODS,
    fromDate: "",
    toDate: "",
    status: ALL_PERIODS,
  });
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [historyData, setHistoryData] = useState(null);
  const [historyPagination, setHistoryPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);
  const [historyMessage, setHistoryMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [exportError, setExportError] = useState("");
  const [registerModal, setRegisterModal] = useState(null);

  const savedStatusesRef = useRef(new Map());
  const unsavedChangesRef = useRef(false);
  const routeRef = useRef(`${location.pathname}${location.search}${location.hash}`);
  const historyRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);

  useEffect(() => {
    unsavedChangesRef.current = unsavedChanges;
  }, [unsavedChanges]);

  useEffect(() => {
    let active = true;

    getTodayAttendance()
      .then((response) => {
        const data = parseTodayAttendanceResponse(response);

        if (!active) return;

        setTodayAttendance(data);
        setAttendanceDate(data.attendanceDate);
        setStudents(data.students);
        savedStatusesRef.current = new Map(
          data.students.map((student) => [student.id, student.status])
        );
        unsavedChangesRef.current = false;
        setUnsavedChanges(false);
      })
      .catch((requestError) => {
        if (active) {
          setTodayError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Unable to load today's attendance."
          );
        }
      })
      .finally(() => {
        if (active) setTodayLoading(false);
      });

    return () => {
      active = false;
    };
  }, [todayRefreshKey]);

  const currentCounts = useMemo(() => getCounts(students), [students]);

  const currentRegister = todayAttendance?.attendanceRegister || null;
  const registerStatus = currentRegister?.status || "NEW";

  // The server decides whether this register still sits inside the school's
  // current session and term, so the page never assumes it can save.
  const canEditToday =
    !todayAttendance?.permissions || todayAttendance.permissions.canEdit !== false;

  const isReadOnly =
    !canEditToday || (registerStatus === "SUBMITTED" && !isEditingSubmitted);

  const canSaveAttendance = Boolean(currentRegister?.id && students.length);

  const takeAttendance = async () => {
    if (creatingToday) return;

    setCreatingToday(true);
    setCreateTodayError("");
    setMessage("");
    try {
      const response = await createTodayAttendance();
      const data = parseTodayAttendanceResponse(response, true);
      setTodayAttendance(data);
      setAttendanceDate(data.attendanceDate);
      setStudents(data.students);
      savedStatusesRef.current = new Map(
        data.students.map((student) => [student.id, student.status])
      );
      unsavedChangesRef.current = false;
      setUnsavedChanges(false);
      setSearchTerm("");
      setIsEditingSubmitted(false);
      setError("");
      setMessage(
        response.message || "Today's attendance register created successfully."
      );
    } catch (requestError) {
      setCreateTodayError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to create today's attendance register."
      );
    } finally {
      setCreatingToday(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) =>
      [
        student.firstName,
        student.surname,
        student.admissionNumber,
      ].some((value) => String(value ?? "").toLowerCase().includes(query))
    );
  }, [students, searchTerm]);

  const applyStatuses = (nextStudents) => {
    setStudents(nextStudents);

    const isDirty = nextStudents.some(
      (student) => student.status !== savedStatusesRef.current.get(student.id)
    );
    unsavedChangesRef.current = isDirty;
    setUnsavedChanges(isDirty);
    setMessage("");
    setError("");
  };

  const updateStudentStatus = (studentId, status) => {
    applyStatuses(
      students.map((student) =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const markAllPresent = () => {
    if (isReadOnly) return;

    applyStatuses(
      students.map((student) => ({ ...student, status: "PRESENT" }))
    );
  };

  const clearAttendance = () => {
    if (isReadOnly) return;

    applyStatuses(students.map((student) => ({ ...student, status: null })));
  };

  const confirmSuccessfulSave = (response, expectedStatus) => {
    const register = response?.data?.attendanceRegister;
    if (
      response?.success !== true ||
      !register?.id ||
      register.status !== expectedStatus ||
      register.attendanceDate !== attendanceDate
    ) {
      throw new Error(
        response?.message || "The server returned an invalid attendance save response."
      );
    }
    const countFields =
      expectedStatus === "DRAFT"
        ? ["totalStudents", "markedStudents", "unmarkedStudents"]
        : ["totalStudents", "presentCount", "absentCount"];
    if (countFields.some((field) => !Number.isFinite(response?.data?.[field]))) {
      throw new Error(
        response?.message ||
          "The server returned incomplete attendance save counts."
      );
    }

    savedStatusesRef.current = new Map(
      students.map((student) => [student.id, student.status])
    );
    unsavedChangesRef.current = false;
    setUnsavedChanges(false);
    setTodayAttendance((previous) =>
      previous
        ? {
            ...previous,
            attendanceRegister: { ...previous.attendanceRegister, ...register },
          }
        : previous
    );

    return response.data;
  };

  const saveDraft = async () => {
    if (savingAttendance || submittingAttendance) return;
    if (!currentRegister?.id) {
      setError("This attendance register is missing its ID and cannot be saved.");
      return;
    }
    if (!students.length) {
      setError("There are no students in this register to save.");
      return;
    }

    setSavingAttendance(true);
    setError("");
    try {
      const response = await saveAttendanceDraftRequest(
        currentRegister.id,
        students.map((student) => ({
          studentId: student.id,
          status: student.status,
        }))
      );
      confirmSuccessfulSave(response, "DRAFT");
      setIsEditingSubmitted(false);
      setSubmissionPromptOpen(false);
      setMessage(
        response.message ||
          `Draft saved. ${currentCounts.unconfirmed} student${
            currentCounts.unconfirmed === 1 ? " remains" : "s remain"
          } unconfirmed.`
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to save the attendance draft."
      );
    } finally {
      setSavingAttendance(false);
    }
  };

  const submitAttendance = async () => {
    if (savingAttendance || submittingAttendance) return;

    if (currentCounts.unconfirmed > 0) {
      setSubmissionPromptOpen(true);
      setError("");
      setMessage("");
      return;
    }

    if (!currentRegister?.id) {
      setError("This attendance register is missing its ID and cannot be submitted.");
      return;
    }
    if (!students.length) {
      setError("There are no students in this register to submit.");
      return;
    }

    setSubmittingAttendance(true);
    setError("");
    try {
      const response = await submitAttendanceRequest(
        currentRegister.id,
        students.map((student) => ({
          studentId: student.id,
          status: student.status,
        }))
      );
      confirmSuccessfulSave(response, "SUBMITTED");
      setIsEditingSubmitted(false);
      setSubmissionPromptOpen(false);
      setMessage(response.message || "Attendance submitted successfully.");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to submit attendance."
      );
    } finally {
      setSubmittingAttendance(false);
    }
  };

  const saveChanges = async () => {
    if (currentCounts.unconfirmed > 0) {
      await saveDraft();
      return;
    }

    await submitAttendance();
  };

  const returnToToday = () => {
    if (
      unsavedChangesRef.current &&
      !window.confirm(
        "Discard your unsaved attendance changes and return to the saved register?"
      )
    ) {
      return;
    }

    const nextStudents = (todayAttendance?.students || []).map((student) => ({
      ...student,
      status: savedStatusesRef.current.get(student.id) ?? null,
    }));

    setStudents(nextStudents);
    const isDirty = nextStudents.some(
      (student) => student.status !== savedStatusesRef.current.get(student.id)
    );
    unsavedChangesRef.current = isDirty;
    setUnsavedChanges(isDirty);
    setActiveTab("daily");
    setSearchTerm("");
    setMessage("");
    setError("");
    setSubmissionPromptOpen(false);
    setIsEditingSubmitted(false);
  };

  const changeTab = (nextTab) => {
    if (
      nextTab !== activeTab &&
      unsavedChangesRef.current &&
      !savingAttendance &&
      !submittingAttendance &&
      !window.confirm(
        "You have attendance changes that have not been saved. Continue without saving them?"
      )
    ) {
      return;
    }
    setActiveTab(nextTab);
  };

  useEffect(() => {
    routeRef.current = `${location.pathname}${location.search}${location.hash}`;
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const confirmRouteLink = (event) => {
      if (
        !unsavedChangesRef.current ||
        savingAttendance ||
        submittingAttendance
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      const destinationPath = `${destination.pathname}${destination.search}${destination.hash}`;
      if (
        destination.origin !== window.location.origin ||
        destinationPath === routeRef.current
      ) {
        return;
      }

      if (
        !window.confirm(
          "You have attendance changes that have not been saved. Continue without saving them?"
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
      }
    };

    const confirmBrowserNavigation = () => {
      if (
        !unsavedChangesRef.current ||
        savingAttendance ||
        submittingAttendance
      ) {
        return;
      }

      if (
        !window.confirm(
          "You have attendance changes that have not been saved. Continue without saving them?"
        )
      ) {
        navigate(routeRef.current, { replace: true });
      }
    };

    const warnBeforeUnload = (event) => {
      if (
        !unsavedChangesRef.current ||
        savingAttendance ||
        submittingAttendance
      ) {
        return;
      }

      const warning =
        "Your attendance changes have not been saved. Leave and discard them?";
      event.preventDefault();
      event.returnValue = warning;
      return warning;
    };

    document.addEventListener("click", confirmRouteLink, true);
    window.addEventListener("popstate", confirmBrowserNavigation);
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => {
      document.removeEventListener("click", confirmRouteLink, true);
      window.removeEventListener("popstate", confirmBrowserNavigation);
      window.removeEventListener("beforeunload", warnBeforeUnload);
    };
  }, [navigate, savingAttendance, submittingAttendance]);

  // The history list is entirely server-driven: filters are debounced and a
  // request id makes sure only the newest response reaches the table.
  useEffect(() => {
    if (activeTab !== "history") return undefined;

    const requestId = (historyRequestIdRef.current += 1);
    const timer = window.setTimeout(async () => {
      setHistoryLoading(true);
      setHistoryError("");

      try {
        const payload = await getMyAttendanceHistory(
          buildHistoryParams(historyFilters, {
            page: historyPage,
            limit: historyLimit,
          })
        );

        if (requestId !== historyRequestIdRef.current) return;

        const data = payload?.data;
        if (!data || !Array.isArray(data.registers)) {
          throw new Error("The server returned an invalid attendance history response.");
        }

        const totalPages = Number(payload?.pagination?.totalPages) || 0;
        if (historyPage > 1 && historyPage > totalPages) {
          setHistoryPage(Math.max(totalPages, 1));
          return;
        }

        setHistoryData(data);
        setHistoryPagination({
          totalItems: Number(payload?.pagination?.totalItems) || 0,
          currentPage: Number(payload?.pagination?.currentPage) || historyPage,
          pageSize: Number(payload?.pagination?.pageSize) || historyLimit,
          totalPages,
        });
      } catch (requestError) {
        if (requestId !== historyRequestIdRef.current) return;

        setHistoryData(null);
        setHistoryPagination({
          totalItems: 0,
          currentPage: 1,
          pageSize: historyLimit,
          totalPages: 0,
        });
        setHistoryError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "We could not load your attendance history. Check your connection and try again."
        );
      } finally {
        if (requestId === historyRequestIdRef.current) setHistoryLoading(false);
      }
    }, HISTORY_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [activeTab, historyFilters, historyPage, historyLimit, historyRefreshToken]);

  const historyRegisters = useMemo(
    () =>
      Array.isArray(historyData?.registers) ? historyData.registers : [],
    [historyData]
  );

  const sessionOptions = Array.isArray(historyData?.availablePeriods?.sessions)
    ? historyData.availablePeriods.sessions
    : [];
  const termOptions = useMemo(() => {
    const terms = historyData?.availablePeriods?.terms ?? [];
    if (historyFilters.sessionId === ALL_PERIODS) return terms;

    return terms.filter((term) => term.sessionId === historyFilters.sessionId);
  }, [historyData, historyFilters.sessionId]);

  const hasActiveHistoryFilters =
    historyFilters.sessionId !== ALL_PERIODS ||
    historyFilters.termId !== ALL_PERIODS ||
    Boolean(historyFilters.fromDate) ||
    Boolean(historyFilters.toDate) ||
    historyFilters.status !== ALL_PERIODS;

  // The server counts every register matching the filters, so the cards keep
  // the same totals when the form master turns the page.
  const historyTotals = historyData?.summary ?? {
    presentCount: 0,
    absentCount: 0,
    unmarkedCount: 0,
    totalRegisters: 0,
  };

  const historyAggregateScope = `${
    historyTotals.totalRegisters ?? 0
  } register${historyTotals.totalRegisters === 1 ? "" : "s"}`;

  const firstHistoryRow = historyPagination.totalItems
    ? (historyPagination.currentPage - 1) * historyPagination.pageSize + 1
    : 0;
  const lastHistoryRow = Math.min(
    historyPagination.currentPage * historyPagination.pageSize,
    historyPagination.totalItems
  );

  const updateHistoryFilters = (changes) => {
    setHistoryFilters((previous) => ({ ...previous, ...changes }));
    setHistoryPage(1);
    setHistoryMessage("");
  };

  const resetHistoryFilters = () => {
    setHistoryFilters({
      sessionId: ALL_PERIODS,
      termId: ALL_PERIODS,
      fromDate: "",
      toDate: "",
      status: ALL_PERIODS,
    });
    setHistoryPage(1);
    setHistoryMessage("");
  };

  const openRegisterModal = async (register) => {
    const requestId = (detailRequestIdRef.current += 1);
    setRegisterModal({
      registerId: register.id,
      loading: true,
      error: "",
      saveError: "",
      saving: false,
      detail: null,
      students: [],
    });

    try {
      const payload = await getAttendanceRegister(register.id);
      if (requestId !== detailRequestIdRef.current) return;

      const data = payload?.data;
      if (!data || !Array.isArray(data.students) || !data.attendanceRegister) {
        throw new Error("The server returned an invalid attendance register response.");
      }

      setRegisterModal({
        registerId: register.id,
        loading: false,
        error: "",
        saveError: "",
        saving: false,
        detail: data,
        students: data.students.map((student) => ({
          ...student,
          firstName: student.firstName ?? "",
          surname: student.surName ?? "",
        })),
      });
    } catch (requestError) {
      if (requestId !== detailRequestIdRef.current) return;

      setRegisterModal({
        registerId: register.id,
        loading: false,
        error:
          requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load this attendance register.",
        saveError: "",
        saving: false,
        detail: null,
        students: [],
      });
    }
  };

  const closeRegisterModal = () => {
    detailRequestIdRef.current += 1;
    setRegisterModal(null);
  };

  const toggleModalStudent = (studentId, status) => {
    setRegisterModal((previous) =>
      previous
        ? {
            ...previous,
            saveError: "",
            students: previous.students.map((student) =>
              student.studentId === studentId ? { ...student, status } : student
            ),
          }
        : previous
    );
  };

  const saveRegisterCorrections = async () => {
    if (!registerModal?.detail || registerModal.saving) return;

    setRegisterModal((previous) => ({
      ...previous,
      saving: true,
      saveError: "",
    }));

    try {
      const payload = await submitAttendanceRequest(
        registerModal.registerId,
        registerModal.students.map((student) => ({
          studentId: student.studentId,
          status: student.status,
        }))
      );

      closeRegisterModal();
      setHistoryMessage(
        payload?.message || "Attendance corrections saved successfully."
      );
      setHistoryRefreshToken((value) => value + 1);

      if (registerModal.registerId === currentRegister?.id) {
        setTodayRefreshKey((value) => value + 1);
      }
    } catch (requestError) {
      setRegisterModal((previous) =>
        previous
          ? {
              ...previous,
              saving: false,
              saveError:
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Unable to save the attendance corrections.",
            }
          : previous
      );
    }
  };

  const exportHistoryCsv = async () => {
    if (exporting) return;

    setExporting(true);
    setExportMessage("");
    setExportError("");

    try {
      const { records, truncated } = await collectAllPages(({ page, limit }) =>
        getMyAttendanceHistory(buildHistoryParams(historyFilters, { page, limit })).then(
          (payload) => ({
            records: Array.isArray(payload?.data?.registers)
              ? payload.data.registers
              : [],
            totalPages: payload?.pagination?.totalPages,
          })
        )
      );

      if (!records.length) {
        setExportMessage(
          "There are no attendance registers to export for these filters."
        );
        return;
      }

      const classLabel = getClassLabel(historyData?.class);
      const rows = [
        [
          "Date",
          "Class",
          "Academic session",
          "Term",
          "Register status",
          "Total students",
          "Present",
          "Absent",
          "Unconfirmed",
        ],
        ...records.map((register) => [
          register?.attendanceDate ?? "",
          classLabel,
          register?.session?.sessionName ?? "",
          register?.term?.termName ?? "",
          register?.status === "SUBMITTED" ? "Completed" : "Draft",
          register?.attendanceSummary?.totalStudents ?? 0,
          register?.attendanceSummary?.presentCount ?? 0,
          register?.attendanceSummary?.absentCount ?? 0,
          register?.attendanceSummary?.unconfirmedCount ?? 0,
        ]),
      ];

      downloadFile(toCsv(rows), "scholanode-attendance-history.csv");
      setExportMessage(
        truncated
          ? `Export stopped at ${records.length} records to keep the file manageable. Narrow the filters for the rest.`
          : `${records.length} register${records.length === 1 ? "" : "s"} exported.`
      );
    } catch (requestError) {
      setExportError(
        requestError?.response?.data?.message ||
          "The export could not be generated. Please try again."
      );
    } finally {
      setExporting(false);
    }
  };

  const historyClassLabel = getClassLabel(historyData?.class);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(73,166,255,0.09),_transparent_38%),#f8fafc]">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 transition hover:text-[#123A8F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#061541] via-[#0A2463] to-[#1747A1] p-6 text-white shadow-[0_24px_60px_-30px_rgba(7,26,82,0.65)] sm:p-9">
          <div aria-hidden="true" className="absolute -right-24 -top-36 -z-10 h-96 w-96 rounded-full border-[50px] border-white/[0.06]" />
          <div aria-hidden="true" className="absolute -bottom-28 right-[28%] -z-10 h-56 w-56 rounded-full bg-cyan-300/[0.08] blur-2xl" />
          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-cyan-100 backdrop-blur-sm">
                  <ClipboardCheck size={15} />
                  Form Master Workspace
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  {todayLoading
                    ? "Loading today"
                    : todayError
                      ? "Unavailable"
                      : "Live today"}
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Student attendance
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Take today’s register, keep track of every student, and review
                previous attendance records in one place.
              </p>
            </div>

            <div className="grid w-full max-w-md grid-cols-2 gap-3 lg:max-w-[340px]">
              <div className="col-span-2 rounded-2xl border border-white/15 bg-white/[0.09] p-4 backdrop-blur-md">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-200">
                  Assigned class
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-extrabold tracking-tight">
                      {todayLoading
                        ? "Loading class…"
                        : getClassLabel(todayAttendance?.class)}
                    </p>
                    {getFormMasterName(todayAttendance?.formMaster) ? (
                      <>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-blue-100">
                          <span>
                            Form Master · {getFormMasterName(todayAttendance.formMaster)}
                          </span>
                          {isProfilePending(todayAttendance.formMaster) && (
                            <ProfilePendingBadge />
                          )}
                        </p>
                        {isProfilePending(todayAttendance.formMaster) && (
                          <p className="mt-1 text-xs text-cyan-200">
                            {PENDING_PROFILE_HINT}
                          </p>
                        )}
                        {todayAttendance.formMaster.loginId && (
                          <p className="mt-1 text-xs font-semibold text-cyan-200">
                            Login ID · {todayAttendance.formMaster.loginId}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="mt-1 text-xs text-blue-100">
                        {todayLoading ? "Loading form master…" : "Form master information unavailable"}
                      </p>
                    )}
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-100">
                    <Users size={21} />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-200">Attendance date</p>
                <p className="mt-1.5 text-sm font-bold">
                  {todayLoading ? "Loading…" : formatDate(todayAttendance?.attendanceDate || attendanceDate)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-200">Register</p>
                <div className="mt-1.5"><RegisterStatusBadge status={registerStatus} /></div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-200">Academic session</p>
                <p className="mt-1.5 text-sm font-bold">
                  {todayLoading
                    ? "Loading…"
                    : todayAttendance?.academicPeriod?.session?.sessionName ||
                      "No active session"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-200">Term</p>
                <p className="mt-1.5 text-sm font-bold">
                  {todayLoading
                    ? "Loading…"
                    : todayAttendance?.academicPeriod?.term?.termName ||
                      "No active term"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            <TabButton
              active={activeTab === "daily"}
              icon={ClipboardCheck}
              onClick={() => changeTab("daily")}
            >
              Daily Attendance
            </TabButton>

            <TabButton
              active={activeTab === "history"}
              icon={History}
              onClick={() => changeTab("history")}
            >
              Attendance History
            </TabButton>
          </div>

          <button
            type="button"
            onClick={returnToToday}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            title="Discard unsaved changes and show the latest saved register"
          >
            <RotateCcw size={15} />
            Return to today
          </button>
        </div>

        {activeTab === "daily" ? (
          todayLoading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <Loader2 size={28} className="animate-spin text-[#123A8F]" />
              <p className="mt-4 font-bold text-slate-800">Loading today’s attendance</p>
              <p className="mt-1 text-sm text-slate-500">Getting your assigned class and student roster.</p>
            </div>
          ) : todayError ? (
            <div role="alert" className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertTriangle size={22} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900">Could not load today’s attendance</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-rose-700">{todayError}</p>
              <button
                type="button"
                onClick={() => {
                  setTodayError("");
                  setTodayLoading(true);
                  setTodayRefreshKey((value) => value + 1);
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123A8F]"
              >
                <RotateCcw size={16} />
                Try again
              </button>
            </div>
          ) : !todayAttendance?.attendanceRegister ? (
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-blue-50 via-white to-cyan-50 px-6 py-10 text-center sm:px-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-[#123A8F]">
                  <ClipboardCheck size={28} />
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
                  {getClassLabel(todayAttendance?.class)}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#071A52]">
                  No attendance started for today
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  There is no register for this class yet today. Start a
                  register to load the roster and record each student’s
                  attendance.
                </p>
                <button
                  type="button"
                  onClick={takeAttendance}
                  disabled={creatingToday}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#123A8F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                >
                  {creatingToday ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <ClipboardCheck size={17} />
                  )}
                  {creatingToday ? "Starting register…" : "Take Attendance"}
                </button>
                {createTodayError && (
                  <p role="alert" className="mx-auto mt-4 max-w-lg rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {createTodayError}
                  </p>
                )}
                {message && (
                  <p role="status" className="mx-auto mt-4 max-w-lg rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900">
                    {message}
                  </p>
                )}
                <p className="mt-4 text-xs text-slate-400">
                  Attendance can be created for {formatDate(todayAttendance?.attendanceDate)}.
                </p>
              </div>
            </section>
          ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Total students"
                value={currentCounts.total}
                description="Students in your assigned class"
                icon={Users}
                color="navy"
              />
              <SummaryCard
                title="Present"
                value={currentCounts.present}
                description="Marked present"
                icon={UserCheck}
                color="green"
              />
              <SummaryCard
                title="Absent"
                value={currentCounts.absent}
                description="Marked absent"
                icon={UserX}
                color="red"
              />
              <SummaryCard
                title="Unconfirmed"
                value={currentCounts.unconfirmed}
                description="Still need an attendance decision"
                icon={Info}
                color="amber"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      Daily class register
                    </h2>
                    <RegisterStatusBadge status={registerStatus} />
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {isReadOnly
                      ? "This register is read-only. It can only be changed while its session and term are the school's current ones."
                      : "Select Present or Absent for each student. Click a selected status again to clear it."}
                  </p>
                </div>

                <FilterField label="Attendance date">
                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      value={attendanceDate}
                      max={todayAttendance?.attendanceDate || undefined}
                      disabled
                      title="This page always shows the register date the server assigned."
                      className="rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </FilterField>
              </div>

              {!canEditToday && currentRegister?.id && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <LockKeyhole size={18} className="mt-0.5 shrink-0" />
                  <p className="leading-5">{NO_EDIT_REASON}</p>
                </div>
              )}

              {canEditToday && registerStatus === "SUBMITTED" && !isEditingSubmitted && (
                <div className="mt-5 flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white p-2 text-emerald-700">
                      <LockKeyhole size={19} />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-900">
                        Attendance Completed
                      </p>
                      <p className="mt-1 text-sm leading-5 text-emerald-800">
                        This register is completed. You can update it if you need
                        to correct a student's status.
                      </p>
                      <p className="mt-2 text-xs text-emerald-800">
                        Last updated: {formatDateTime(currentRegister?.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isEditingSubmitted && (
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                  <p className="font-semibold">Editing a submitted register</p>
                  <p className="mt-1 leading-5">
                    Changes will update this same register. Saving marks it
                    completed again, so every student must be Present or Absent.
                  </p>
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                  <p className="text-xs font-medium text-emerald-700">
                    Present
                  </p>
                  <p className="mt-1 text-xl font-bold text-emerald-800">
                    {currentCounts.present}
                  </p>
                </div>

                <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3">
                  <p className="text-xs font-medium text-rose-700">Absent</p>
                  <p className="mt-1 text-xl font-bold text-rose-800">
                    {currentCounts.absent}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                  <p className="text-xs font-medium text-amber-700">
                    Unconfirmed
                  </p>
                  <p className="mt-1 text-xl font-bold text-amber-800">
                    {currentCounts.unconfirmed}
                  </p>
                </div>
              </div>

              {!isReadOnly && currentCounts.unconfirmed > 0 && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <Info size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">
                      {currentCounts.unconfirmed} student
                      {currentCounts.unconfirmed === 1 ? " is" : "s are"}{" "}
                      unconfirmed.
                    </p>
                    <p className="mt-1 leading-5 text-amber-800">
                      You may save a draft and continue later. You cannot
                      submit until every student is marked Present or Absent.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                >
                  {error}
                </div>
              )}

              {message && (
                <div
                  role="status"
                  className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900"
                >
                  {message}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search students..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {!isReadOnly && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={markAllPresent}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      <UserCheck size={16} />
                      Mark all present
                    </button>

                    <button
                      type="button"
                      onClick={clearAttendance}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <RotateCcw size={16} />
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Admission number</th>
                      <th className="px-4 py-3">Attendance status</th>
                      <th className="px-4 py-3">Current status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar student={student} />
                            <div>
                              <p className="font-semibold text-slate-800">
                                {student.firstName} {student.surname}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {student.gender}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-500">
                          {student.admissionNumber}
                        </td>

                        <td className="px-4 py-3">
                          <AttendanceToggle
                            status={student.status}
                            disabled={isReadOnly}
                            onChange={(status) =>
                              updateStudentStatus(student.id, status)
                            }
                          />
                        </td>

                        <td className="px-4 py-3">
                          <StatusLabel status={student.status} />
                        </td>
                      </tr>
                    ))}

                    {filteredStudents.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-10 text-center text-sm text-slate-500"
                        >
                          No students match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 space-y-3 md:hidden">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar student={student} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800">
                          {student.firstName} {student.surname}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {student.admissionNumber}
                        </p>
                      </div>
                      <StatusLabel status={student.status} />
                    </div>

                    <div className="mt-4">
                      <AttendanceToggle
                        status={student.status}
                        disabled={isReadOnly}
                        onChange={(status) =>
                          updateStudentStatus(student.id, status)
                        }
                      />
                    </div>
                  </div>
                ))}

                {filteredStudents.length === 0 && (
                  <p className="rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-500">
                    No students match your search.
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-500">
                  Register date: <strong>{formatDate(attendanceDate)}</strong>
                  <br />
                  {currentRegister?.updatedAt
                    ? `Last updated: ${formatDateTime(currentRegister.updatedAt)}`
                    : "Nothing has been saved to this register yet."}
                  {unsavedChanges ? " · You have changes that are not saved." : ""}
                </p>

                {isReadOnly ? (
                  canEditToday ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingSubmitted(true);
                        setMessage("Editing submitted attendance. Save your changes when finished.");
                        setError("");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123A8F]"
                    >
                      <Pencil size={17} />
                      Edit Attendance
                    </button>
                  ) : null
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={isEditingSubmitted ? saveChanges : saveDraft}
                      disabled={savingAttendance || submittingAttendance || !canSaveAttendance}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingAttendance ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                      {savingAttendance
                        ? "Saving…"
                        : isEditingSubmitted
                          ? "Save Changes"
                          : "Save Draft"}
                    </button>

                    <button
                      type="button"
                      onClick={submitAttendance}
                      disabled={savingAttendance || submittingAttendance || !canSaveAttendance}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingAttendance ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : isEditingSubmitted ? (
                        <FileCheck2 size={17} />
                      ) : (
                        <Send size={17} />
                      )}
                      {submittingAttendance
                        ? "Submitting…"
                        : isEditingSubmitted
                          ? "Submit Updated Attendance"
                          : "Submit Attendance"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
          )
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Attendance history
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {historyLoading && !historyData
                      ? "Loading your attendance registers…"
                      : `Every register saved for ${historyClassLabel}, newest first.`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exportHistoryCsv}
                  disabled={exporting}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {exporting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {exporting ? "Exporting…" : "Export CSV"}
                </button>
              </div>

              {(exportMessage || exportError) && (
                <p
                  role={exportError ? "alert" : "status"}
                  className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                    exportError
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-blue-200 bg-blue-50 text-blue-900"
                  }`}
                >
                  {exportError || exportMessage}
                </p>
              )}

              {historyMessage && (
                <p
                  role="status"
                  className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                >
                  {historyMessage}
                </p>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FilterField label="Academic session">
                  <select
                    value={historyFilters.sessionId}
                    onChange={(event) =>
                      updateHistoryFilters({
                        sessionId: event.target.value,
                        termId: ALL_PERIODS,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value={ALL_PERIODS}>All sessions</option>
                    {sessionOptions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.sessionName}
                      </option>
                    ))}
                  </select>
                </FilterField>

                <FilterField label="Term">
                  <select
                    value={historyFilters.termId}
                    onChange={(event) =>
                      updateHistoryFilters({ termId: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value={ALL_PERIODS}>All terms</option>
                    {termOptions.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.termName}
                      </option>
                    ))}
                  </select>
                </FilterField>

                <FilterField label="Register status">
                  <select
                    value={historyFilters.status}
                    onChange={(event) =>
                      updateHistoryFilters({ status: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value={ALL_PERIODS}>Any status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SUBMITTED">Completed</option>
                  </select>
                </FilterField>

                <FilterField label="From date">
                  <input
                    type="date"
                    value={historyFilters.fromDate}
                    max={historyFilters.toDate || todayAttendance?.attendanceDate || undefined}
                    onChange={(event) =>
                      updateHistoryFilters({ fromDate: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </FilterField>

                <FilterField label="To date">
                  <input
                    type="date"
                    value={historyFilters.toDate}
                    min={historyFilters.fromDate || undefined}
                    max={todayAttendance?.attendanceDate || undefined}
                    onChange={(event) =>
                      updateHistoryFilters({ toDate: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </FilterField>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={resetHistoryFilters}
                    disabled={!hasActiveHistoryFilters}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw size={15} />
                    Reset filters
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Registers found"
                value={historyPagination.totalItems}
                description="Matching your selected filters"
                icon={CalendarDays}
                color="navy"
              />

              <SummaryCard
                title="Present"
                value={historyTotals.presentCount}
                description={`Total across the ${historyAggregateScope} matching these filters`}
                icon={UserCheck}
                color="green"
              />

              <SummaryCard
                title="Absent"
                value={historyTotals.absentCount}
                description={`Total across the ${historyAggregateScope} matching these filters`}
                icon={UserX}
                color="red"
              />

              <SummaryCard
                title="Unconfirmed"
                value={historyTotals.unmarkedCount}
                description={`Total across the ${historyAggregateScope} matching these filters`}
                icon={Info}
                color="amber"
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="font-bold text-slate-900">Previous registers</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Correct a register while its session and term are still the
                    school's current ones.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#123A8F]">
                  Page {historyPagination.currentPage} of{" "}
                  {Math.max(historyPagination.totalPages, 1)}
                </span>
              </div>

              {historyError ? (
                <div className="p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                    <AlertTriangle size={22} />
                  </div>
                  <p className="mt-3 font-bold text-slate-900">
                    Attendance history could not be loaded
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-rose-700">
                    {historyError}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setHistoryRefreshToken((value) => value + 1)
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123A8F]"
                  >
                    <RotateCcw size={16} />
                    Retry
                  </button>
                </div>
              ) : historyLoading && !historyData ? (
                <HistorySkeleton />
              ) : (
                <>
                  <div
                    className={`overflow-x-auto transition-opacity ${
                      historyLoading ? "opacity-60" : ""
                    }`}
                  >
                    <table className="w-full min-w-[940px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-5 py-3">Date</th>
                          <th className="px-5 py-3">Session</th>
                          <th className="px-5 py-3">Term</th>
                          <th className="px-5 py-3">Present</th>
                          <th className="px-5 py-3">Absent</th>
                          <th className="px-5 py-3">Unconfirmed</th>
                          <th className="px-5 py-3">Register status</th>
                          <th className="px-5 py-3">Action</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {historyRegisters.map((register) => {
                          const isTodaysRegister =
                            Boolean(todayAttendance?.attendanceDate) &&
                            register.attendanceDate ===
                              todayAttendance.attendanceDate;
                          const summary = register.attendanceSummary || {};

                          return (
                            <tr
                              key={register.id}
                              className="transition hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-4">
                                <p className="font-semibold text-slate-800">
                                  {formatDate(register.attendanceDate)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {historyClassLabel}
                                </p>
                              </td>

                              <td className="px-5 py-4 font-medium text-slate-700">
                                {register.session?.sessionName || "—"}
                              </td>

                              <td className="px-5 py-4 font-medium text-slate-700">
                                {register.term?.termName || "—"}
                              </td>

                              <td className="px-5 py-4 font-semibold text-emerald-700">
                                {summary.presentCount ?? 0}
                              </td>

                              <td className="px-5 py-4 font-semibold text-rose-700">
                                {summary.absentCount ?? 0}
                              </td>

                              <td className="px-5 py-4 font-semibold text-amber-700">
                                {summary.unconfirmedCount ?? 0}
                              </td>

                              <td className="px-5 py-4">
                                <RegisterStatusBadge status={register.status} />
                              </td>

                              <td className="px-5 py-4">
                                {isTodaysRegister ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveTab("daily");
                                      setMessage(
                                        "Today's register is marked on the Daily Attendance tab."
                                      );
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#123A8F] hover:bg-blue-50"
                                  >
                                    <ClipboardCheck size={14} />
                                    Daily tab
                                  </button>
                                ) : register.canEdit ? (
                                  <button
                                    type="button"
                                    onClick={() => openRegisterModal(register)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#123A8F] hover:bg-blue-50"
                                  >
                                    <Pencil size={14} />
                                    Edit
                                  </button>
                                ) : (
                                  <div className="space-y-1">
                                    <button
                                      type="button"
                                      onClick={() => openRegisterModal(register)}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                      <History size={14} />
                                      View
                                    </button>
                                    <p className="max-w-[190px] text-[11px] leading-4 text-slate-400">
                                      {NO_EDIT_REASON}
                                    </p>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                        {historyRegisters.length === 0 && !historyLoading && (
                          <tr>
                            <td colSpan={8} className="px-5 py-14 text-center">
                              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <Filter size={22} />
                              </div>
                              <p className="mt-3 font-semibold text-slate-800">
                                {hasActiveHistoryFilters
                                  ? "No registers match these filters"
                                  : "No attendance recorded yet"}
                              </p>
                              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                                {hasActiveHistoryFilters
                                  ? "Try a different session, term, date range, or status."
                                  : "Registers will appear here once you start taking attendance for your class."}
                              </p>
                              {hasActiveHistoryFilters && (
                                <button
                                  type="button"
                                  onClick={resetHistoryFilters}
                                  className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                >
                                  Clear filters
                                </button>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-[11px] text-slate-500">
                      {historyPagination.totalItems > 0 ? (
                        <>
                          Showing{" "}
                          <strong className="text-slate-700">
                            {firstHistoryRow}–{lastHistoryRow}
                          </strong>{" "}
                          of{" "}
                          <strong className="text-slate-700">
                            {historyPagination.totalItems}
                          </strong>{" "}
                          registers
                        </>
                      ) : (
                        "No registers to show"
                      )}
                    </p>

                    <div className="flex items-center gap-2">
                      <select
                        value={historyLimit}
                        onChange={(event) => {
                          setHistoryLimit(Number(event.target.value));
                          setHistoryPage(1);
                        }}
                        aria-label="Rows per page"
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-600 outline-none focus:border-blue-500"
                      >
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          setHistoryPage((value) => Math.max(1, value - 1))
                        }
                        disabled={historyLoading || historyPagination.currentPage <= 1}
                        aria-label="Previous page"
                        className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <span className="min-w-20 text-center text-[11px] font-bold text-slate-600">
                        Page {historyPagination.currentPage} of{" "}
                        {Math.max(historyPagination.totalPages, 1)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setHistoryPage((value) => value + 1)}
                        disabled={
                          historyLoading ||
                          historyPagination.currentPage >=
                            historyPagination.totalPages
                        }
                        aria-label="Next page"
                        className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <RegisterModal
        state={registerModal}
        classLabel={historyClassLabel}
        onClose={closeRegisterModal}
        onRetry={() => {
          const register = historyRegisters.find(
            (item) => item.id === registerModal?.registerId
          );
          if (register) openRegisterModal(register);
          else closeRegisterModal();
        }}
        onToggleStudent={toggleModalStudent}
        onSave={saveRegisterCorrections}
      />

      <IncompleteSubmissionModal
        open={submissionPromptOpen}
        unconfirmed={currentCounts.unconfirmed}
        error={error}
        saving={savingAttendance}
        onReturn={() => setSubmissionPromptOpen(false)}
        onSaveDraft={saveDraft}
      />
    </div>
  );
}
