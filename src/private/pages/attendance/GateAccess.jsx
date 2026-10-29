
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  Loader2,
  RefreshCw,
  MoreVertical,
  Eye,
  Pencil,
} from "lucide-react";
import {
  createGateSecurity,
  getGateSecurities,
  sendPasswordRecovery,
  setGateSecurityStatus,
  updateGateSecurity,
} from "./gateAccessApi";
import {
  getScannerPermissions,
  grantScannerPermission,
  revokeScannerPermission,
} from "./gateScannerApi";
import { getStaff } from "../people/staffApi";

const getInitials = (firstName, surName) =>
  `${firstName?.[0] || ""}${surName?.[0] || ""}`.toUpperCase() || "SC";

const fullName = (person) =>
  `${person?.firstName || ""} ${person?.surName || ""}`.trim() || "Unknown user";

const formatRole = (role) =>
  role
    ? role
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "—";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

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

const apiErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

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

const StatusBadge = ({
  active,
  activeText = "Active",
  inactiveText = "Inactive",
}) => (
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
    {active ? activeText : inactiveText}
  </span>
);

const ActionMenuItem = ({ icon: Icon, onClick, danger = false, children }) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold transition ${
      danger
        ? "text-rose-600 hover:bg-rose-50"
        : "text-slate-700 hover:bg-slate-50"
    }`}
  >
    <Icon size={16} className={danger ? "text-rose-500" : "text-slate-400"} />
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

const PrimaryButton = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#071A52] to-[#123A8F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
  >
    {children}
  </button>
);

const ErrorNotice = ({ message, onDismiss }) =>
  message ? (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800"
    >
      <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
      <p className="flex-1 text-xs font-medium leading-5 sm:text-sm">
        {message}
      </p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="rounded-md p-1 text-rose-400 transition hover:bg-rose-100 hover:text-rose-700"
        >
          <X size={15} />
        </button>
      )}
    </div>
  ) : null;

const TableMessage = ({
  icon: Icon,
  title,
  description,
  action,
  iconClassName = "text-slate-300",
}) => (
  <div className="px-4 py-12 text-center">
    <Icon size={28} className={`mx-auto ${iconClassName}`} />
    <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
    {description && (
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    )}
    {action}
  </div>
);

const GateAccess = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const [security, setSecurity] = useState([]);
  const [securitySummary, setSecuritySummary] = useState(null);
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(true);
  const [securityError, setSecurityError] = useState(null);
  const [isSubmittingSecurity, setIsSubmittingSecurity] = useState(false);

  const [scanners, setScanners] = useState([]);
  const [isLoadingScanners, setIsLoadingScanners] = useState(true);
  const [scannersError, setScannersError] = useState(null);

  const [staffOptions, setStaffOptions] = useState([]);
  const [isLoadingStaffOptions, setIsLoadingStaffOptions] = useState(false);
  const [staffOptionsError, setStaffOptionsError] = useState(null);
  const [staffModalSearch, setStaffModalSearch] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [isGranting, setIsGranting] = useState(false);

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [message, setMessage] = useState(null);
  const [actionsMenu, setActionsMenu] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const [securityForm, setSecurityForm] = useState({
    firstName: "",
    surName: "",
    email: "",
  });
  const [securityModalError, setSecurityModalError] = useState(null);

  const notify = (type, text) => setMessage({ type, text });

  const loadSecurities = async () => {
    try {
      setIsLoadingSecurity(true);
      setSecurityError(null);
      const res = await getGateSecurities();
      console.log("✅ [GateAccess] Loaded gate securities SUCCESS:", res);

      if (res?.success && Array.isArray(res?.securityPersonnel)) {
        setSecurity(res.securityPersonnel);
        setSecuritySummary(res.summary || null);
      } else {
        setSecurity([]);
        setSecuritySummary(null);
        setSecurityError(res?.message || "Could not load the security team.");
      }
    } catch (error) {
      console.error(
        "❌ [GateAccess] Load gate securities ERROR:",
        error?.response?.data || error?.message || error
      );
      setSecurity([]);
      setSecuritySummary(null);
      setSecurityError(
        apiErrorMessage(
          error,
          "Could not load the security team. Please try again."
        )
      );
    } finally {
      setIsLoadingSecurity(false);
    }
  };

  const loadScanners = async () => {
    try {
      setIsLoadingScanners(true);
      setScannersError(null);
      const res = await getScannerPermissions();
      console.log("✅ [GateAccess] Loaded scanner permissions SUCCESS:", res);

      if (res?.success && Array.isArray(res?.scanners)) {
        setScanners(res.scanners);
      } else {
        setScanners([]);
        setScannersError(
          res?.message || "Could not load authorized staff."
        );
      }
    } catch (error) {
      console.error(
        "❌ [GateAccess] Load scanner permissions ERROR:",
        error?.response?.data || error?.message || error
      );
      setScanners([]);
      setScannersError(
        apiErrorMessage(
          error,
          "Could not load authorized staff. Please try again."
        )
      );
    } finally {
      setIsLoadingScanners(false);
    }
  };

  useEffect(() => {
    const request = window.setTimeout(() => {
      loadSecurities();
      loadScanners();
    }, 0);

    return () => window.clearTimeout(request);
  }, []);

  const loadStaffOptions = async () => {
    try {
      setIsLoadingStaffOptions(true);
      setStaffOptionsError(null);

      const res = await getStaff();
      const records = Array.isArray(res?.staff) ? res.staff : [];
      const authorizedIds = new Set(
        scanners.filter((person) => person.isActive).map((person) => person.userId)
      );

      setStaffOptions(
        records.filter(
          (person) =>
            person.role === "STAFF" &&
            person.status === "ACTIVE" &&
            !authorizedIds.has(person.id)
        )
      );
    } catch (error) {
      console.error(
        "❌ [GateAccess] Load eligible staff ERROR:",
        error?.response?.data || error?.message || error
      );
      setStaffOptions([]);
      setStaffOptionsError(
        apiErrorMessage(error, "Could not load the staff list. Please try again.")
      );
    } finally {
      setIsLoadingStaffOptions(false);
    }
  };

  const activeSecurityCount =
    securitySummary?.active ?? security.filter(isSecurityActive).length;
  const authorizedScanners = useMemo(
    () => scanners.filter((person) => person.isActive),
    [scanners]
  );

  const filteredSecurity = useMemo(() => {
    const query = search.trim().toLowerCase();

    return security.filter((person) =>
      `${fullName(person)} ${person.loginId || ""} ${person.email || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [security, search]);

  const filteredScanners = useMemo(() => {
    const query = search.trim().toLowerCase();

    return authorizedScanners.filter((person) =>
      `${fullName(person)} ${person.loginId || ""} ${person.role || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [authorizedScanners, search]);

  const filteredStaffOptions = useMemo(() => {
    const query = staffModalSearch.trim().toLowerCase();

    return staffOptions.filter((person) =>
      `${fullName(person)} ${person.loginId || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [staffOptions, staffModalSearch]);

  useEffect(() => {
    if (!actionsMenu) return undefined;

    const closeMenu = () => setActionsMenu(null);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("pointerdown", closeMenu);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", closeMenu);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [actionsMenu]);

  const toggleActionsMenu = (event, person) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const menuHeight = 208;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow < menuHeight
        ? Math.max(8, rect.top - menuHeight - 6)
        : rect.bottom + 6;
    const right = Math.min(
      Math.max(8, window.innerWidth - rect.right),
      Math.max(8, window.innerWidth - 216)
    );

    setActionsMenu((current) =>
      current?.person.id === person.id ? null : { person, top, right }
    );
  };

  const closePersonModal = () => {
    setModal(null);
    setSelectedPerson(null);
    setActionError(null);
  };

  const openPersonAction = (person, nextModal) => {
    setActionsMenu(null);
    setSelectedPerson(person);
    setActionError(null);
    setModal(nextModal);
  };

  const openTab = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setMessage(null);
    setActionsMenu(null);
  };

  const openAuthorizeStaff = () => {
    setModal("authorize-staff");
    setMessage(null);
    setActionError(null);
    setSelectedStaffId("");
    setStaffModalSearch("");
    setStaffOptions([]);
    loadStaffOptions();
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
      const errorMsg = apiErrorMessage(
        error,
        "Could not create security account. Please check the details and try again."
      );
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

  const grantStaffPermission = async (event) => {
    event.preventDefault();

    if (!selectedStaffId) {
      setActionError("Select a staff member to continue.");
      return;
    }

    try {
      setIsGranting(true);
      setActionError(null);

      const response = await grantScannerPermission({ userId: selectedStaffId });
      console.log("✅ [GateAccess] Grant scanner permission SUCCESS:", response);

      if (response?.success && response?.scanner) {
        notify(
          "success",
          response.message || "Staff member authorized to scan successfully."
        );
        setModal(null);
        setSelectedStaffId("");
        setStaffOptions([]);
        loadScanners();
      } else {
        setActionError(
          response?.message || "Could not grant scanning permission."
        );
      }
    } catch (error) {
      console.error(
        "❌ [GateAccess] Grant scanner permission ERROR:",
        error?.response?.data || error?.message || error
      );
      setActionError(
        apiErrorMessage(error, "Could not grant scanning permission.")
      );
    } finally {
      setIsGranting(false);
    }
  };

  const revokeStaffPermission = async () => {
    if (!selectedPerson) return;

    try {
      setIsSubmittingAction(true);
      setActionError(null);

      const response = await revokeScannerPermission(selectedPerson.userId);
      console.log("✅ [GateAccess] Revoke scanner permission SUCCESS:", response);

      if (response?.success) {
        notify(
          "success",
          response.message ||
            `${fullName(selectedPerson)}'s scanning access has been revoked.`
        );
        closePersonModal();
        loadScanners();
      } else {
        setActionError(
          response?.message || "Could not revoke scanning permission."
        );
      }
    } catch (error) {
      console.error(
        "❌ [GateAccess] Revoke scanner permission ERROR:",
        error?.response?.data || error?.message || error
      );
      setActionError(
        apiErrorMessage(error, "Could not revoke scanning permission.")
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const saveSecurityDetails = async () => {
    if (!selectedPerson) return;

    const firstName = selectedPerson.firstName?.trim() || "";
    const surName = selectedPerson.surName?.trim() || "";
    const email = selectedPerson.email?.trim() || "";

    if (!firstName || !surName || !email) {
      setActionError("First name, surname, and email are required.");
      return;
    }

    try {
      setIsSubmittingAction(true);
      setActionError(null);

      const response = await updateGateSecurity(selectedPerson.id, {
        firstName,
        surName,
        email,
      });
      console.log("✅ [GateAccess] Update security SUCCESS:", response);

      if (response?.success && response?.securityPersonnel) {
        setSecurity((previous) =>
          previous.map((item) =>
            item.id === response.securityPersonnel.id
              ? { ...item, ...response.securityPersonnel }
              : item
          )
        );
        notify(
          "success",
          response.message || "Security personnel details updated successfully."
        );
        closePersonModal();
        loadSecurities();
      } else {
        setActionError(
          response?.message || "Could not update security details."
        );
      }
    } catch (error) {
      console.error(
        "❌ [GateAccess] Update security ERROR:",
        error?.response?.data || error?.message || error
      );
      setActionError(
        apiErrorMessage(error, "Could not update security details.")
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const toggleSecurity = async () => {
    if (!selectedPerson) return;

    const nextActive = !isSecurityActive(selectedPerson);

    try {
      setIsSubmittingAction(true);
      setActionError(null);

      const response = await setGateSecurityStatus(
        selectedPerson.id,
        nextActive
      );
      console.log("✅ [GateAccess] Security status change SUCCESS:", response);

      if (response?.success) {
        notify(
          "success",
          response.message ||
            `${fullName(selectedPerson)}'s account is now ${
              nextActive ? "active" : "inactive"
            }.`
        );
        closePersonModal();
        loadSecurities();
      } else {
        setActionError(response?.message || "Could not update the account.");
      }
    } catch (error) {
      console.error(
        "❌ [GateAccess] Security status change ERROR:",
        error?.response?.data || error?.message || error
      );
      setActionError(
        apiErrorMessage(error, "Could not update the account.")
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const resetSecurityPassword = async () => {
    if (!selectedPerson) return;

    if (!selectedPerson.email) {
      setActionError(
        "This account has no email address. Add one before requesting a reset."
      );
      return;
    }

    try {
      setIsSubmittingAction(true);
      setActionError(null);

      const response = await sendPasswordRecovery(selectedPerson.email);
      console.log("✅ [GateAccess] Password recovery SUCCESS:", response);

      notify(
        "success",
        response?.message ||
          `Password recovery instructions were sent to ${selectedPerson.email}.`
      );
      closePersonModal();
    } catch (error) {
      console.error(
        "❌ [GateAccess] Password recovery ERROR:",
        error?.response?.data || error?.message || error
      );
      setActionError(
        apiErrorMessage(
          error,
          "Could not send the password recovery email. Please try again."
        )
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: ShieldCheck },
    { id: "security", label: "Gate security", icon: Users },
    { id: "staff", label: "Authorized Staff", icon: UserRoundCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page header */}
        <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-[#061541] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-[0_20px_50px_-25px_rgba(7,26,82,0.6)] sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-16 -z-10 h-56 w-56 rounded-full border-[32px] border-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-24 right-40 -z-10 h-52 w-52 rounded-full bg-cyan-400/10 blur-2xl" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-cyan-200 backdrop-blur-md">
                <ScanLine size={14} />
                School operations
              </span>

              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                Gate Access Management
              </h1>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Manage who can scan students at the gate and keep every arrival
                organized in one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-80">
              <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-md">
                <div className="flex items-center justify-between text-blue-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider">
                    Active security
                  </p>
                  <ShieldCheck size={15} className="text-emerald-300" />
                </div>
                <p className="mt-2 text-3xl font-black tabular-nums">
                  {isLoadingSecurity ? "…" : activeSecurityCount}
                </p>
                <p className="text-[11px] text-blue-200/80">
                  {isLoadingSecurity
                    ? "Loading accounts"
                    : `${security.length} accounts total`}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-md">
                <div className="flex items-center justify-between text-blue-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider">
                    Authorized staff
                  </p>
                  <UserRoundCheck size={15} className="text-cyan-300" />
                </div>
                <p className="mt-2 text-3xl font-black tabular-nums">
                  {isLoadingScanners ? "…" : authorizedScanners.length}
                </p>
                <p className="text-[11px] text-blue-200/80">
                  Can help with scanning
                </p>
              </div>
            </div>
          </div>
        </section>

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
            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-[#071A52]">
                  Access overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose what you want to manage, or review past gate scans.
                </p>
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
                        Manage the accounts trusted to scan students at the
                        gate.
                      </p>
                      <p className="mt-3 text-sm font-semibold text-blue-800">
                        {isLoadingSecurity
                          ? "Loading accounts"
                          : `${activeSecurityCount} active accounts`}
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
                        Let trusted staff help during busy arrival periods and
                        revoke their permission at any time.
                      </p>
                      <p className="mt-3 text-sm font-semibold text-cyan-800">
                        {isLoadingScanners
                          ? "Loading staff"
                          : `${authorizedScanners.length} authorized staff`}
                        <span className="ml-1 transition group-hover:translate-x-1">
                          →
                        </span>
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                    <History size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#071A52]">
                      Gate scan history
                    </h3>
                    <p className="mt-1 max-w-lg text-sm leading-6 text-slate-500">
                      Every verified arrival is logged with the student, time,
                      and scanning officer. Open the history to review or search
                      past scans.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/scan-history")}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#123A8F]"
                >
                  <History size={16} />
                  View scan history
                </button>
              </div>
            </div>
          )}

          {/* Security personnel */}
          {activeTab === "security" && (
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#071A52]">
                    Gate security team
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Manage the accounts authorized to scan students at the gate.
                  </p>
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
                      className={
                        isLoadingSecurity
                          ? "animate-spin text-blue-600"
                          : "text-slate-500"
                      }
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
                        <td colSpan={5}>
                          <TableMessage
                            icon={Loader2}
                            title="Loading security personnel..."
                            iconClassName="animate-spin text-blue-600"
                          />
                        </td>
                      </tr>
                    ) : securityError ? (
                      <tr>
                        <td colSpan={5}>
                          <TableMessage
                            icon={AlertCircle}
                            title="Could not load security personnel"
                            description={securityError}
                            iconClassName="text-rose-500"
                            action={
                              <button
                                type="button"
                                onClick={loadSecurities}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                <RefreshCw size={14} />
                                Try again
                              </button>
                            }
                          />
                        </td>
                      </tr>
                    ) : filteredSecurity.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <TableMessage
                            icon={Users}
                            title={
                              security.length === 0
                                ? "No security personnel yet"
                                : "No security personnel found"
                            }
                            description={
                              security.length === 0
                                ? "Add a gate security account to start scanning students."
                                : "Try another search term."
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredSecurity.map((person) => (
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
                              inactiveText={getSecurityStatusText(person)}
                            />
                          </td>

                          <td className="px-3 py-4">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                aria-label={`More actions for ${fullName(person)}`}
                                aria-haspopup="menu"
                                aria-expanded={
                                  actionsMenu?.person.id === person.id
                                }
                                onPointerDown={(event) =>
                                  event.stopPropagation()
                                }
                                onClick={(event) =>
                                  toggleActionsMenu(event, person)
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                              >
                                <MoreVertical size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Authorized staff */}
          {activeTab === "staff" && (
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#071A52]">
                    Authorized staff
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Let trusted staff help with arrival scanning, and revoke
                    their permission whenever needed.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={loadScanners}
                    disabled={isLoadingScanners}
                    title="Refresh authorized staff"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    <RefreshCw
                      size={16}
                      className={
                        isLoadingScanners
                          ? "animate-spin text-cyan-600"
                          : "text-slate-500"
                      }
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>

                  <PrimaryButton onClick={openAuthorizeStaff}>
                    <UserPlus size={17} />
                    Add authorized staff
                  </PrimaryButton>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                <Search size={18} className="shrink-0 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search authorized staff by name, login ID or role..."
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
                      <th className="px-3 py-3 font-semibold">Authorized</th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {isLoadingScanners ? (
                      <tr>
                        <td colSpan={5}>
                          <TableMessage
                            icon={Loader2}
                            title="Loading authorized staff..."
                            iconClassName="animate-spin text-cyan-600"
                          />
                        </td>
                      </tr>
                    ) : scannersError ? (
                      <tr>
                        <td colSpan={5}>
                          <TableMessage
                            icon={AlertCircle}
                            title="Could not load authorized staff"
                            description={scannersError}
                            iconClassName="text-rose-500"
                            action={
                              <button
                                type="button"
                                onClick={loadScanners}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                <RefreshCw size={14} />
                                Try again
                              </button>
                            }
                          />
                        </td>
                      </tr>
                    ) : filteredScanners.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <TableMessage
                            icon={UserRoundCheck}
                            title={
                              authorizedScanners.length === 0
                                ? "No authorized staff yet"
                                : "No authorized staff found"
                            }
                            description={
                              authorizedScanners.length === 0
                                ? "Add a trusted staff member to help with arrival scanning."
                                : "Try another search term."
                            }
                            action={
                              authorizedScanners.length === 0 ? (
                                <button
                                  type="button"
                                  onClick={openAuthorizeStaff}
                                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#071A52] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#123A8F]"
                                >
                                  <UserPlus size={15} />
                                  Add authorized staff
                                </button>
                              ) : null
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredScanners.map((person) => (
                        <tr
                          key={person.id}
                          className="hover:bg-slate-50/70"
                        >
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
                                <p className="mt-0.5 text-xs text-slate-400">
                                  {person.accountStatus === "ACTIVE"
                                    ? "Staff account active"
                                    : `Account ${(
                                        person.accountStatus || "inactive"
                                      ).toLowerCase()}`}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-4 text-sm text-slate-600">
                            {person.loginId || "—"}
                          </td>

                          <td className="px-3 py-4 text-sm text-slate-600">
                            {formatRole(person.role)}
                          </td>

                          <td className="px-3 py-4">
                            <div className="flex flex-col gap-1">
                              <StatusBadge active activeText="Authorized" />
                              <span className="text-[11px] text-slate-400">
                                Since {formatDate(person.createdAt)}
                              </span>
                            </div>
                          </td>

                          <td className="px-3 py-4">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  openPersonAction(person, "revoke-staff")
                                }
                                className="rounded-lg border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                              >
                                Revoke access
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400">
          ScholaNode · Gate Access Management
        </p>
      </div>

      {/* Row actions menu */}
      {actionsMenu && (
        <div
          role="menu"
          aria-label={`Actions for ${fullName(actionsMenu.person)}`}
          style={{ top: actionsMenu.top, right: actionsMenu.right }}
          onPointerDown={(event) => event.stopPropagation()}
          className="fixed z-[60] w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-slate-900/10"
        >
          <ActionMenuItem
            icon={Eye}
            onClick={() =>
              openPersonAction(actionsMenu.person, "view-security")
            }
          >
            View staff
          </ActionMenuItem>
          <ActionMenuItem
            icon={Pencil}
            onClick={() =>
              openPersonAction(actionsMenu.person, "edit-security")
            }
          >
            Edit staff
          </ActionMenuItem>
          <ActionMenuItem
            icon={KeyRound}
            onClick={() =>
              openPersonAction(actionsMenu.person, "reset-security-password")
            }
          >
            Reset password
          </ActionMenuItem>
          <ActionMenuItem
            icon={UserRoundX}
            danger
            onClick={() =>
              openPersonAction(actionsMenu.person, "toggle-security")
            }
          >
            {isSecurityActive(actionsMenu.person)
              ? "Deactivate account"
              : "Reactivate account"}
          </ActionMenuItem>
        </div>
      )}

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
              <ShieldCheck size={19} className="mt-0.5 shrink-0 text-blue-800" />
              <p className="text-xs leading-5 text-slate-600">
                A restricted gate-security account will be created. The system
                will send the generated login credentials directly to the
                personnel's email.
              </p>
            </div>

            <ErrorNotice
              message={securityModalError}
              onDismiss={() => setSecurityModalError(null)}
            />

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
          description="Select an active STAFF member to grant gate scanning permission."
          onClose={() => {
            if (!isGranting) {
              setModal(null);
              setSelectedStaffId("");
              setActionError(null);
            }
          }}
        >
          <form onSubmit={grantStaffPermission} className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50 p-3">
              <UserRoundCheck
                size={19}
                className="mt-0.5 shrink-0 text-cyan-800"
              />
              <p className="text-xs leading-5 text-slate-600">
                Scanning permission lets this staff member verify student
                arrivals at the gate. Their normal school account stays
                unchanged.
              </p>
            </div>

            <ErrorNotice
              message={actionError}
              onDismiss={() => setActionError(null)}
            />

            {!isLoadingStaffOptions && !staffOptionsError && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                <Search size={17} className="shrink-0 text-slate-400" />
                <input
                  value={staffModalSearch}
                  onChange={(event) => setStaffModalSearch(event.target.value)}
                  placeholder="Search staff by name or login ID..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            )}

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {isLoadingStaffOptions ? (
                <div className="rounded-xl border border-slate-200 px-4 py-10 text-center">
                  <Loader2
                    size={26}
                    className="mx-auto animate-spin text-cyan-600"
                  />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Loading staff...
                  </p>
                </div>
              ) : staffOptionsError ? (
                <div className="rounded-xl border border-slate-200 px-4 py-8 text-center">
                  <AlertCircle
                    size={26}
                    className="mx-auto text-rose-500"
                  />
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    {staffOptionsError}
                  </p>
                  <button
                    type="button"
                    onClick={loadStaffOptions}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <RefreshCw size={14} />
                    Try again
                  </button>
                </div>
              ) : filteredStaffOptions.length === 0 ? (
                <div className="rounded-xl border border-slate-200 px-4 py-8 text-center">
                  <Users size={26} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    {staffOptions.length === 0
                      ? "No eligible STAFF members available"
                      : "No staff match your search"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {staffOptions.length === 0
                      ? "Every active STAFF member may already have scanning access."
                      : "Try a different name or login ID."}
                  </p>
                </div>
              ) : (
                filteredStaffOptions.map((person) => {
                  const selected = selectedStaffId === person.id;

                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => {
                        setSelectedStaffId(person.id);
                        if (actionError) setActionError(null);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                        selected
                          ? "border-cyan-400 bg-cyan-50/70 ring-2 ring-cyan-500/20"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Avatar
                        firstName={person.firstName}
                        surName={person.surName}
                        color="cyan"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {fullName(person)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {person.loginId || "No login ID"} ·{" "}
                          {formatRole(person.role)}
                        </p>
                      </div>

                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-cyan-500 bg-cyan-500 text-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                      >
                        <Check size={13} />
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isGranting}
                onClick={() => {
                  setModal(null);
                  setSelectedStaffId("");
                  setActionError(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <PrimaryButton
                type="submit"
                disabled={
                  !selectedStaffId || isGranting || isLoadingStaffOptions
                }
              >
                {isGranting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Granting access...
                  </>
                ) : (
                  <>
                    <UserRoundCheck size={17} />
                    Grant permission
                  </>
                )}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* View security */}
      {modal === "view-security" && selectedPerson && (
        <Modal
          title="Gate security details"
          description={fullName(selectedPerson)}
          onClose={closePersonModal}
        >
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Login ID
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {selectedPerson.loginId || "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Email
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {selectedPerson.email || "—"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {getSecurityStatusText(selectedPerson)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Added
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDate(selectedPerson.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={closePersonModal}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Edit security */}
      {modal === "edit-security" && selectedPerson && (
        <Modal
          title="Edit gate security"
          description={fullName(selectedPerson)}
          onClose={() => {
            if (!isSubmittingAction) closePersonModal();
          }}
        >
          <div className="space-y-4">
            <ErrorNotice
              message={actionError}
              onDismiss={() => setActionError(null)}
            />

            <Field label="First name">
              <input
                value={selectedPerson.firstName || ""}
                onChange={(event) => {
                  if (actionError) setActionError(null);
                  setSelectedPerson((previous) => ({
                    ...previous,
                    firstName: event.target.value,
                  }));
                }}
                className={inputClass}
              />
            </Field>

            <Field label="Surname">
              <input
                value={selectedPerson.surName || ""}
                onChange={(event) => {
                  if (actionError) setActionError(null);
                  setSelectedPerson((previous) => ({
                    ...previous,
                    surName: event.target.value,
                  }));
                }}
                className={inputClass}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={selectedPerson.email || ""}
                onChange={(event) => {
                  if (actionError) setActionError(null);
                  setSelectedPerson((previous) => ({
                    ...previous,
                    email: event.target.value,
                  }));
                }}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmittingAction}
              onClick={closePersonModal}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmittingAction}
              onClick={saveSecurityDetails}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
            >
              {isSubmittingAction ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Saving changes...
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* Reset security password */}
      {modal === "reset-security-password" && selectedPerson && (
        <Modal
          title="Reset security password"
          description={fullName(selectedPerson)}
          onClose={() => {
            if (!isSubmittingAction) closePersonModal();
          }}
        >
          <div className="space-y-4">
            <ErrorNotice
              message={actionError}
              onDismiss={() => setActionError(null)}
            />

            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-slate-700">
              A password recovery email will be sent to{" "}
              <span className="font-semibold">
                {selectedPerson.email || "this account"}
              </span>
              . The officer can follow the instructions to set a new password.
            </div>

            {!selectedPerson.email && (
              <p className="text-xs leading-5 text-slate-500">
                This account has no email address. Add one with Edit staff
                before requesting a reset.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmittingAction}
              onClick={closePersonModal}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmittingAction || !selectedPerson.email}
              onClick={resetSecurityPassword}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmittingAction ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Sending email...
                </>
              ) : (
                <>
                  <KeyRound size={17} />
                  Send recovery email
                </>
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* Activate / deactivate security */}
      {modal === "toggle-security" && selectedPerson && (
        <Modal
          title={
            isSecurityActive(selectedPerson)
              ? "Deactivate security account?"
              : "Reactivate security account?"
          }
          description={fullName(selectedPerson)}
          onClose={() => {
            if (!isSubmittingAction) closePersonModal();
          }}
        >
          <div className="space-y-4">
            <ErrorNotice
              message={actionError}
              onDismiss={() => setActionError(null)}
            />

            <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
              <ShieldAlert
                size={21}
                className="mt-0.5 shrink-0 text-amber-700"
              />
              <p className="text-sm leading-6 text-slate-700">
                {isSecurityActive(selectedPerson)
                  ? "This account will be marked inactive and blocked from scanning students at the gate."
                  : "This account will be marked active again and can resume scanning students."}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmittingAction}
              onClick={closePersonModal}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmittingAction}
              onClick={toggleSecurity}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
                isSecurityActive(selectedPerson)
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-700 hover:bg-emerald-800"
              }`}
            >
              {isSubmittingAction ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Updating account...
                </>
              ) : isSecurityActive(selectedPerson) ? (
                <>
                  <UserRoundX size={17} />
                  Deactivate account
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} />
                  Reactivate account
                </>
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* Revoke staff access */}
      {modal === "revoke-staff" && selectedPerson && (
        <Modal
          title="Revoke scanning permission?"
          description={fullName(selectedPerson)}
          onClose={() => {
            if (!isSubmittingAction) closePersonModal();
          }}
        >
          <div className="space-y-4">
            <ErrorNotice
              message={actionError}
              onDismiss={() => setActionError(null)}
            />

            <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
              <ShieldAlert
                size={21}
                className="mt-0.5 shrink-0 text-amber-700"
              />
              <p className="text-sm leading-6 text-slate-700">
                This staff member will lose scanning permission. Their normal
                staff account and past scan records remain unchanged. You can
                authorize them again later.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmittingAction}
              onClick={closePersonModal}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmittingAction}
              onClick={revokeStaffPermission}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {isSubmittingAction ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Revoking access...
                </>
              ) : (
                <>
                  <UserRoundX size={17} />
                  Revoke access
                </>
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GateAccess;
