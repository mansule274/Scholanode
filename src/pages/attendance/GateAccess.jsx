
import React, { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Users,
  ScanLine,
  History,
  Plus,
  Search,
  UserPlus,
  UserRoundCheck,
  UserRoundX,
  Clock3,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  KeyRound,
  ShieldAlert,
  CalendarDays,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { createGateSecurity, getGateSecurities } from "./gateAccessApi";

const initialSecurity = [
  {
    id: "SEC-001",
    firstName: "Ibrahim",
    surName: "Musa",
    loginId: "SEC/0001",
    email: "ibrahim.musa@school.com",
    isActive: true,
  },
  {
    id: "SEC-002",
    firstName: "Maryam",
    surName: "Bello",
    loginId: "SEC/0002",
    email: "maryam.bello@school.com",
    isActive: true,
  },
  {
    id: "SEC-003",
    firstName: "Usman",
    surName: "Abdullahi",
    loginId: "SEC/0003",
    email: "usman.abdullahi@school.com",
    isActive: false,
  },
];

const initialStaff = [
  {
    id: "STF-001",
    firstName: "Aisha",
    surName: "Yusuf",
    loginId: "SCH/STF/0001",
    role: "STAFF",
    permissionActive: true,
  },
  {
    id: "STF-002",
    firstName: "Abubakar",
    surName: "Sani",
    loginId: "SCH/STF/0002",
    role: "STAFF",
    permissionActive: true,
  },
  {
    id: "STF-003",
    firstName: "Fatima",
    surName: "Umar",
    loginId: "SCH/STF/0003",
    role: "EXAM_OFFICER",
    permissionActive: false,
  },
  {
    id: "STF-004",
    firstName: "Musa",
    surName: "Garba",
    loginId: "SCH/STF/0004",
    role: "ADMINISTRATOR",
    permissionActive: false,
  },
];

const initialHistory = [
  {
    id: 1,
    studentName: "Ahmad Ibrahim",
    admissionNumber: "STU/2026/001",
    className: "Primary 4A",
    type: "ARRIVAL",
    scanner: "Ibrahim Musa",
    scannerType: "Security",
    time: "07:32 AM",
    date: "2026-10-20",
  },
  {
    id: 2,
    studentName: "Amina Yusuf",
    admissionNumber: "STU/2026/002",
    className: "Primary 3B",
    type: "ARRIVAL",
    scanner: "Aisha Yusuf",
    scannerType: "Staff",
    time: "07:35 AM",
    date: "2026-10-20",
  },
  {
    id: 3,
    studentName: "Sani Abdullahi",
    admissionNumber: "STU/2026/003",
    className: "JSS 1A",
    type: "ARRIVAL",
    scanner: "Maryam Bello",
    scannerType: "Security",
    time: "07:41 AM",
    date: "2026-10-20",
  },
  {
    id: 4,
    studentName: "Zainab Musa",
    admissionNumber: "STU/2025/041",
    className: "Primary 5A",
    type: "RETURN",
    scanner: "Abubakar Sani",
    scannerType: "Staff",
    time: "01:12 PM",
    date: "2026-10-20",
  },
  {
    id: 5,
    studentName: "Hassan Bello",
    admissionNumber: "STU/2026/010",
    className: "JSS 2B",
    type: "ARRIVAL",
    scanner: "Ibrahim Musa",
    scannerType: "Security",
    time: "07:48 AM",
    date: "2026-10-19",
  },
];

const today = "2026-10-20";

const getInitials = (firstName, surName) =>
  `${firstName?.[0] || ""}${surName?.[0] || ""}`.toUpperCase();

const fullName = (person) =>
  `${person.firstName} ${person.surName}`;

const formatRole = (role) =>
  role
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const isSecurityActive = (person) => {
  if (person?.status) {
    return person.status === "ACTIVE";
  }
  return Boolean(person?.isActive);
};

const getSecurityStatusText = (person) => {
  if (person?.status) {
    return (
      person.status.charAt(0).toUpperCase() +
      person.status.slice(1).toLowerCase()
    );
  }
  return person?.isActive ? "Active" : "Inactive";
};

const Avatar = ({ firstName, surName, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    cyan: "bg-cyan-100 text-cyan-800",
    violet: "bg-violet-100 text-violet-800",
    slate: "bg-slate-200 text-slate-700",
  };

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
        colors[color] || colors.blue
      }`}
    >
      {getInitials(firstName, surName)}
    </div>
  );
};

const StatusBadge = ({ active, activeText = "Active" }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
      active
        ? "bg-emerald-50 text-emerald-700"
        : "bg-slate-100 text-slate-500"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        active ? "bg-emerald-500" : "bg-slate-400"
      }`}
    />
    {active ? activeText : "Inactive"}
  </span>
);

const IconButton = ({ title, onClick, children, danger = false }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    className={`inline-flex items-center justify-center rounded-lg border p-2 transition ${
      danger
        ? "border-rose-100 text-rose-600 hover:bg-rose-50"
        : "border-slate-200 text-slate-600 hover:bg-slate-50"
    }`}
  >
    {children}
  </button>
);

const Modal = ({ title, description, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-lg font-bold text-[#071A52]">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={19} />
        </button>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-slate-700">
      {label}
    </label>
    {children}
  </div>
);

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10";

const PrimaryButton = ({ children, onClick, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#071A52] to-[#123A8F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-blue-200"
  >
    {children}
  </button>
);

const GateAccess = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [security, setSecurity] = useState(initialSecurity);
  const [securitySummary, setSecuritySummary] = useState(null);
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);
  const [isSubmittingSecurity, setIsSubmittingSecurity] = useState(false);
  const [isLiveSecurity, setIsLiveSecurity] = useState(false);

  const [staff, setStaff] = useState(initialStaff);
  const [history] = useState(initialHistory);

  const [search, setSearch] = useState("");
  const [historyDate, setHistoryDate] = useState("all");
  const [historyType, setHistoryType] = useState("all");

  const [modal, setModal] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [message, setMessage] = useState(null);

  const [securityForm, setSecurityForm] = useState({
    firstName: "",
    surName: "",
    email: "",
  });
  const [securityModalError, setSecurityModalError] = useState(null);

  const [selectedStaffId, setSelectedStaffId] = useState("");

  const notify = (type, text) => setMessage({ type, text });

  const loadSecurities = async () => {
    try {
      setIsLoadingSecurity(true);
      const res = await getGateSecurities();
      console.log("✅ [GateAccess] Loaded gate securities SUCCESS:", res);
      if (res?.success && Array.isArray(res?.securityPersonnel)) {
        setSecurity(res.securityPersonnel);
        if (res.summary) {
          setSecuritySummary(res.summary);
        }
        setIsLiveSecurity(true);
      }
    } catch (err) {
      console.error(
        "❌ [GateAccess] Load gate securities ERROR:",
        err?.response?.data || err?.message || err
      );
    } finally {
      setIsLoadingSecurity(false);
    }
  };

  useEffect(() => {
    loadSecurities();
  }, []);

  const activeSecurityCount =
    securitySummary?.active ?? security.filter(isSecurityActive).length;
  const activeStaff = staff.filter((person) => person.permissionActive);
  const todayHistory = history.filter((record) => record.date === today);

  const filteredSecurity = useMemo(() => {
    const query = search.trim().toLowerCase();

    return security.filter((person) =>
      `${fullName(person)} ${person.loginId || ""} ${person.email || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [security, search]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((person) =>
      `${fullName(person)} ${person.loginId} ${person.role}`
        .toLowerCase()
        .includes(query)
    );
  }, [staff, search]);

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return history.filter((record) => {
      const matchesSearch =
        `${record.studentName} ${record.admissionNumber} ${record.className} ${record.scanner}`
          .toLowerCase()
          .includes(query);

      const matchesDate =
        historyDate === "all" || record.date === historyDate;

      const matchesType =
        historyType === "all" || record.type === historyType;

      return matchesSearch && matchesDate && matchesType;
    });
  }, [history, search, historyDate, historyType]);

  const openTab = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setMessage(null);
  };

  const createSecurity = async (event) => {
    event.preventDefault();
    setSecurityModalError(null);

    const firstName = securityForm.firstName.trim();
    const surName = securityForm.surName.trim();
    const email = securityForm.email.trim();

    if (!firstName || !surName || !email) {
      const missingError = "First name, surname, and email are required.";
      setSecurityModalError(missingError);
      console.error("❌ [GateAccess] Validation error:", missingError);
      return;
    }

    try {
      setIsSubmittingSecurity(true);
      console.log("🚀 [GateAccess] Submitting createGateSecurity with:", {
        firstName,
        surName,
        email,
      });

      const response = await createGateSecurity({
        firstName,
        surName,
        email,
      });

      console.log("✅ [GateAccess] createGateSecurity response SUCCESS:", response);

      if (response?.success && response?.securityPersonnel) {
        setSecurity((previous) => [response.securityPersonnel, ...previous]);
        setSecurityForm({ firstName: "", surName: "", email: "" });
        setSecurityModalError(null);
        setModal(null);
        notify(
          "success",
          response.message ||
            "Security personnel account created successfully. Login credentials have been sent by email."
        );
        loadSecurities();
      } else {
        const failedMsg = response?.message || "Failed to create security account.";
        setSecurityModalError(failedMsg);
        console.error("❌ [GateAccess] createGateSecurity returned unsuccessful:", response);
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Could not create security account. Please check the details and try again.";
      setSecurityModalError(errorMsg);
      console.error("❌ [GateAccess] createGateSecurity ERROR response:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
    } finally {
      setIsSubmittingSecurity(false);
    }
  };

  const grantStaffPermission = (event) => {
    event.preventDefault();

    if (!selectedStaffId) {
      notify("error", "Please select a staff member.");
      return;
    }

    const selected = staff.find((person) => person.id === selectedStaffId);

    if (!selected) {
      notify("error", "That staff member could not be found.");
      return;
    }

    if (selected.permissionActive) {
      notify("error", "This staff member already has scanning permission.");
      return;
    }

    setStaff((previous) =>
      previous.map((person) =>
        person.id === selectedStaffId
          ? { ...person, permissionActive: true }
          : person
      )
    );

    setSelectedStaffId("");
    setModal(null);
    notify(
      "success",
      "Demo scanning permission granted. No backend permissions were changed."
    );
  };

  const toggleSecurity = (person) => {
    const nextActive = !isSecurityActive(person);
    setSecurity((previous) =>
      previous.map((item) =>
        item.id === person.id
          ? {
              ...item,
              isActive: nextActive,
              status: nextActive ? "ACTIVE" : "INACTIVE",
            }
          : item
      )
    );

    notify(
      "success",
      `${fullName(person)}'s demo security status is now ${
        nextActive ? "active" : "inactive"
      }.`
    );

    setModal(null);
    setSelectedPerson(null);
  };

  const toggleStaffPermission = (person) => {
    setStaff((previous) =>
      previous.map((item) =>
        item.id === person.id
          ? { ...item, permissionActive: !item.permissionActive }
          : item
      )
    );

    notify(
      "success",
      `${fullName(person)}'s demo scanning permission has been ${
        person.permissionActive ? "revoked" : "restored"
      }.`
    );

    setModal(null);
    setSelectedPerson(null);
  };

    const tabs = [
    { id: "overview", label: "Overview", icon: ShieldCheck },
    { id: "security", label: "Gate security", icon: Users },
    { id: "staff", label: "Authorized Staff", icon: UserRoundCheck },
    { id: "history", label: "Scan history", icon: History },
  ];

  const tabIntro = {
    overview:
      "This overview helps administrators monitor school entry activity, keep a clear view of who can scan students, and reduce manual class-attendance work by capturing arrivals as digital gate events.",
    security:
      "This tab is where school leaders assign and manage gate security staff who are responsible for student entry scanning and school arrival checks.",
    staff:
      "This tab controls which trusted staff members are authorized to support gate scanning and reduce the security team's workload during arrival checks.",
    history:
      "This tab records student arrival and return events to help administrators review patterns, support parent notifications, and prepare later attendance follow-up.",
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-800">
              <ScanLine size={17} />
              School operations
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-[#071A52] sm:text-3xl">
              Gate Access Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              This is the admin control center for student gate scanning, school arrival checks, and daily access oversight. It helps your school notify parents when students arrive and reduces the workload of manual class attendance follow-up.
            </p>
          </div>

          {isLiveSecurity ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 size={15} />
              Gate Security API live
            </span>
          ) : (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              <Info size={15} />
              Demo mode · Local fallback
            </span>
          )}
        </div>

        {/* Helpful intro */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071A52] via-[#0A2463] to-[#123A8F] p-5 text-white sm:p-7">
          <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border-[28px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-20 right-28 h-44 w-44 rounded-full bg-cyan-400/10 blur-2xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                <ShieldCheck size={15} />
                Your gate, under your control
              </div>

              <h2 className="text-xl font-bold sm:text-2xl">
                A safer, smarter school arrival experience.
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Gate access keeps student arrival records in one place, supports parent notifications, and helps the school capture daily movement without heavy manual attendance follow-up for each class.
              </p>
            </div>

            <div className="relative flex shrink-0 items-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-4 py-3 sm:self-center">
              <ScanLine size={25} className="text-cyan-300" />
              <div>
                <p className="text-sm font-bold">Controlled access</p>
                <p className="mt-0.5 text-xs text-blue-100">
                  Authorized scanners only
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {message && (
          <div
            role="status"
            aria-live="polite"
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
              message.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            )}

            <p className="flex-1 leading-6">{message.text}</p>

            <button
              type="button"
              onClick={() => setMessage(null)}
              aria-label="Dismiss message"
              className="rounded-md p-1 hover:bg-black/5"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Active security",
              value: activeSecurityCount,
              note: `${security.length} accounts in total`,
              icon: ShieldCheck,
              color: "bg-blue-50 text-blue-800",
            },
            {
              label: "Authorized staff",
              value: activeStaff.length,
              note: "Staff with scanning permission",
              icon: Users,
              color: "bg-cyan-50 text-cyan-800",
            },
            {
              label: "Today's scans",
              value: todayHistory.length,
              note: "Arrival and return events",
              icon: ScanLine,
              color: "bg-violet-50 text-violet-800",
            },
            {
              label: "Recent records",
              value: history.length,
              note: "Demo history available",
              icon: History,
              color: "bg-emerald-50 text-emerald-800",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#071A52]">
                      {item.value}
                    </p>
                  </div>

                  <div className={`rounded-xl p-3 ${item.color}`}>
                    <Icon size={21} />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400">{item.note}</p>
              </div>
            );
          })}
        </div>

        {/* Main tabs */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-3 pt-3 sm:px-5">
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => openTab(tab.id)}
                    className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition sm:px-4 ${
                      active
                        ? "border-cyan-500 text-[#071A52]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Icon size={17} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#071A52]">
                    Access overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Monitor school entry activity, verify approved scanners, and prepare a clearer workflow for parent notification and automated attendance support.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700">
                  <p className="font-semibold text-[#071A52]">Tab note</p>
                  <p className="mt-1 leading-6">{tabIntro.overview}</p>
                </div>

                <PrimaryButton onClick={() => openTab("security")}>
                  <Plus size={17} />
                  Manage access
                </PrimaryButton>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <button
                  type="button"
                  onClick={() => openTab("security")}
                  className="group rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-200 hover:bg-blue-50/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-800">
                      <ShieldCheck size={23} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#071A52]">
                        Security personnel
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Manage dedicated security accounts and their active
                        status.
                      </p>
                      <p className="mt-3 text-sm font-semibold text-blue-800">
                        {activeSecurityCount} active accounts
                        <span className="ml-1 transition group-hover:translate-x-1">
                          →
                        </span>
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openTab("staff")}
                  className="group rounded-2xl border border-slate-200 p-5 text-left transition hover:border-cyan-200 hover:bg-cyan-50/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-cyan-50 p-3 text-cyan-800">
                      <UserRoundCheck size={23} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#071A52]">
                        Authorized staff
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Let trusted staff help during busy arrival periods.
                        Revoke their scanning permission at any time.
                      </p>
                      <p className="mt-3 text-sm font-semibold text-cyan-800">
                        {activeStaff.length} authorized staff
                        <span className="ml-1 transition group-hover:translate-x-1">
                          →
                        </span>
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200">
                <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-[#071A52]">
                      Recent gate activity
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      The latest sample scan records.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openTab("history")}
                    className="text-left text-sm font-semibold text-blue-800 hover:text-cyan-700"
                  >
                    View all history →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {history.slice(0, 3).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center gap-3 px-4 py-4"
                    >
                      <div
                        className={`rounded-xl p-2.5 ${
                          record.type === "ARRIVAL"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {record.type === "ARRIVAL" ? (
                          <ArrowDownLeft size={19} />
                        ) : (
                          <ArrowUpRight size={19} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {record.studentName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {record.className} · Scanned by {record.scanner}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs font-semibold text-slate-700">
                          {record.time}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {record.type === "ARRIVAL" ? "Arrival" : "Return"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
                <Info size={19} className="mt-0.5 shrink-0 text-cyan-800" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Remember: access and attendance are different
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Gate scans record a student's gate activity. A missing
                    scan does not automatically mean the student is absent
                    from school.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security personnel */}
          {activeTab === "security" && (
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#071A52]">
                    Gate security team
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Dedicated gate-security accounts for personnel handling student arrival scanning and school-entry checks.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700">
                  <p className="font-semibold text-[#071A52]">Tab note</p>
                  <p className="mt-1 leading-6">{tabIntro.security}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={loadSecurities}
                    disabled={isLoadingSecurity}
                    title="Refresh security personnel list"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    <RefreshCw
                      size={16}
                      className={isLoadingSecurity ? "animate-spin text-blue-600" : "text-slate-500"}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>

                  <PrimaryButton
                    onClick={() => {
                      setSecurityForm({
                        firstName: "",
                        surName: "",
                        email: "",
                      });
                      setSecurityModalError(null);
                      setModal("add-security");
                      setMessage(null);
                    }}
                  >
                    <UserPlus size={17} />
                    Add gate security
                  </PrimaryButton>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <KeyRound size={19} className="shrink-0 text-blue-800" />
                <p className="text-sm leading-6 text-slate-600">
                  Security personnel should use dedicated, restricted
                  accounts. They should not receive academic staff privileges
                  just to scan QR codes.
                </p>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                <Search size={18} className="shrink-0 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, login ID or email..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-3 font-semibold">Personnel</th>
                      <th className="px-3 py-3 font-semibold">Login ID</th>
                      <th className="px-3 py-3 font-semibold">Email</th>
                      <th className="px-3 py-3 font-semibold">Status</th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {isLoadingSecurity ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <Loader2
                            size={28}
                            className="mx-auto animate-spin text-blue-600"
                          />
                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            Loading security personnel...
                          </p>
                        </td>
                      </tr>
                    ) : filteredSecurity.map((person) => (
                      <tr key={person.id} className="hover:bg-slate-50/70">
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              firstName={person.firstName}
                              surName={person.surName}
                              color="blue"
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {fullName(person)}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-400">
                                Security personnel
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-4 text-sm text-slate-600">
                          {person.loginId || "—"}
                        </td>

                        <td className="px-3 py-4 text-sm text-slate-600">
                          {person.email || "—"}
                        </td>

                        <td className="px-3 py-4">
                          <StatusBadge
                            active={isSecurityActive(person)}
                            activeText={getSecurityStatusText(person)}
                          />
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex justify-end">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPerson(person);
                                  setModal("view-security");
                                }}
                                className="rounded-lg border border-slate-200 px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                View staff
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPerson(person);
                                  setModal("edit-security");
                                }}
                                className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2 text-[11px] font-semibold text-sky-700 hover:bg-sky-100"
                              >
                                Edit staff
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPerson(person);
                                  setModal("reset-security-password");
                                }}
                                className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] font-semibold text-amber-700 hover:bg-amber-100"
                              >
                                Reset password
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPerson(person);
                                  setModal("toggle-security");
                                }}
                                className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                              >
                                Deactivate account
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!isLoadingSecurity && filteredSecurity.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <Users
                            size={28}
                            className="mx-auto text-slate-300"
                          />
                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            No security personnel found
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Try another search or add security personnel.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                {isLiveSecurity
                  ? "Connected to live gate securities API. Creating personnel registers their account and emails credentials."
                  : "Currently running with local sample data. When backend is reachable, live gate security records will be displayed."}
              </p>
            </div>
          )}

          {/* Authorized staff */}
          {activeTab === "staff" && (
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#071A52]">
                    Authorized Staff
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Grant gate-scanning access to trusted staff members so they can help during arrival checks and reduce the security team's workload.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700">
                  <p className="font-semibold text-[#071A52]">Tab note</p>
                  <p className="mt-1 leading-6">{tabIntro.staff}</p>
                </div>

                <PrimaryButton
                  onClick={() => {
                    setSelectedStaffId("");
                    setModal("authorize-staff");
                    setMessage(null);
                  }}
                >
                  <UserPlus size={17} />
                  Add authorized staff
                </PrimaryButton>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
                <UserRoundCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-cyan-800"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Flexible scanning permission
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Staff retain their normal school accounts. You can
                    independently grant, revoke, or restore their gate
                    scanning permission without deleting their permission
                    history.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                <Search size={18} className="shrink-0 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search staff by name, login ID or role..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-3 font-semibold">Staff member</th>
                      <th className="px-3 py-3 font-semibold">Login ID</th>
                      <th className="px-3 py-3 font-semibold">School role</th>
                      <th className="px-3 py-3 font-semibold">Scan access</th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredStaff.map((person) => (
                      <tr key={person.id} className="hover:bg-slate-50/70">
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              firstName={person.firstName}
                              surName={person.surName}
                              color="cyan"
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {fullName(person)}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                Existing staff account
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-4 text-sm text-slate-600">
                          {person.loginId}
                        </td>

                        <td className="px-3 py-4 text-sm text-slate-600">
                          {formatRole(person.role)}
                        </td>

                        <td className="px-3 py-4">
                          <StatusBadge
                            active={person.permissionActive}
                            activeText="Authorized"
                          />
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPerson(person);
                                setModal("toggle-staff");
                              }}
                              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                person.permissionActive
                                  ? "border-rose-100 text-rose-600 hover:bg-rose-50"
                                  : "border-emerald-100 text-emerald-700 hover:bg-emerald-50"
                              }`}
                            >
                              {person.permissionActive
                                ? "Revoke access"
                                : "Grant access"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredStaff.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <Users
                            size={28}
                            className="mx-auto text-slate-300"
                          />
                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            No staff members found
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Try a different search.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                Only staff eligible under ScholaNode's final authorization
                policy should be grantable access. Backend enforcement is
                required before production use.
              </p>
            </div>
          )}

          {/* Scan history */}
          {activeTab === "history" && (
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#071A52]">
                    Gate scan history
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Review which students were scanned, when, and by whom so the school can support parent updates and later class attendance follow-up.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700">
                  <p className="font-semibold text-[#071A52]">Tab note</p>
                  <p className="mt-1 leading-6">{tabIntro.history}</p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                  <History size={15} />
                  {filteredHistory.length} records
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
                <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                  <Search size={18} className="shrink-0 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search student, admission number or scanner..."
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="relative">
                  <CalendarDays
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={historyDate}
                    onChange={(event) => setHistoryDate(event.target.value)}
                    className={`${inputClass} appearance-none pl-9 pr-8`}
                  >
                    <option value="all">All dates</option>
                    <option value="2026-10-20">20 Oct 2026</option>
                    <option value="2026-10-19">19 Oct 2026</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <div className="relative">
                  <select
                    value={historyType}
                    onChange={(event) => setHistoryType(event.target.value)}
                    className={`${inputClass} appearance-none pr-8`}
                  >
                    <option value="all">All scan types</option>
                    <option value="ARRIVAL">Arrival</option>
                    <option value="RETURN">Return</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-4 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold">Class</th>
                      <th className="px-4 py-3 font-semibold">Scan type</th>
                      <th className="px-4 py-3 font-semibold">Scanned by</th>
                      <th className="px-4 py-3 font-semibold">Date & time</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {record.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {record.admissionNumber}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-600">
                          {record.className}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              record.type === "ARRIVAL"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {record.type === "ARRIVAL" ? (
                              <ArrowDownLeft size={14} />
                            ) : (
                              <ArrowUpRight size={14} />
                            )}
                            {record.type === "ARRIVAL" ? "Arrival" : "Return"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-slate-700">
                            {record.scanner}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {record.scannerType}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-slate-700">
                            {record.date}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                            <Clock3 size={13} />
                            {record.time}
                          </p>
                        </td>
                      </tr>
                    ))}

                    {filteredHistory.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <History
                            size={28}
                            className="mx-auto text-slate-300"
                          />
                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            No matching scan records
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Try changing the date, scan type, or search term.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                This history is sample data. Production history should come
                from persisted gate scan records and retain the original
                scanner identity even after access is revoked.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400">
          ScholaNode · Gate Access Management
        </p>
      </div>

      {/* Add security modal */}
      {modal === "add-security" && (
        <Modal
          title="Add gate security"
          description="Create a dedicated gate-security account for school entry scanning and arrival checks."
          onClose={() => {
            if (!isSubmittingSecurity) {
              setSecurityModalError(null);
              setModal(null);
            }
          }}
        >
          <form onSubmit={createSecurity} className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
              <ShieldCheck size={19} className="mt-0.5 text-blue-800 shrink-0" />
              <p className="text-xs leading-5 text-slate-600">
                A restricted gate-security account will be created. The system will send the generated login credentials directly to the personnel's email.
              </p>
            </div>

            {securityModalError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
                <div className="flex-1 text-xs sm:text-sm font-medium leading-5">
                  {securityModalError}
                </div>
                <button
                  type="button"
                  onClick={() => setSecurityModalError(null)}
                  aria-label="Dismiss error"
                  className="rounded-md p-1 text-rose-400 hover:bg-rose-100 hover:text-rose-700 transition"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <Field label="First name *">
              <input
                required
                value={securityForm.firstName}
                onChange={(event) => {
                  if (securityModalError) setSecurityModalError(null);
                  setSecurityForm((previous) => ({
                    ...previous,
                    firstName: event.target.value,
                  }));
                }}
                placeholder="Enter first name"
                className={inputClass}
              />
            </Field>

            <Field label="Surname *">
              <input
                required
                value={securityForm.surName}
                onChange={(event) => {
                  if (securityModalError) setSecurityModalError(null);
                  setSecurityForm((previous) => ({
                    ...previous,
                    surName: event.target.value,
                  }));
                }}
                placeholder="Enter surname"
                className={inputClass}
              />
            </Field>

            <Field label="Email address * (Credentials sent here)">
              <input
                required
                type="email"
                value={securityForm.email}
                onChange={(event) => {
                  if (securityModalError) setSecurityModalError(null);
                  setSecurityForm((previous) => ({
                    ...previous,
                    email: event.target.value,
                  }));
                }}
                placeholder="security.officer@school.com"
                className={inputClass}
              />
            </Field>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isSubmittingSecurity}
                onClick={() => {
                  setSecurityModalError(null);
                  setModal(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingSecurity}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#071A52] to-[#123A8F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
              >
                {isSubmittingSecurity ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Create security account
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Authorize staff modal */}
      {modal === "authorize-staff" && (
        <Modal
          title="Authorize staff member"
          description="Select an existing staff member to grant gate scanning permission."
          onClose={() => setModal(null)}
        >
          <form onSubmit={grantStaffPermission} className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50 p-3">
              <UserRoundCheck
                size={19}
                className="mt-0.5 shrink-0 text-cyan-800"
              />
              <p className="text-xs leading-5 text-slate-600">
                This demo changes only the staff member's local permission
                status. It does not grant real scanning access.
              </p>
            </div>

            <Field label="Select staff member">
              <select
                required
                value={selectedStaffId}
                onChange={(event) => setSelectedStaffId(event.target.value)}
                className={inputClass}
              >
                <option value="">Choose a staff member</option>
                {staff
                  .filter((person) => !person.permissionActive)
                  .map((person) => (
                    <option key={person.id} value={person.id}>
                      {fullName(person)} · {formatRole(person.role)}
                    </option>
                  ))}
              </select>
            </Field>

            {staff.every((person) => person.permissionActive) && (
              <p className="text-sm text-slate-500">
                All sample staff members already have scanning permission.
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <PrimaryButton type="submit">
                <UserRoundCheck size={17} />
                Grant demo permission
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmation modal */}
      {(modal === "view-security" || modal === "edit-security" || modal === "reset-security-password" || modal === "toggle-security" || modal === "toggle-staff") &&
        selectedPerson && (
          <Modal
            title={
              modal === "view-security"
                ? "Gate security details"
                : modal === "edit-security"
                  ? "Edit gate security"
                  : modal === "reset-security-password"
                    ? "Reset security password"
                    : modal === "toggle-security"
                      ? selectedPerson.isActive
                        ? "Deactivate security account?"
                        : "Reactivate security account?"
                      : selectedPerson.permissionActive
                        ? "Revoke scanning permission?"
                        : "Restore scanning permission?"
            }
            description={fullName(selectedPerson)}
            onClose={() => {
              setModal(null);
              setSelectedPerson(null);
            }}
          >
            {modal === "view-security" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Login ID</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{selectedPerson.loginId || "—"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Email</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{selectedPerson.email || "—"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Status</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{getSecurityStatusText(selectedPerson)}</p>
                </div>
              </div>
            )}

            {modal === "edit-security" && (
              <div className="space-y-4">
                <Field label="First name">
                  <input
                    value={selectedPerson.firstName}
                    onChange={(event) => setSelectedPerson((previous) => ({ ...previous, firstName: event.target.value }))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Surname">
                  <input
                    value={selectedPerson.surName}
                    onChange={(event) => setSelectedPerson((previous) => ({ ...previous, surName: event.target.value }))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={selectedPerson.email || ""}
                    onChange={(event) => setSelectedPerson((previous) => ({ ...previous, email: event.target.value }))}
                    className={inputClass}
                  />
                </Field>
              </div>
            )}

            {modal === "reset-security-password" && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-slate-700">
                This demo will generate a new temporary password for the gate security account. Real password reset flows must be handled securely by the backend and delivered in a protected channel.
              </div>
            )}

            {(modal === "toggle-security" || modal === "toggle-staff") && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
                <ShieldAlert
                  size={21}
                  className="mt-0.5 shrink-0 text-amber-700"
                />
                <p className="text-sm leading-6 text-slate-700">
                  {modal === "toggle-security"
                    ? selectedPerson.isActive
                      ? "This demo will mark the security account inactive. In production, the backend must block that account from scanning."
                      : "This demo will mark the security account active again. Real reactivation must follow your school's authorization policy."
                    : selectedPerson.permissionActive
                      ? "This demo will remove this staff member's scanning permission. Their normal staff account and historical scan records remain unchanged."
                      : "This demo will restore this staff member's scanning permission."}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setModal(null);
                  setSelectedPerson(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              {modal === "reset-security-password" ? (
                <button
                  type="button"
                  onClick={() => {
                    notify("success", `Demo password reset requested for ${fullName(selectedPerson)}. No real password was changed.`);
                    setModal(null);
                    setSelectedPerson(null);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  <KeyRound size={17} />
                  Confirm reset
                </button>
              ) : modal === "edit-security" ? (
                <button
                  type="button"
                  onClick={() => {
                    notify("success", `Demo edits saved for ${fullName(selectedPerson)}. Nothing was sent to the backend.`);
                    setModal(null);
                    setSelectedPerson(null);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  <CheckCircle2 size={17} />
                  Save changes
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (modal === "toggle-security") {
                      toggleSecurity(selectedPerson);
                    } else {
                      toggleStaffPermission(selectedPerson);
                    }
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${
                    (modal === "toggle-security" && selectedPerson.isActive) ||
                    (modal === "toggle-staff" && selectedPerson.permissionActive)
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-emerald-700 hover:bg-emerald-800"
                  }`}
                >
                  {(modal === "toggle-security" && selectedPerson.isActive) ||
                  (modal === "toggle-staff" && selectedPerson.permissionActive) ? (
                    <UserRoundX size={17} />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                  Confirm
                </button>
              )}
            </div>
          </Modal>
        )}
    </div>
  );
};

export default GateAccess;
