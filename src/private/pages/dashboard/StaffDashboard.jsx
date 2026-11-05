import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  Briefcase,
  CalendarDays,
  ClipboardCheck,
  History,
  Megaphone,
  MessageSquareText,
  RefreshCw,
  ScanLine,
  Users,
} from "lucide-react";

import { useUserContext } from "../../../context/UserContext";
import { formatNotificationTime } from "../../../utils/notifications";
import { getRoleLabel } from "../../../utils/roles";
import { isProfilePending } from "../../../utils/staffDisplay";
import { getGreeting } from "./dashboardGreeting";
import SchoolComplaintCard from "./SchoolComplaintCard";
import { getStaffDashboard } from "./staffDashboardApi";

const todayLabel = new Date().toLocaleDateString([], {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const REGISTER_STATES = {
  NOT_STARTED: {
    headline: "Not taken yet",
    hint: "Your register is still open for today.",
    cta: "Take attendance",
  },
  DRAFT: {
    headline: "Saved as a draft",
    hint: "Finish marking the rest and submit before the day ends.",
    cta: "Continue register",
  },
  SUBMITTED: {
    headline: "Submitted",
    hint: "Locked for today. Open it only if something needs correcting.",
    cta: "Review register",
  },
};

const COMPLAINT_TONES = {
  SUBMITTED: "bg-amber-50 text-amber-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  RESOLVED: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

const VIEW_ALL_CLASS =
  "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#071A52] transition hover:border-blue-300 hover:bg-blue-50";

function complaintLabel(status) {
  return String(status || "")
    .toLowerCase()
    .replace(/_/g, " ");
}

function SectionCard({ icon: Icon, eyebrow, title, hint, action, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Icon size={14} />
            {eyebrow}
          </div>
          <h2 className="mt-1.5 text-lg font-extrabold text-[#071A52]">{title}</h2>
          {hint && <p className="mt-0.5 text-sm leading-5 text-slate-500">{hint}</p>}
        </div>

        {action}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

function SectionNotice({ text }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5">
      <p className="text-sm leading-5 text-slate-600">{text}</p>
    </div>
  );
}

function SectionError({ text, onRetry }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3.5">
      <div className="flex items-start gap-2.5">
        <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
        <p className="text-sm leading-5 text-rose-700">{text}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 cursor-pointer rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50"
        >
          Try again
        </button>
      )}
    </div>
  );
}

function SkeletonRows({ rows = 2 }) {
  return (
    <div aria-hidden="true" className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-11 animate-pulse rounded-lg bg-slate-100" />
      ))}
    </div>
  );
}

function QuickAction({ icon: Icon, title, hint, to }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
        <Icon size={19} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-[#071A52]">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-slate-500">{hint}</span>
      </span>
      <ArrowUpRight
        size={15}
        className="ml-auto shrink-0 text-blue-700 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user, school } = useUserContext();

  const fullName = useMemo(
    () =>
      isProfilePending(user)
        ? ""
        : [user?.firstName, user?.surName].filter(Boolean).join(" ").trim(),
    [user]
  );

  const schoolName = school?.schoolName || school?.name || "your school";
  const roleLabel = getRoleLabel(user?.role) || "Staff";
  const className = [user?.formClass?.classLevel, user?.formClass?.arm].filter(Boolean).join(" ");
  const isFormMaster = Boolean(user?.isFormMaster);
  const canScanStudents = Boolean(user?.canScanStudents);

  const [sections, setSections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const payload = await getStaffDashboard({ isFormMaster, canScanStudents });
        if (cancelled) return;

        setSections(payload);
      } catch (requestError) {
        if (cancelled) return;

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
  }, [canScanStudents, isFormMaster, refreshToken]);

  const today = sections?.today?.ok && sections.today.available !== false ? sections.today : null;
  const history =
    sections?.history?.ok && sections.history.available !== false ? sections.history : null;
  const gate = sections?.gate?.ok ? sections.gate : null;
  const unread = sections?.unread?.ok ? sections.unread.count : null;
  const complaints = sections?.complaints?.ok ? sections.complaints : null;

  const registerState = today ? REGISTER_STATES[today.status] ?? REGISTER_STATES.NOT_STARTED : null;
  const attendanceRate = history?.summary?.attendanceRate;
  const totalRegisters = history?.summary?.totalRegisters ?? 0;

  // Announcements, complaints, profile and settings already have a section
  // below or a permanent sidebar entry, so only the day-to-day jobs are
  // offered as tiles here.
  const quickActions = [
    isFormMaster && {
      to: "/attendance",
      icon: ClipboardCheck,
      title: "Take attendance",
      hint: "Mark today's register for your class.",
    },
    isFormMaster && {
      to: "/my-class",
      icon: Users,
      title: "My class",
      hint: "The pupils your school has placed with you.",
    },
    canScanStudents && {
      to: "/verify-student",
      icon: ScanLine,
      title: "Verify student",
      hint: "Scan a badge or search an admission number.",
    },
    canScanStudents && {
      to: "/scan-history",
      icon: History,
      title: "Gate scan history",
      hint: "Students recorded at the gate.",
    },
  ].filter(Boolean);

  return (
    <div className="min-h-full bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              <Briefcase size={14} />
              Staff workspace
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#071A52] sm:text-3xl">
              {getGreeting()}
              {fullName ? `, ${fullName}` : ""}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
              <span>{schoolName}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{roleLabel}</span>
              {className && (
                <>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">
                    {className}
                  </span>
                </>
              )}
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} />
                {todayLabel}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRefreshToken((value) => value + 1)}
            disabled={loading}
            aria-label="Refresh your dashboard"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {error && (
          <SectionError text={error} onRetry={() => setRefreshToken((value) => value + 1)} />
        )}

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard
            icon={ClipboardCheck}
            eyebrow="Today"
            title={isFormMaster ? "Class attendance" : "Attendance and class tools"}
            hint={
              isFormMaster
                ? className
                  ? `Register for ${className}.`
                  : "Register for your class."
                : undefined
            }
            action={
              isFormMaster && today ? (
                <button
                  type="button"
                  onClick={() => navigate("/attendance")}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#071A52] to-[#123A8F] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
                >
                  {registerState?.cta}
                  <ArrowUpRight size={14} />
                </button>
              ) : null
            }
          >
            {loading && !sections ? (
              <SkeletonRows rows={3} />
            ) : !isFormMaster ? (
              <SectionNotice text="Your school has not assigned you a class to register yet. Attendance, your class list and the related quick actions appear here the moment your school makes you a class teacher." />
            ) : sections?.today && !sections.today.ok ? (
              <SectionError
                text={sections.today.message}
                onRetry={() => setRefreshToken((value) => value + 1)}
              />
            ) : !registerState ? (
              <SectionNotice text="Attendance for your class could not be reached right now. Use Refresh to try again." />
            ) : (
              <>
                <p className="text-3xl font-black tracking-tight text-[#071A52] sm:text-4xl">
                  {registerState.headline}
                </p>
                <p className="mt-1 text-sm text-slate-500">{registerState.hint}</p>

                {today?.registerId && today.totalStudents > 0 && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {today.markedStudents} of {today.totalStudents} pupils marked
                  </p>
                )}

                {today?.registerId && today.totalStudents === 0 && (
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Your class roster is empty. Ask your school office to place pupils in{" "}
                    {className || "your class"} before taking attendance.
                  </p>
                )}

                {!today?.registerId && (
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Your full class list opens as soon as you start today's register.
                  </p>
                )}

                {(attendanceRate !== null && attendanceRate !== undefined) ||
                totalRegisters > 0 ? (
                  <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
                    <span className="font-bold text-[#071A52]">
                      {attendanceRate === null || attendanceRate === undefined
                        ? "No rate yet"
                        : `${attendanceRate}%`}
                    </span>{" "}
                    attendance across {totalRegisters}{" "}
                    {totalRegisters === 1 ? "register" : "registers"} this term.
                  </p>
                ) : null}
              </>
            )}
          </SectionCard>

          {canScanStudents ? (
            <Link
              to="/verify-student"
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-5 text-left text-white shadow-sm transition hover:brightness-110"
            >
              <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full border-[28px] border-white/[0.06]" />

              <div className="relative">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                  <ScanLine size={21} />
                </span>
                <h2 className="mt-4 text-lg font-extrabold">Gate duties</h2>
                <p className="mt-1 max-w-xs text-xs leading-5 text-blue-100">
                  {gate?.ok
                    ? `${gate.todayArrivalCount} ${
                        gate.todayArrivalCount === 1 ? "student has" : "students have"
                      } arrived at the gate today.`
                    : "Record arrivals and review who has already come through."}
                </p>
              </div>

              <span className="relative mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-200">
                Verify a student
                <ArrowUpRight
                  size={14}
                  className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => navigate(isFormMaster ? "/my-class" : "/announcements")}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-5 text-left text-white shadow-sm transition hover:brightness-110"
            >
              <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full border-[28px] border-white/[0.06]" />

              <div className="relative">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                  {isFormMaster ? <Users size={21} /> : <Megaphone size={21} />}
                </span>
                <h2 className="mt-4 text-lg font-extrabold">
                  {isFormMaster ? className || "My class" : "School announcements"}
                </h2>
                <p className="mt-1 max-w-xs text-xs leading-5 text-blue-100">
                  {isFormMaster
                    ? "See the pupils placed with you, their details and their attendance record."
                    : "Keep up with what your school sends to staff."}
                </p>
              </div>

              <span className="relative mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-200">
                {isFormMaster ? "Open my class" : "Read announcements"}
                <ArrowUpRight
                  size={14}
                  className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </button>
          )}
        </div>

        {quickActions.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <QuickAction key={action.to} {...action} />
            ))}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            icon={Megaphone}
            eyebrow="From your school"
            title="Latest announcements"
            action={
              <Link to="/announcements" className={VIEW_ALL_CLASS}>
                View all
                <ArrowUpRight size={13} />
              </Link>
            }
          >
            {loading && !sections ? (
              <SkeletonRows />
            ) : !sections?.announcements?.ok ? (
              <SectionError
                text={sections?.announcements?.message}
                onRetry={() => setRefreshToken((value) => value + 1)}
              />
            ) : sections.announcements.items.length === 0 ? (
              <SectionNotice text="No announcements have been sent to you yet." />
            ) : (
              <>
                <ul className="divide-y divide-slate-100">
                  {sections.announcements.items.map((announcement) => (
                    <li key={announcement.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-bold text-[#071A52]">{announcement.title}</p>
                        <span className="shrink-0 text-xs text-slate-400">
                          {formatNotificationTime(announcement.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                        {announcement.message}
                      </p>
                    </li>
                  ))}
                </ul>
                {sections.announcements.total > sections.announcements.items.length && (
                  <p className="mt-3 text-xs text-slate-400">
                    Showing {sections.announcements.items.length} of {sections.announcements.total}
                  </p>
                )}
              </>
            )}
          </SectionCard>

          <SectionCard
            icon={Bell}
            eyebrow="Account activity"
            title="Recent notifications"
            action={
              <Link to="/notifications" className={VIEW_ALL_CLASS}>
                {unread > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                    {unread} new
                  </span>
                )}
                View all
                <ArrowUpRight size={13} />
              </Link>
            }
          >
            {loading && !sections ? (
              <SkeletonRows />
            ) : !sections?.notifications?.ok ? (
              <SectionError
                text={sections?.notifications?.message}
                onRetry={() => setRefreshToken((value) => value + 1)}
              />
            ) : sections.notifications.items.length === 0 ? (
              <SectionNotice text="Nothing new on your account yet." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {sections.notifications.items.map((notification) => (
                  <li key={notification.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-[#071A52]">{notification.title}</p>
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        {/* Most staff never file a complaint, so an empty list is noise rather than information. */}
        {complaints && complaints.total > 0 && (
          <SectionCard
            icon={MessageSquareText}
            eyebrow="Your requests"
            title="Complaints you have sent"
            hint={`${complaints.openCount} of ${complaints.total} still waiting on your school.`}
            action={
              <Link to="/complaints" className={VIEW_ALL_CLASS}>
                Open complaints
                <ArrowUpRight size={13} />
              </Link>
            }
          >
            <ul className="divide-y divide-slate-100">
              {complaints.items.map((complaint) => (
                <li
                  key={complaint.id}
                  className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-bold text-[#071A52]">{complaint.subject}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatNotificationTime(complaint.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                      COMPLAINT_TONES[complaint.status] ?? "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {complaintLabel(complaint.status)}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        <SchoolComplaintCard schoolName={schoolName} />
      </div>
    </div>
  );
}
