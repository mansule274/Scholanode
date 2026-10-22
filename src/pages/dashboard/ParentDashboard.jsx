
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Users,
  Bell,
  MessageSquareText,
  BookOpen,
  ClipboardCheck,
  QrCode,
  Download,
  UserRound,
  CalendarDays,
  GraduationCap,
  ShieldCheck,
  Search,
  Sparkles,
  School,
  X,
} from "lucide-react";

const STORAGE_KEY = "scholanode:parent-dashboard:v1";

const MOCK_CHILDREN = [
  {
    id: "student-001",
    firstName: "Amina",
    surName: "Hassan",
    admissionNumber: "SCH/STU/2026/0041",
    className: "Primary 5A",
    attendanceRate: 96,
    qrToken: "mock-student-token-001",
    initials: "AH",
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    id: "student-002",
    firstName: "Yusuf",
    surName: "Hassan",
    admissionNumber: "SCH/STU/2024/0118",
    className: "Primary 2B",
    attendanceRate: 92,
    qrToken: "mock-student-token-002",
    initials: "YH",
    gradient: "from-violet-600 to-indigo-500",
  },
  {
    id: "student-003",
    firstName: "Maryam",
    surName: "Hassan",
    admissionNumber: "SCH/STU/2022/0204",
    className: "Nursery 2",
    attendanceRate: 98,
    qrToken: "mock-student-token-003",
    initials: "MH",
    gradient: "from-emerald-600 to-teal-500",
  },
];

const MOCK_NOTIFICATIONS = [
  {
    id: "notification-001",
    title: "Result published",
    message: "A new result is available for Amina Hassan.",
    read: false,
  },
  {
    id: "notification-002",
    title: "Attendance update",
    message: "There is a new attendance update for Yusuf Hassan.",
    read: false,
  },
  {
    id: "notification-003",
    title: "School reminder",
    message: "A parent-teacher meeting is scheduled for this week.",
    read: true,
  },
];

const MOCK_REQUESTS = [
  { id: "request-001", status: "IN_PROGRESS" },
  { id: "request-002", status: "RESOLVED" },
];

function readStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconStyle,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-[#071A52]">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconStyle}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function ChildAction({
  icon: Icon,
  label,
  onClick,
  primary = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0A2463] px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-900"
          : "flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
      }
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

export default function ParentDashboard({ user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChild, setSelectedChild] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const [notifications] = useState(() => {
    const saved = readStorage();
    return saved.notifications || MOCK_NOTIFICATIONS;
  });

  const [requests] = useState(() => {
    const saved = readStorage();
    return saved.requests || MOCK_REQUESTS;
  });

  const schoolName = user?.schoolName || "Al-Hikmah Model School";

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          notifications,
          requests,
        })
      );
    } catch (error) {
      console.warn("Unable to save dashboard state.", error);
    }
  }, [notifications, requests]);

  // Allow the parent to close the QR view with the Escape key.
  useEffect(() => {
    if (!showQrModal) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowQrModal(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showQrModal]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const openRequests = requests.filter(
    (request) => request.status !== "RESOLVED"
  ).length;

  const visibleChildren = MOCK_CHILDREN.filter((child) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return true;

    return (
      `${child.firstName} ${child.surName}`
        .toLowerCase()
        .includes(query) ||
      child.className.toLowerCase().includes(query) ||
      child.admissionNumber.toLowerCase().includes(query)
    );
  });

  function openChildQr(child) {
    setSelectedChild(child);
    setShowQrModal(true);
  }

  function closeQrModal() {
    setShowQrModal(false);
  }

  function downloadQrCode() {
    const canvas = document.getElementById(
      "parent-student-qr-canvas"
    );

    if (!canvas || !selectedChild) return;

    const link = document.createElement("a");

    link.download = `${selectedChild.firstName}-${selectedChild.surName}-QR.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-8">
        {/* Welcome section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071A52] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-20 h-60 w-60 rounded-full border-[32px] border-white/5" />

          <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-cyan-400/10 blur-2xl" />

          <div className="relative z-10 flex items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                <Sparkles size={14} />
                Parent portal
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {getGreeting()}!
              </h1>

              <p className="mt-2 text-sm leading-6 text-blue-100 sm:text-base">
                Welcome to your parent dashboard. Keep track of your
                children's academic progress, attendance, and school
                information in one place.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-blue-100">
                <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <School size={15} />
                  {schoolName}
                </span>

                <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <CalendarDays size={15} />
                  {new Intl.DateTimeFormat("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date())}
                </span>
              </div>
            </div>

            <div className="hidden shrink-0 items-center justify-center md:flex">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-white/15 bg-white/10">
                <GraduationCap size={58} strokeWidth={1.4} />
              </div>
            </div>
          </div>
        </section>

        {/* Overview cards */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#071A52]">
              Dashboard overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A quick summary of your parent account.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              title="Linked children"
              value={MOCK_CHILDREN.length}
              description="Students connected to your account"
              icon={Users}
              iconStyle="bg-blue-50 text-blue-700"
            />

            <SummaryCard
              title="Unread notifications"
              value={unreadCount}
              description="Updates waiting for your attention"
              icon={Bell}
              iconStyle="bg-violet-50 text-violet-700"
            />

            <SummaryCard
              title="Open requests"
              value={openRequests}
              description="Requests not yet resolved"
              icon={MessageSquareText}
              iconStyle="bg-amber-50 text-amber-700"
            />
          </div>
        </section>

        {/* Children section */}
        <section>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-bold text-[#071A52]">
                My Children
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select an action to access a child's school information.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search children..."
                aria-label="Search children"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {visibleChildren.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
              <Users className="mx-auto text-slate-400" size={30} />

              <h3 className="mt-3 font-semibold text-slate-800">
                No matching children
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try searching with another name, class, or admission number.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
              {visibleChildren.map((child) => (
                <article
                  key={child.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400" />

                  <div className="p-5">
                    {/* Student identity */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${child.gradient} text-lg font-bold text-white shadow-sm`}
                      >
                        {child.initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-[#071A52]">
                          {child.firstName} {child.surName}
                        </h3>

                        <p className="mt-1 break-all text-xs text-slate-500">
                          {child.admissionNumber}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">
                            {child.className}
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance summary */}
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <ClipboardCheck size={17} />
                          Attendance
                        </div>

                        <span className="text-xl font-bold text-[#071A52]">
                          {child.attendanceRate}%
                        </span>
                      </div>

                      <div
                        className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
                        role="progressbar"
                        aria-label={`${child.firstName}'s demo attendance rate`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={child.attendanceRate}
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all"
                          style={{
                            width: `${child.attendanceRate}%`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-[11px] text-slate-500">
                        Demonstration data — actual attendance will come
                        from school records.
                      </p>
                    </div>

                    {/* Results, Attendance, QR Code and Profile */}
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <ChildAction
                        icon={BookOpen}
                        label="Results"
                        primary
                      />

                      <ChildAction
                        icon={ClipboardCheck}
                        label="Attendance"
                      />

                      <ChildAction
                        icon={QrCode}
                        label="QR Code"
                        onClick={() => openChildQr(child)}
                      />

                      <ChildAction
                        icon={UserRound}
                        label="Profile"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} ScholaNode. All rights reserved.
          </p>

          <p className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} />
            Parent portal
          </p>
        </footer>
      </div>

      {/* Responsive student QR modal */}
      {showQrModal && selectedChild && (
        <div
          className="fixed inset-0 z-[100] flex items-stretch justify-center bg-slate-950/80 backdrop-blur-sm sm:items-center sm:overflow-y-auto sm:bg-slate-950/60 sm:p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeQrModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="parent-qr-title"
            className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl sm:my-auto sm:h-auto sm:max-h-[92dvh] sm:max-w-md sm:rounded-3xl"
          >
            {/* Modal header */}
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#071A52] to-[#123A8F] px-5 py-4 text-white sm:px-6 sm:py-6">
              <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full border-[24px] border-white/5" />

              <div className="relative flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                    <QrCode size={14} />
                    Student identification
                  </div>

                  <h2
                    id="parent-qr-title"
                    className="mt-2 text-lg font-bold sm:mt-3 sm:text-xl"
                  >
                    Student QR Code
                  </h2>

                  <p className="mt-1 truncate text-sm text-blue-100">
                    {selectedChild.firstName} {selectedChild.surName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeQrModal}
                  className="shrink-0 rounded-xl bg-white/10 p-2.5 text-white transition hover:bg-white/20"
                  aria-label="Close QR code"
                >
                  <X size={21} />
                </button>
              </div>
            </div>

            {/* Scrollable student pass */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <div className="flex flex-1 flex-col items-center justify-center px-4 py-4 sm:px-6 sm:py-6">
                {/* Student identity */}
                <div className="mb-4 flex w-full items-center justify-center gap-3 sm:mb-5">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${selectedChild.gradient} font-bold text-white`}
                  >
                    {selectedChild.initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-bold text-[#071A52]">
                      {selectedChild.firstName} {selectedChild.surName}
                    </p>

                    <p className="mt-0.5 text-sm text-slate-500">
                      {selectedChild.className}
                    </p>

                    <p className="mt-0.5 break-all text-xs text-slate-500">
                      {selectedChild.admissionNumber}
                    </p>
                  </div>
                </div>

                {/* Large QR code */}
                <div className="flex w-full flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 px-2 py-4 sm:px-4 sm:py-5">
                  <div className="flex max-w-full items-center justify-center rounded-xl bg-white p-2 shadow-sm sm:p-3">
                    <QRCodeCanvas
                      id="parent-student-qr-canvas"
                      value={selectedChild.qrToken}
                      size={320}
                      level="H"
                      includeMargin
                      className="block h-auto max-w-full"
                      style={{
                        width: "min(78vw, 320px)",
                        height: "auto",
                      }}
                    />
                  </div>

                  <p className="mt-3 text-center text-xs font-medium text-slate-500">
                    Present this code to the school gate scanner
                  </p>
                </div>

                <p className="mt-3 max-w-sm text-center text-xs leading-5 text-slate-500">
                  Increase your phone brightness if the scanner has
                  difficulty reading the code.
                </p>
              </div>

              {/* Actions remain easy to reach */}
              <div className="shrink-0 border-t border-slate-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-5 sm:pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={downloadQrCode}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0A2463] px-3 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
                  >
                    <Download size={17} />
                    Download QR
                  </button>

                  <button
                    type="button"
                    onClick={closeQrModal}
                    className="min-h-12 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>

                <p className="mt-2 text-center text-[10px] leading-4 text-amber-700">
                  Demo QR code only. Real student verification requires a
                  secure backend-generated token.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
