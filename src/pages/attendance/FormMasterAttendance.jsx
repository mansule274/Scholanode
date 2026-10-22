import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileCheck2,
  Filter,
  History,
  Info,
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
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  createTodayAttendance,
  getTodayAttendance,
  saveAttendanceDraft as saveAttendanceDraftRequest,
  submitAttendance as submitAttendanceRequest,
} from "./attendanceApi";
import { useUserContext } from "../../context/UserContext";

const getLocalToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const TODAY = getLocalToday();
const CURRENT_SESSION = "2026/2027";
const CURRENT_TERM = "FIRST_TERM";
const CLASS_NAME = "Primary 5A";
const ATTENDANCE_BACKUP_PREFIX = "scholanode:attendance-backup:";

const MOCK_SESSIONS = [
  {
    id: "2026/2027",
    label: "2026/2027",
    terms: [
      {
        id: "FIRST_TERM",
        name: "First Term",
        startDate: "2026-09-14",
        endDate: "2026-12-18",
      },
      {
        id: "SECOND_TERM",
        name: "Second Term",
        startDate: "2027-01-04",
        endDate: "2027-04-02",
      },
      {
        id: "THIRD_TERM",
        name: "Third Term",
        startDate: "2027-04-26",
        endDate: "2027-07-23",
      },
    ],
  },
  {
    id: "2025/2026",
    label: "2025/2026",
    terms: [
      {
        id: "FIRST_TERM",
        name: "First Term",
        startDate: "2025-09-15",
        endDate: "2025-12-19",
      },
      {
        id: "SECOND_TERM",
        name: "Second Term",
        startDate: "2026-01-05",
        endDate: "2026-04-03",
      },
      {
        id: "THIRD_TERM",
        name: "Third Term",
        startDate: "2026-04-20",
        endDate: "2026-07-24",
      },
    ],
  },
];

const INITIAL_STUDENTS = [
  {
    id: "STU001",
    admissionNumber: "SN/2026/001",
    firstName: "Amina",
    surname: "Yusuf",
    gender: "Female",
  },
  {
    id: "STU002",
    admissionNumber: "SN/2026/002",
    firstName: "Ibrahim",
    surname: "Musa",
    gender: "Male",
  },
  {
    id: "STU003",
    admissionNumber: "SN/2026/003",
    firstName: "Fatima",
    surname: "Abdullahi",
    gender: "Female",
  },
  {
    id: "STU004",
    admissionNumber: "SN/2026/004",
    firstName: "Yusuf",
    surname: "Bello",
    gender: "Male",
  },
  {
    id: "STU005",
    admissionNumber: "SN/2026/005",
    firstName: "Maryam",
    surname: "Sani",
    gender: "Female",
  },
  {
    id: "STU006",
    admissionNumber: "SN/2026/006",
    firstName: "Usman",
    surname: "Garba",
    gender: "Male",
  },
  {
    id: "STU007",
    admissionNumber: "SN/2026/007",
    firstName: "Zainab",
    surname: "Ahmed",
    gender: "Female",
  },
  {
    id: "STU008",
    admissionNumber: "SN/2026/008",
    firstName: "Abdullahi",
    surname: "Isah",
    gender: "Male",
  },
  {
    id: "STU009",
    admissionNumber: "SN/2026/009",
    firstName: "Hauwa",
    surname: "Suleiman",
    gender: "Female",
  },
  {
    id: "STU010",
    admissionNumber: "SN/2026/010",
    firstName: "Mustapha",
    surname: "Lawal",
    gender: "Male",
  },
];

const MOCK_HISTORY = [
  {
    id: "HIST001",
    date: "2026-10-16",
    session: "2026/2027",
    term: "FIRST_TERM",
    className: CLASS_NAME,
    total: 10,
    present: 8,
    absent: 1,
    unconfirmed: 1,
    status: "DRAFT",
    savedAt: "2026-10-16T09:10:00",
  },
  {
    id: "HIST002",
    date: "2026-10-15",
    session: "2026/2027",
    term: "FIRST_TERM",
    className: CLASS_NAME,
    total: 10,
    present: 9,
    absent: 1,
    unconfirmed: 0,
    status: "SUBMITTED",
    savedAt: "2026-10-15T09:05:00",
    submittedAt: "2026-10-15T09:10:00",
  },
  {
    id: "HIST003",
    date: "2026-10-14",
    session: "2026/2027",
    term: "FIRST_TERM",
    className: CLASS_NAME,
    total: 10,
    present: 7,
    absent: 2,
    unconfirmed: 1,
    status: "DRAFT",
    savedAt: "2026-10-14T09:12:00",
  },
  {
    id: "HIST004",
    date: "2026-10-13",
    session: "2026/2027",
    term: "FIRST_TERM",
    className: CLASS_NAME,
    total: 10,
    present: 10,
    absent: 0,
    unconfirmed: 0,
    status: "SUBMITTED",
    savedAt: "2026-10-13T08:58:00",
    submittedAt: "2026-10-13T09:00:00",
  },
  {
    id: "HIST005",
    date: "2026-10-12",
    session: "2026/2027",
    term: "FIRST_TERM",
    className: CLASS_NAME,
    total: 10,
    present: 8,
    absent: 2,
    unconfirmed: 0,
    status: "SUBMITTED",
    savedAt: "2026-10-12T09:02:00",
    submittedAt: "2026-10-12T09:05:00",
  },
  {
    id: "HIST006",
    date: "2026-07-22",
    session: "2025/2026",
    term: "THIRD_TERM",
    className: CLASS_NAME,
    total: 10,
    present: 9,
    absent: 1,
    unconfirmed: 0,
    status: "SUBMITTED",
    savedAt: "2026-07-22T09:03:00",
    submittedAt: "2026-07-22T09:06:00",
  },
  {
    id: "HIST007",
    date: "2026-07-21",
    session: "2025/2026",
    term: "THIRD_TERM",
    className: CLASS_NAME,
    total: 10,
    present: 8,
    absent: 2,
    unconfirmed: 0,
    status: "SUBMITTED",
    savedAt: "2026-07-21T09:08:00",
    submittedAt: "2026-07-21T09:12:00",
  },
];

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

const getAttendanceBackupKeys = (identity) => {
  const identityPrefix = `${ATTENDANCE_BACKUP_PREFIX}${[
    identity.schoolId,
    identity.formMasterId,
    identity.classId,
  ]
    .map((value) => encodeURIComponent(value))
    .join(":")}:`;

  return {
    identityPrefix,
    key: `${identityPrefix}${encodeURIComponent(identity.attendanceDate)}`,
  };
};

const getAttendanceIdentity = (data, user, school) => {
  const identity = {
    schoolId: school?.id ?? user?.schoolId ?? data?.class?.schoolId,
    formMasterId:
      data?.formMaster?.id ?? data?.class?.formMasterId ?? user?.id,
    classId: data?.class?.id,
    attendanceDate: data?.attendanceDate,
  };

  return Object.values(identity).every(Boolean) ? identity : null;
};

const getRegisterUpdatedAt = (register) => {
  const timestamp =
    register?.updatedAt ??
    register?.savedAt ??
    register?.submittedAt ??
    register?.createdAt;
  const parsedTimestamp = timestamp ? Date.parse(timestamp) : NaN;
  return Number.isFinite(parsedTimestamp) ? parsedTimestamp : null;
};

const saveAttendanceBackup = (identity, students, timestamp) => {
  if (!identity) return;

  const { key } = getAttendanceBackupKeys(identity);
  const backup = {
    schoolId: identity.schoolId,
    formMasterId: identity.formMasterId,
    classId: identity.classId,
    attendanceDate: identity.attendanceDate,
    students: students.map(({ studentId, status }) => ({ studentId, status })),
    updatedAt: timestamp,
  };

  window.localStorage.setItem(key, JSON.stringify(backup));
};

const removeAttendanceBackup = (identity) => {
  if (!identity) return;
  const { key } = getAttendanceBackupKeys(identity);
  window.localStorage.removeItem(key);
};

const removePreviousDateBackups = (identity) => {
  if (!identity) return;
  const { identityPrefix, key: currentKey } = getAttendanceBackupKeys(identity);
  const previousKeys = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith(identityPrefix) && key !== currentKey) {
      previousKeys.push(key);
    }
  }

  previousKeys.forEach((key) => window.localStorage.removeItem(key));
};

const restoreAttendanceBackup = (identity, roster, register) => {
  if (!identity) return null;

  const { key } = getAttendanceBackupKeys(identity);
  const serializedBackup = window.localStorage.getItem(key);
  if (!serializedBackup) return null;

  let backup;
  try {
    backup = JSON.parse(serializedBackup);
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }

  const isMatchingBackup =
    backup?.schoolId === identity.schoolId &&
    backup?.formMasterId === identity.formMasterId &&
    backup?.classId === identity.classId &&
    backup?.attendanceDate === identity.attendanceDate &&
    Array.isArray(backup.students) &&
    Number.isFinite(Date.parse(backup.updatedAt));

  if (!isMatchingBackup) {
    window.localStorage.removeItem(key);
    return null;
  }

  const backupTimestamp = Date.parse(backup.updatedAt);
  const serverTimestamp = getRegisterUpdatedAt(register);
  if (serverTimestamp !== null && backupTimestamp <= serverTimestamp) {
    window.localStorage.removeItem(key);
    return null;
  }

  const backupByStudentId = new Map(
    backup.students
      .filter(
        (item) =>
          typeof item?.studentId === "string" &&
          (item.status === null ||
            item.status === "PRESENT" ||
            item.status === "ABSENT")
      )
      .map((item) => [item.studentId, item.status])
  );
  const appliedStudentIds = [];
  const mergedRoster = roster.map((student) => {
    if (!backupByStudentId.has(student.id)) return student;

    const backupStatus = backupByStudentId.get(student.id);
    if (serverTimestamp === null && student.status !== null && student.status !== backupStatus) {
      appliedStudentIds.push(student.id);
      return student;
    }
    if (student.status === backupStatus) return student;

    appliedStudentIds.push(student.id);
    return { ...student, status: backupStatus };
  });

  if (appliedStudentIds.length === 0) {
    window.localStorage.removeItem(key);
    return null;
  }

  return {
    students: mergedRoster,
    appliedStudentIds: [...new Set(appliedStudentIds)],
    hasServerConflict:
      serverTimestamp === null &&
      backup.students.some((item) => {
        const serverStudent = roster.find((student) => student.id === item.studentId);
        return (
          serverStudent &&
          serverStudent.status !== null &&
          serverStudent.status !== item.status
        );
      }),
  };
};

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

const getFormMasterName = (formMaster) =>
  [formMaster?.firstName, formMaster?.surName]
    .filter(Boolean)
    .join(" ") ||
  formMaster?.fullName ||
  formMaster?.name ||
  "";

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

const formatTerm = (termId) => {
  if (!termId || termId === "ALL") return "All terms";

  const term = MOCK_SESSIONS.flatMap((session) => session.terms).find(
    (item) => item.id === termId
  );

  return term?.name || termId.replace("_TERM", "").replace("_", " ");
};

const getCounts = (students) => ({
  total: students.length,
  present: students.filter((student) => student.status === "PRESENT").length,
  absent: students.filter((student) => student.status === "ABSENT").length,
  unconfirmed: students.filter((student) => !student.status).length,
});

const getUnconfirmed = (record) =>
  record.unconfirmed ??
  Math.max(0, record.total - record.present - record.absent);

const getMockStudents = (record) => {
  let presentLeft = record.present;
  let absentLeft = record.absent;

  return INITIAL_STUDENTS.map((student) => {
    let status = null;

    if (presentLeft > 0) {
      status = "PRESENT";
      presentLeft -= 1;
    } else if (absentLeft > 0) {
      status = "ABSENT";
      absentLeft -= 1;
    }

    return { ...student, status };
  });
};

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

function HistoryModal({
  record,
  onClose,
  onContinueDraft,
  onEditAttendance,
}) {
  if (!record) return null;

  const students = record.students || getMockStudents(record);
  const counts = getCounts(students);
  const isDraft = record.status === "DRAFT";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-[#123A8F]">
              <History size={17} />
              Attendance register details
            </div>

            <h2
              id="history-modal-title"
              className="mt-1 text-xl font-bold text-slate-900"
            >
              {formatDate(record.date)}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {record.className} · {record.session} ·{" "}
              {formatTerm(record.term)}
            </p>

            <div className="mt-3">
              <RegisterStatusBadge status={record.status} />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close attendance details"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-210px)] space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Total students" value={counts.total} color="navy" />
            <MiniStat label="Present" value={counts.present} color="green" />
            <MiniStat label="Absent" value={counts.absent} color="red" />
            <MiniStat
              label="Unconfirmed"
              value={counts.unconfirmed}
              color="amber"
            />
          </div>

          {isDraft && counts.unconfirmed > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">This draft is incomplete.</p>
                <p className="mt-1 leading-5">
                  {counts.unconfirmed} student
                  {counts.unconfirmed === 1 ? " remains" : "s remain"}{" "}
                  unconfirmed. Continue this draft to finish the register.
                </p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Admission number</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {student.firstName} {student.surname}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {student.admissionNumber}
                    </td>
                    <td className="px-4 py-3">
                      <StatusLabel status={student.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
            <p>Last saved: {formatDateTime(record.savedAt)}</p>
            {record.status === "SUBMITTED" && (
              <p>Submitted: {formatDateTime(record.submittedAt)}</p>
            )}
          </div>

          <p className="text-xs text-slate-500">
            {isDraft
              ? "This register remains a draft until all students are confirmed and attendance is submitted."
              : "This submitted register is read-only until you explicitly choose to edit it."}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>

          {isDraft ? (
            <button
              type="button"
              onClick={() => onContinueDraft(record)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#123A8F]"
            >
              <Pencil size={16} />
              Continue Draft
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onEditAttendance(record)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#123A8F]"
            >
              <Pencil size={16} />
              Edit Attendance
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

export default function FormMasterAttendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, school } = useUserContext();
  const authenticatedUserId = user?.id;
  const authenticatedSchoolId = user?.schoolId;
  const contextSchoolId = school?.id;
  const [activeTab, setActiveTab] = useState("daily");
  const [attendanceDate, setAttendanceDate] = useState(TODAY);
  const [students, setStudents] = useState([]);
  const [savedRegisters, setSavedRegisters] = useState({});
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
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [submissionPromptOpen, setSubmissionPromptOpen] = useState(false);
  const [isEditingSubmitted, setIsEditingSubmitted] = useState(false);

  const [sessionFilter, setSessionFilter] = useState(CURRENT_SESSION);
  const [termFilter, setTermFilter] = useState(CURRENT_TERM);
  const [fromDate, setFromDate] = useState("2026-09-14");
  const [toDate, setToDate] = useState(TODAY);
  const [historySearch, setHistorySearch] = useState("");
  const dirtyStudentIdsRef = useRef(new Set());
  const serverStudentsRef = useRef([]);
  const routeRef = useRef(`${location.pathname}${location.search}${location.hash}`);
  const unsavedChangesRef = useRef(false);

  useEffect(() => {
    unsavedChangesRef.current = unsavedChanges;
  }, [unsavedChanges]);

  useEffect(() => {
    let active = true;

    getTodayAttendance()
      .then((response) => {
        const data = parseTodayAttendanceResponse(response);

        if (active) {
          setTodayAttendance(data);
          setAttendanceDate(data.attendanceDate);
          setToDate(data.attendanceDate);
          serverStudentsRef.current = data.students.map((student) => ({ ...student }));
          dirtyStudentIdsRef.current = new Set();
          const identity = getAttendanceIdentity(
            data,
            { id: authenticatedUserId, schoolId: authenticatedSchoolId },
            { id: contextSchoolId }
          );
          try {
            removePreviousDateBackups(identity);
            const backup = restoreAttendanceBackup(
              identity,
              data.students,
              data.attendanceRegister
            );
            if (backup) {
              setStudents(backup.students);
              dirtyStudentIdsRef.current = new Set(backup.appliedStudentIds);
              unsavedChangesRef.current = true;
              setUnsavedChanges(true);
              setMessage(
                backup.hasServerConflict
                  ? "Recovered local attendance changes. Some statuses differed from the server and were left unchanged; review those students before saving."
                  : "Recovered your unsaved attendance changes from this device."
              );
            } else {
              setStudents(data.students);
              unsavedChangesRef.current = false;
              setUnsavedChanges(false);
            }
          } catch (storageError) {
            setStudents(data.students);
            unsavedChangesRef.current = false;
            setUnsavedChanges(false);
            setError(
              `Attendance loaded, but local recovery storage is unavailable: ${
                storageError?.message || "unknown storage error"
              }`
            );
          }
          setSavedRegisters({});
        }
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
  }, [todayRefreshKey, authenticatedUserId, authenticatedSchoolId, contextSchoolId]);

  const currentCounts = useMemo(() => getCounts(students), [students]);

  const currentRegister =
    savedRegisters[attendanceDate] ||
    (todayAttendance?.attendanceDate === attendanceDate
      ? todayAttendance.attendanceRegister
      : null);
  const todayIdentity =
    todayAttendance?.attendanceDate === attendanceDate
      ? getAttendanceIdentity(
        todayAttendance,
        { id: authenticatedUserId, schoolId: authenticatedSchoolId },
        { id: contextSchoolId }
      )
      : null;
  const todayBackupIdentity = todayAttendance
    ? getAttendanceIdentity(
        todayAttendance,
        { id: authenticatedUserId, schoolId: authenticatedSchoolId },
        { id: contextSchoolId }
      )
    : null;
  const canSaveAttendance = Boolean(
    todayIdentity && currentRegister?.id && students.length
  );

  const registerStatus = currentRegister?.status || "NEW";

  const isReadOnly =
    registerStatus === "SUBMITTED" && !isEditingSubmitted;

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
      setToDate(data.attendanceDate);
      serverStudentsRef.current = data.students.map((student) => ({ ...student }));
      dirtyStudentIdsRef.current = new Set();
      setStudents(data.students);
      setUnsavedChanges(false);
      setSavedRegisters({});
      setSearchTerm("");
      setIsEditingSubmitted(false);
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

  const selectedSession = MOCK_SESSIONS.find(
    (session) => session.id === sessionFilter
  );

  const termOptions =
    sessionFilter === "ALL"
      ? MOCK_SESSIONS.flatMap((session) => session.terms).filter(
          (term, index, array) =>
            array.findIndex((item) => item.id === term.id) === index
        )
      : selectedSession?.terms || [];

  const filteredHistory = useMemo(() => {
    const recordsByDate = new Map();

    MOCK_HISTORY.forEach((record) => {
      recordsByDate.set(record.date, {
        ...record,
        students: getMockStudents(record),
      });
    });

    Object.values(savedRegisters).forEach((register) => {
      recordsByDate.set(register.date, register);
    });

    return [...recordsByDate.values()]
      .filter((record) => {
        if (sessionFilter !== "ALL" && record.session !== sessionFilter) {
          return false;
        }

        if (termFilter !== "ALL" && record.term !== termFilter) {
          return false;
        }

        if (fromDate && record.date < fromDate) return false;
        if (toDate && record.date > toDate) return false;

        const query = historySearch.trim().toLowerCase();

        if (query) {
          const matches = [
            record.className,
            record.session,
            formatTerm(record.term),
            record.date,
          ].some((value) => value.toLowerCase().includes(query));

          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [
    savedRegisters,
    sessionFilter,
    termFilter,
    fromDate,
    toDate,
    historySearch,
  ]);

  const applyLocalAttendanceChanges = (nextStudents, changedIds) => {
    setStudents(nextStudents);

    const baselineByStudentId = new Map(
      serverStudentsRef.current.map((student) => [student.id, student.status])
    );
    changedIds.forEach((studentId) => {
      const student = nextStudents.find((item) => item.id === studentId);
      if (student && student.status === baselineByStudentId.get(studentId)) {
        dirtyStudentIdsRef.current.delete(studentId);
      } else if (student) {
        dirtyStudentIdsRef.current.add(studentId);
      }
    });

    const isDirty = dirtyStudentIdsRef.current.size > 0;
    unsavedChangesRef.current = isDirty;
    setUnsavedChanges(isDirty);
    setMessage("");
    setError("");

    if (!todayIdentity) {
      if (todayAttendance?.attendanceDate === attendanceDate) {
        setError(
          "Attendance changed, but the school, form master, or class ID is unavailable for local backup."
        );
      }
      return;
    }
    try {
      if (!isDirty) {
        removeAttendanceBackup(todayIdentity);
        return;
      }

      const dirtyStatuses = nextStudents
        .filter((student) => dirtyStudentIdsRef.current.has(student.id))
        .map((student) => ({
          studentId: student.id,
          status: student.status,
        }));
      saveAttendanceBackup(todayIdentity, dirtyStatuses, new Date().toISOString());
    } catch (storageError) {
      setError(
        `Attendance changed, but the local backup could not be saved: ${
          storageError?.message || "unknown storage error"
        }`
      );
    }
  };

  const updateStudentStatus = (studentId, status) => {
    const nextStudents = students.map((student) =>
      student.id === studentId ? { ...student, status } : student
    );
    applyLocalAttendanceChanges(nextStudents, [studentId]);
  };

  const markAllPresent = () => {
    if (isReadOnly) return;

    const nextStudents = students.map((student) => ({
      ...student,
      status: "PRESENT",
    }));
    applyLocalAttendanceChanges(
      nextStudents,
      nextStudents.map((student) => student.id)
    );
  };

  const clearAttendance = () => {
    if (isReadOnly) return;

    const nextStudents = students.map((student) => ({
      ...student,
      status: null,
    }));
    applyLocalAttendanceChanges(
      nextStudents,
      nextStudents.map((student) => student.id)
    );
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

    const savedRegister = {
      ...currentRegister,
      ...register,
      date: register.attendanceDate,
      status: register.status,
      students: students.map((student) => ({ ...student })),
      total: response.data.totalStudents,
      present:
        expectedStatus === "SUBMITTED"
          ? response.data.presentCount
          : students.filter((student) => student.status === "PRESENT").length,
      absent:
        expectedStatus === "SUBMITTED"
          ? response.data.absentCount
          : students.filter((student) => student.status === "ABSENT").length,
      unconfirmed:
        expectedStatus === "DRAFT"
          ? response.data.unmarkedStudents
          : 0,
      savedAt: new Date().toISOString(),
      submittedAt:
        expectedStatus === "SUBMITTED"
          ? new Date().toISOString()
          : currentRegister?.submittedAt ?? null,
    };

    try {
      removeAttendanceBackup(todayIdentity);
    } catch (storageError) {
      throw new Error(
        `Attendance was saved, but its local backup could not be cleared: ${
          storageError?.message || "unknown storage error"
        }`,
        { cause: storageError }
      );
    }

    serverStudentsRef.current = students.map((student) => ({ ...student }));
    dirtyStudentIdsRef.current = new Set();
    unsavedChangesRef.current = false;
    setUnsavedChanges(false);
    setTodayAttendance((previous) =>
      previous
        ? { ...previous, attendanceRegister: savedRegister }
        : previous
    );
    setSavedRegisters((previous) => ({
      ...previous,
      [attendanceDate]: savedRegister,
    }));
    return savedRegister;
  };

  const saveDraft = async () => {
    if (savingAttendance || submittingAttendance) return;
    if (attendanceDate > TODAY) {
      setError("Attendance cannot be recorded for a future date.");
      return;
    }
    if (!todayIdentity) {
      setError("Saving attendance for historical demo records is not connected.");
      return;
    }
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

  const saveChanges = async () => {
    if (attendanceDate > TODAY) {
      setError("Attendance cannot be recorded for a future date.");
      return;
    }

    if (currentCounts.unconfirmed > 0) {
      await saveDraft();
      return;
    }

    await submitAttendance();
  };

  const submitAttendance = async () => {
    if (savingAttendance || submittingAttendance) return;
    if (attendanceDate > TODAY) {
      setError("Attendance cannot be recorded for a future date.");
      return;
    }
    if (!todayIdentity) {
      setError("Submitting historical demo records is not connected.");
      return;
    }

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
      setMessage(
        response.message || "Attendance submitted successfully."
      );
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

  const handleContinueDraft = (record) => {
    if (
      unsavedChangesRef.current &&
      !window.confirm(
        "You have unsaved attendance changes. Continue to this draft without saving them?"
      )
    ) {
      return;
    }

    const register = {
      ...record,
      students: (record.students || getMockStudents(record)).map((student) => ({
        ...student,
      })),
      status: "DRAFT",
    };

    setSavedRegisters((previous) => ({
      ...previous,
      [record.date]: register,
    }));

    setAttendanceDate(record.date);
    setStudents(register.students);
    setSelectedHistory(null);
    setActiveTab("daily");
    setIsEditingSubmitted(false);
    setSearchTerm("");
    setMessage("Draft opened. Continue from where you previously stopped.");
    setError("");
  };

  const handleEditAttendance = (record) => {
    if (
      unsavedChangesRef.current &&
      !window.confirm(
        "You have unsaved attendance changes. Continue to this register without saving them?"
      )
    ) {
      return;
    }

    const register = {
      ...record,
      students: (record.students || getMockStudents(record)).map((student) => ({
        ...student,
      })),
    };

    setSavedRegisters((previous) => ({
      ...previous,
      [record.date]: register,
    }));

    setAttendanceDate(record.date);
    setStudents(register.students);
    setSelectedHistory(null);
    setActiveTab("daily");
    setIsEditingSubmitted(true);
    setSearchTerm("");
    setMessage(
      "Editing a submitted register. Save your changes or submit the updated attendance."
    );
    setError("");
  };

  const exportHistoryCsv = () => {
    const headers = [
      "Date",
      "Class",
      "Academic Session",
      "Term",
      "Register Status",
      "Total Students",
      "Present",
      "Absent",
      "Unconfirmed",
    ];

    const rows = filteredHistory.map((record) => [
      record.date,
      record.className,
      record.session,
      formatTerm(record.term),
      record.status === "SUBMITTED" ? "Completed" : "Draft",
      record.total,
      record.present,
      record.absent,
      getUnconfirmed(record),
    ]);

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "attendance-history.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const resetDemo = () => {
    if (
      unsavedChangesRef.current &&
      !window.confirm("Discard your unsaved attendance changes and reset this register?")
    ) {
      return;
    }
    try {
      removeAttendanceBackup(todayBackupIdentity);
    } catch (storageError) {
      setError(
        `Could not clear the local attendance backup: ${
          storageError?.message || "unknown storage error"
        }`
      );
      return;
    }
    setActiveTab("daily");
    setAttendanceDate(todayAttendance?.attendanceDate || TODAY);
    setStudents(
      todayAttendance?.students.map((student) => ({ ...student })) || []
    );
    serverStudentsRef.current =
      todayAttendance?.students.map((student) => ({ ...student })) || [];
    dirtyStudentIdsRef.current = new Set();
    unsavedChangesRef.current = false;
    setUnsavedChanges(false);
    setSavedRegisters({});
    setSearchTerm("");
    setMessage("");
    setError("");
    setSelectedHistory(null);
    setSubmissionPromptOpen(false);
    setIsEditingSubmitted(false);
    setSessionFilter(CURRENT_SESSION);
    setTermFilter(CURRENT_TERM);
    setFromDate("2026-09-14");
    setToDate(todayAttendance?.attendanceDate || TODAY);
    setHistorySearch("");
  };

  const changeTab = (nextTab) => {
    if (
      nextTab !== activeTab &&
      unsavedChangesRef.current &&
      !savingAttendance &&
      !submittingAttendance &&
      !window.confirm(
        "You have unsaved attendance changes. Continue without saving them?"
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
          "You have unsaved attendance changes. Continue without saving them?"
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
          "You have unsaved attendance changes. Continue without saving them?"
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

      const message =
        "Your changes will only save on this device. If you use another device, this draft may not appear there.";
      event.preventDefault();
      event.returnValue = message;
      return message;
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

  const handleSessionChange = (value) => {
    setSessionFilter(value);

    if (value === "ALL") {
      setTermFilter("ALL");
      setFromDate("2026-09-14");
      setToDate(todayAttendance?.attendanceDate || TODAY);
      return;
    }

    const session = MOCK_SESSIONS.find((item) => item.id === value);
    const defaultTerm =
      session?.terms.find((term) => term.id === CURRENT_TERM) ||
      session?.terms[0];

    setTermFilter(defaultTerm?.id || "ALL");

    setFromDate(
      defaultTerm?.startDate &&
      defaultTerm.startDate <= (todayAttendance?.attendanceDate || TODAY)
        ? defaultTerm.startDate
        : todayAttendance?.attendanceDate || TODAY
    );

    setToDate(todayAttendance?.attendanceDate || TODAY);
  };

  const handleTermChange = (value) => {
    setTermFilter(value);

    if (value === "ALL") {
      setFromDate(
        sessionFilter === CURRENT_SESSION ? "2026-09-14" : "2025-09-15"
      );
      setToDate(todayAttendance?.attendanceDate || TODAY);
      return;
    }

    const term = termOptions.find((item) => item.id === value);

    if (term) {
      const latestDate = todayAttendance?.attendanceDate || TODAY;
      setFromDate(term.startDate <= latestDate ? term.startDate : latestDate);
      setToDate(latestDate);
    }
  };

  const resetHistoryFilters = () => {
    setSessionFilter(CURRENT_SESSION);
    setTermFilter(CURRENT_TERM);
    setFromDate("2026-09-14");
    setToDate(todayAttendance?.attendanceDate || TODAY);
    setHistorySearch("");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(73,166,255,0.09),_transparent_38%),#f8fafc]">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link
          to="/admin"
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
                        <p className="mt-1 text-xs text-blue-100">
                          Form Master · {getFormMasterName(todayAttendance.formMaster)}
                        </p>
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
                <p className="mt-1.5 text-sm font-bold">{formatDate(todayAttendance?.attendanceDate || attendanceDate)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-200">Register</p>
                <div className="mt-1.5"><RegisterStatusBadge status={todayAttendance?.attendanceRegister?.status || "NEW"} /></div>
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
            onClick={resetDemo}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            title="Reset local attendance changes"
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
                      ? "This register has been submitted. It is read-only until you choose to edit it."
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
                      max={todayAttendance?.attendanceDate || TODAY}
                      disabled
                      title="Only today's register is connected at this stage."
                      className="rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </FilterField>
              </div>

              {isReadOnly && (
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
                        Submitted:{" "}
                        {formatDateTime(currentRegister?.submittedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isEditingSubmitted && (
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                  <p className="font-semibold">Editing a submitted register</p>
                  <p className="mt-1 leading-5">
                    Changes will update this same register. If you save while
                    students remain unconfirmed, it will return to Draft until
                    the register is completed and submitted again.
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
                  {currentRegister?.savedAt
                    ? `Last saved: ${formatDateTime(currentRegister.savedAt)}`
                    : "No local changes have been saved for this date."}
                </p>

                {isReadOnly ? (
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
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={
                        isEditingSubmitted ? saveChanges : saveDraft
                      }
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
                    Review saved drafts and submitted registers for your
                    assigned class. The session and term default to the current
                    ones.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exportHistoryCsv}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FilterField label="Academic session">
                  <select
                    value={sessionFilter}
                    onChange={(event) =>
                      handleSessionChange(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="ALL">All sessions</option>
                    {MOCK_SESSIONS.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.label}
                      </option>
                    ))}
                  </select>
                </FilterField>

                <FilterField label="Term">
                  <select
                    value={termFilter}
                    onChange={(event) => handleTermChange(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="ALL">All terms</option>
                    {termOptions.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.name}
                      </option>
                    ))}
                  </select>
                </FilterField>

                <FilterField label="From date">
                  <input
                    type="date"
                    value={fromDate}
                    max={TODAY}
                    onChange={(event) => {
                      const value = event.target.value;
                      setFromDate(value);

                      if (value && toDate && value > toDate) {
                        setToDate(value);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </FilterField>

                <FilterField label="To date">
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    max={TODAY}
                    onChange={(event) => setToDate(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </FilterField>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(event) => setHistorySearch(event.target.value)}
                    placeholder="Search date, session or term..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={resetHistoryFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  <RotateCcw size={15} />
                  Reset filters
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Registers found"
                value={filteredHistory.length}
                description="Matching your selected filters"
                icon={CalendarDays}
                color="navy"
              />

              <SummaryCard
                title="Students present"
                value={filteredHistory.reduce(
                  (sum, record) => sum + record.present,
                  0
                )}
                description="Across matching registers"
                icon={UserCheck}
                color="green"
              />

              <SummaryCard
                title="Students absent"
                value={filteredHistory.reduce(
                  (sum, record) => sum + record.absent,
                  0
                )}
                description="Across matching registers"
                icon={UserX}
                color="red"
              />

              <SummaryCard
                title="Unconfirmed"
                value={filteredHistory.reduce(
                  (sum, record) => sum + getUnconfirmed(record),
                  0
                )}
                description="Across matching registers"
                icon={Info}
                color="amber"
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Previous registers
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Continue drafts or open submitted registers to view their
                    details.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#123A8F]">
                  {filteredHistory.length} record
                  {filteredHistory.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Session / Term</th>
                      <th className="px-5 py-3">Present</th>
                      <th className="px-5 py-3">Absent</th>
                      <th className="px-5 py-3">Unconfirmed</th>
                      <th className="px-5 py-3">Register status</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredHistory.map((record) => (
                      <tr
                        key={record.id || record.date}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {formatDate(record.date)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {record.className}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700">
                            {record.session}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatTerm(record.term)}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-semibold text-emerald-700">
                          {record.present}
                        </td>

                        <td className="px-5 py-4 font-semibold text-rose-700">
                          {record.absent}
                        </td>

                        <td className="px-5 py-4 font-semibold text-amber-700">
                          {getUnconfirmed(record)}
                        </td>

                        <td className="px-5 py-4">
                          <RegisterStatusBadge status={record.status} />
                        </td>

                        <td className="px-5 py-4">
                          {record.status === "DRAFT" ? (
                            <button
                              type="button"
                              onClick={() => handleContinueDraft(record)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                            >
                              <Pencil size={14} />
                              Continue Draft
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedHistory(record)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#123A8F] hover:bg-blue-50"
                            >
                              <History size={14} />
                              View Summary
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {filteredHistory.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-14 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <Filter size={22} />
                          </div>
                          <p className="mt-3 font-semibold text-slate-800">
                            No attendance records found
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Try changing the session, term, or date range.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm">
          <div className="rounded-xl bg-blue-50 p-2 text-[#123A8F]">
            <Info size={18} />
          </div>
          <div className="text-sm leading-5 text-slate-600">
            <p className="font-bold text-[#071A52]">Attendance integration status</p>
            <p className="mt-1">
              Today’s assigned class, attendance register, and roster load from
              the attendance API. You can create, save, and submit today’s
              register here. The history tab still uses sample records until
              its API is available.
            </p>
          </div>
        </div>
      </div>

      <HistoryModal
        record={selectedHistory}
        onClose={() => setSelectedHistory(null)}
        onContinueDraft={handleContinueDraft}
        onEditAttendance={handleEditAttendance}
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