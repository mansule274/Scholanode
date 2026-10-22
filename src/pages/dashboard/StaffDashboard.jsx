
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  MapPin,
  Clock3,
  ScanLine,
  UserRoundPlus,
  AlertTriangle,
  Bell,
  ArrowUpRight,
  Users,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  ChevronRight,
  Activity,
  CalendarDays,
  DoorOpen,
  ShieldAlert,
  X,
} from "lucide-react";

const mockActivity = [
  {
    id: 1,
    type: "student",
    title: "Student arrival verified",
    description: "Amina Yusuf · Primary 5A",
    time: "04:52 PM",
    status: "Verified",
  },
  {
    id: 2,
    type: "visitor",
    title: "Visitor registered",
    description: "Parent meeting · Host notification sent",
    time: "04:48 PM",
    status: "Awaiting host",
  },
  {
    id: 3,
    type: "student",
    title: "Student arrival verified",
    description: "Ibrahim Musa · Primary 5A",
    time: "04:46 PM",
    status: "Verified",
  },
  {
    id: 4,
    type: "incident",
    title: "Safety concern reported",
    description: "Main entrance · Awaiting review",
    time: "04:40 PM",
    status: "Needs review",
  },
];

const mockVisitors = [
  {
    id: 1,
    name: "Mr. Abdullahi",
    purpose: "Parent meeting",
    host: "School Administrator",
    time: "04:48 PM",
  },
];

const activityStyles = {
  student: {
    icon: ScanLine,
    color: "text-blue-700 bg-blue-50",
  },
  visitor: {
    icon: UserRoundPlus,
    color: "text-cyan-700 bg-cyan-50",
  },
  incident: {
    icon: ShieldAlert,
    color: "text-amber-700 bg-amber-50",
  },
};

function SectionHeading({ title, subtitle, action, onAction }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>

      {action && (
        <button
          onClick={onAction}
          className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          {action}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, description, iconStyle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${iconStyle}`}>
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

export default function SecurityDashboard() {
  const navigate = useNavigate();

  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorPurpose, setVisitorPurpose] = useState("Parent meeting");
  const [visitorHost, setVisitorHost] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [notice, setNotice] = useState("");

  // Demo values. Replace these with authenticated user and school data later.
  const [activity, setActivity] = useState(mockActivity);
  const [visitors, setVisitors] = useState(mockVisitors);
  const [incidents, setIncidents] = useState([
    {
      id: 1,
      title: "Safety concern reported",
      location: "Main entrance",
      status: "Awaiting review",
    },
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Visitor awaiting host",
      description: "Mr. Abdullahi is waiting for the School Administrator.",
    },
  ]);

  const [visitorCount, setVisitorCount] = useState(3);
  const [verifiedToday, setVerifiedToday] = useState(24);

  // Optional integration with the existing login storage.
  let storedUser = {};
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    storedUser = {};
  }

  const officerName =
    storedUser.firstName || storedUser.name || "Security Officer";

  const schoolName =
    storedUser.school?.name ||
    storedUser.schoolName ||
    "ScholaNode School";

  function addVisitor(event) {
    event.preventDefault();

    if (!visitorName.trim() || !visitorHost.trim()) return;

    const visitor = {
      id: Date.now(),
      name: visitorName.trim(),
      purpose: visitorPurpose,
      host: visitorHost.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setVisitors((current) => [visitor, ...current]);
    setVisitorCount((current) => current + 1);
    setNotifications((current) => [
      {
        id: Date.now(),
        title: "Visitor awaiting host",
        description: `${visitor.name} is waiting for ${visitor.host}.`,
      },
      ...current,
    ]);
    setActivity((current) => [
      {
        id: Date.now(),
        type: "visitor",
        title: "Visitor registered",
        description: `${visitor.name} · ${visitor.purpose}`,
        time: visitor.time,
        status: "Awaiting host",
      },
      ...current,
    ]);

    setNotice(
      `Demo visitor registered. ${visitor.host} has been added to the mock notification queue. No real notification was sent.`
    );
    setVisitorName("");
    setVisitorHost("");
    setShowVisitorModal(false);
  }

  function addIncident(event) {
    event.preventDefault();

    if (!incidentDescription.trim()) return;

    const incident = {
      id: Date.now(),
      title: incidentDescription.trim(),
      location: "Main entrance",
      status: "Awaiting review",
    };

    setIncidents((current) => [incident, ...current]);
    setActivity((current) => [
      {
        id: Date.now(),
        type: "incident",
        title: "Security incident reported",
        description: incident.title,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "Needs review",
      },
      ...current,
    ]);

    setNotice(
      "Demo incident recorded locally. Connect the backend and notification service to notify school leadership."
    );
    setIncidentDescription("");
    setShowIncidentModal(false);
  }

  function markVisitorReceived(visitorId) {
    const visitor = visitors.find((item) => item.id === visitorId);
    if (!visitor) return;

    setVisitors((current) =>
      current.filter((item) => item.id !== visitorId)
    );
    setNotifications((current) =>
      current.filter(
        (item) => !item.description.includes(visitor.name)
      )
    );
    setNotice(
      `Demo: ${visitor.name} was marked as received by the host.`
    );
  }

  function openVisitors() {
    setShowVisitorModal(true);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Welcome and assigned gate */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] text-white shadow-sm">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                <ShieldCheck size={15} />
                Security operations
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome, {officerName}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Your security overview for today. Monitor gate activity,
                manage visitors, and keep school leadership informed.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/verify-student")}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#071A52] transition hover:bg-blue-50"
                >
                  <ScanLine size={18} />
                  Verify student
                </button>

                <button
                  onClick={openVisitors}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  <UserRoundPlus size={18} />
                  Register visitor
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 lg:min-w-64">
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <MapPin size={17} />
                Assigned gate point
              </div>
              <p className="mt-3 text-xl font-bold">Main Entrance</p>
              <p className="mt-1 text-sm text-blue-100">{schoolName}</p>
              <div className="mt-4 flex items-center gap-2 border-t border-white/15 pt-4 text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Assigned duty point
              </div>
            </div>
          </div>
        </section>

        {/* Demo notice */}
        {notice && (
          <div
            role="status"
            className="flex items-start justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"
          >
            <p>{notice}</p>
            <button
              onClick={() => setNotice("")}
              aria-label="Dismiss notice"
              className="shrink-0 rounded-md p-1 hover:bg-blue-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* General overview */}
        <section>
          <SectionHeading
            title="Today's overview"
            subtitle="A quick summary of security activity."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={CheckCircle2}
              label="Students verified"
              value={verifiedToday}
              description="Gate verification records today"
              iconStyle="bg-blue-50 text-blue-700"
            />
            <StatCard
              icon={Users}
              label="Visitors registered"
              value={visitorCount}
              description="Visitors recorded today"
              iconStyle="bg-cyan-50 text-cyan-700"
            />
            <StatCard
              icon={Clock3}
              label="Awaiting attention"
              value={notifications.length}
              description="Items needing follow-up"
              iconStyle="bg-amber-50 text-amber-700"
            />
            <StatCard
              icon={ShieldAlert}
              label="Open incidents"
              value={incidents.length}
              description="Reports awaiting review"
              iconStyle="bg-rose-50 text-rose-700"
            />
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <SectionHeading
            title="Security tasks"
            subtitle="Start the task you need without searching through the dashboard."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <button
              onClick={() => navigate("/verify-student")}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:shadow-sm"
            >
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <ScanLine size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">Verify student</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Scan a badge or search an admission number.
                </p>
                <span className="mt-3 inline-flex items-center text-sm font-semibold text-blue-700">
                  Open verifier <ArrowUpRight size={15} className="ml-1" />
                </span>
              </div>
            </button>

            <button
              onClick={openVisitors}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-cyan-300 hover:shadow-sm"
            >
              <div className="rounded-xl bg-cyan-50 p-3 text-cyan-700">
                <UserRoundPlus size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">Register visitor</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Record the visitor, purpose, and intended host.
                </p>
                <span className="mt-3 inline-flex items-center text-sm font-semibold text-cyan-700">
                  Start registration <ArrowUpRight size={15} className="ml-1" />
                </span>
              </div>
            </button>

            <button
              onClick={() => setShowIncidentModal(true)}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-amber-300 hover:shadow-sm"
            >
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                <AlertTriangle size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">Report incident</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Record a safety concern for follow-up.
                </p>
                <span className="mt-3 inline-flex items-center text-sm font-semibold text-amber-700">
                  Report concern <ArrowUpRight size={15} className="ml-1" />
                </span>
              </div>
            </button>

            <button
              onClick={() => navigate("/scan-history")}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-400 hover:shadow-sm"
            >
              <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                <ClipboardList size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">Scan history</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Review and search previous student scans.
                </p>
                <span className="mt-3 inline-flex items-center text-sm font-semibold text-slate-700">
                  View records <ArrowUpRight size={15} className="ml-1" />
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* Attention and responsibilities */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-3">
            <SectionHeading
              title="Needs attention"
              subtitle="Follow up on these items during your duty."
              action="View visitors"
              onAction={openVisitors}
            />

            {notifications.length === 0 && incidents.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center">
                <CheckCircle2 className="mx-auto text-emerald-600" size={30} />
                <p className="mt-3 font-semibold text-slate-800">
                  Nothing needs attention
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  New security tasks will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-4"
                  >
                    <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                      <Bell size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                      Pending
                    </span>
                  </div>
                ))}

                {incidents.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-4"
                  >
                    <div className="rounded-lg bg-rose-100 p-2 text-rose-700">
                      <CircleAlert size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.location} · {item.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-2">
            <SectionHeading
              title="Your responsibilities"
              subtitle="Core duties at your assigned gate."
            />

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-700">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Verify school entry
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Check student identities and follow school gate procedures.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5 rounded-lg bg-cyan-50 p-2 text-cyan-700">
                  <DoorOpen size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Manage visitors
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Record visitor details and contact the intended host.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5 rounded-lg bg-amber-50 p-2 text-amber-700">
                  <Bell size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Inform school leadership
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Escalate incidents, unusual activity, and matters requiring
                    administrative attention.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5 rounded-lg bg-rose-50 p-2 text-rose-700">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Maintain gate safety
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Keep entrances orderly and report safety concerns promptly.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Short mixed activity preview */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <SectionHeading
            title="Recent security activity"
            subtitle="A short preview across security tasks."
            action="Full scan history"
            onAction={() => navigate("/scan-history")}
          />

          <div className="divide-y divide-slate-100">
            {activity.slice(0, 4).map((item) => {
              const style = activityStyles[item.type] || activityStyles.student;
              const Icon = style.icon;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-4 first:pt-1 last:pb-1 sm:gap-4"
                >
                  <div className={`shrink-0 rounded-xl p-3 ${style.color}`}>
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs text-slate-500">{item.time}</p>
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        item.status === "Verified"
                          ? "text-emerald-700"
                          : item.status === "Needs review"
                            ? "text-rose-700"
                            : "text-amber-700"
                      }`}
                    >
                      {item.status}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-slate-500 sm:hidden">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck size={15} />
            ScholaNode Security
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={14} />
            Demo overview · Connect live school data before production
          </span>
        </footer>
      </div>

      {/* Visitor registration demo modal */}
      {showVisitorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowVisitorModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="visitor-modal-title"
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="visitor-modal-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Register visitor
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Record who is visiting and who they need to see.
                </p>
              </div>
              <button
                onClick={() => setShowVisitorModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={addVisitor} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Visitor's name
                </label>
                <input
                  required
                  value={visitorName}
                  onChange={(event) => setVisitorName(event.target.value)}
                  placeholder="Enter visitor's full name"
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Purpose of visit
                </label>
                <select
                  value={visitorPurpose}
                  onChange={(event) => setVisitorPurpose(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>Parent meeting</option>
                  <option>Official school business</option>
                  <option>Meeting with staff</option>
                  <option>Delivery</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Intended host
                </label>
                <input
                  required
                  value={visitorHost}
                  onChange={(event) => setVisitorHost(event.target.value)}
                  placeholder="e.g. School Administrator"
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  Demo only: this adds a local pending notification. It does
                  not send a real message or authorize entry.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowVisitorModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0A2463] px-4 py-3 text-sm font-semibold text-white hover:bg-[#123A8F]"
                >
                  Record visitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident reporting demo modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="incident-modal-title"
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="incident-modal-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Report security incident
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Describe the issue for school leadership to review.
                </p>
              </div>
              <button
                onClick={() => setShowIncidentModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={addIncident} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Incident details
                </label>
                <textarea
                  required
                  rows={4}
                  value={incidentDescription}
                  onChange={(event) =>
                    setIncidentDescription(event.target.value)
                  }
                  placeholder="Describe what happened, where, and any immediate safety concerns..."
                  className="w-full resize-y rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <p className="text-xs leading-5 text-slate-500">
                Demo only: the report is saved in this page's local state.
                No real alert is sent to school leadership.
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0A2463] px-4 py-3 text-sm font-semibold text-white hover:bg-[#123A8F]"
                >
                  Record incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
