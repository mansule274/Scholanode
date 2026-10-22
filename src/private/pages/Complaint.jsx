
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  MessageSquareText,
  Plus,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useUserContext } from "../../context/UserContext";

const CATEGORIES = [
  "Academic",
  "Attendance",
  "Teacher or Staff",
  "School Facilities",
  "Fees and Payments",
  "Security and Safety",
  "Bullying or Harassment",
  "Other",
];

const STATUS_STYLES = {
  SUBMITTED: {
    label: "Submitted",
    className: "bg-blue-50 text-blue-700 ring-blue-100",
    icon: Clock3,
  },
  IN_REVIEW: {
    label: "Under review",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
    icon: AlertCircle,
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    icon: CheckCircle2,
  },
  DISMISSED: {
    label: "Closed",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
    icon: XCircle,
  },
};

const MOCK_COMPLAINTS = [
  {
    id: "CMP-2026-001",
    category: "Academic",
    subject: "Correction of a test score",
    description:
      "I believe my score for the recent class test may have been recorded incorrectly. Please help review it.",
    status: "IN_REVIEW",
    createdAt: "2026-10-18T09:30:00.000Z",
    response: "",
  },
  {
    id: "CMP-2026-002",
    category: "School Facilities",
    subject: "Classroom fan not working",
    description:
      "The fan in our classroom has not been working properly. Please look into the issue.",
    status: "RESOLVED",
    createdAt: "2026-10-12T11:00:00.000Z",
    response:
      "Thank you for reporting this. The maintenance team has attended to the issue.",
  },
];

const getStorageKey = (user) => {
  const schoolId = user?.schoolId || "demo-school";
  const userId =
    user?.id ||
    user?.userId ||
    user?.admissionNumber ||
    user?.loginId ||
    "demo-user";

  return `scholanode:complaints:${schoolId}:${userId}`;
};

const readComplaints = (key) => {
  try {
    const saved = localStorage.getItem(key);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }

    // Seed demo records for a first-time local preview.
    return MOCK_COMPLAINTS;
  } catch {
    return MOCK_COMPLAINTS;
  }
};

const makeReference = () => {
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CMP-${Date.now().toString().slice(-6)}-${randomPart}`;
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function Complaint() {
  const { user } = useUserContext();

  const storageKey = getStorageKey(user);

  const [activeTab, setActiveTab] = useState("submit");
  const [complaints, setComplaints] = useState(() =>
    readComplaints(storageKey)
  );

  const [form, setForm] = useState({
    category: "",
    subject: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [historyFilter, setHistoryFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setComplaints(readComplaints(storageKey));
  }, [storageKey]);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const saveComplaints = (updatedComplaints) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedComplaints));
      setComplaints(updatedComplaints);
      return true;
    } catch {
      setErrorMessage(
        "Your complaint could not be saved on this device. Please check your browser storage and try again."
      );
      return false;
    }
  };

  const filteredComplaints = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return [...complaints]
      .filter((complaint) => {
        const matchesStatus =
          historyFilter === "ALL" || complaint.status === historyFilter;

        const matchesSearch =
          !query ||
          complaint.subject?.toLowerCase().includes(query) ||
          complaint.category?.toLowerCase().includes(query) ||
          complaint.id?.toLowerCase().includes(query);

        return matchesStatus && matchesSearch;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [complaints, historyFilter, searchTerm]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (
      !form.category ||
      !form.subject.trim() ||
      !form.description.trim()
    ) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);

    // Simulated delay for frontend testing. Replace with an API request later.
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newComplaint = {
      id: makeReference(),
      category: form.category,
      subject: form.subject.trim(),
      description: form.description.trim(),
      status: "SUBMITTED",
      createdAt: new Date().toISOString(),
      response: "",
    };

    const updatedComplaints = [newComplaint, ...complaints];
    const saved = saveComplaints(updatedComplaints);

    if (saved) {
      setForm({
        category: "",
        subject: "",
        description: "",
      });

      setSuccessMessage(
        `Your complaint has been submitted successfully. Reference: ${newComplaint.id}`
      );
    }

    setIsSubmitting(false);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrorMessage("");
    setSuccessMessage("");
    setSelectedComplaint(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] px-6 py-8 text-white shadow-lg sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[35px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-cyan-400/10 blur-2xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-cyan-100">
              <MessageSquareText size={16} />
              Student Support
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Your concerns matter.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
              Have an issue or something you would like the school to address?
              Submit a complaint and keep track of its progress in one place.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-blue-100">
              <span className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-cyan-300" />
                Your report is recorded
              </span>
              <span className="flex items-center gap-2">
                <History size={17} className="text-cyan-300" />
                Track your complaint
              </span>
            </div>
          </div>
        </section>

        {/* Temporary success message */}
        {successMessage && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
          >
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
              <CheckCircle2 size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-emerald-900">
                Complaint submitted
              </h2>
              <p className="mt-1 break-words text-sm leading-6 text-emerald-800">
                {successMessage}
              </p>
              <button
                type="button"
                onClick={() => switchTab("history")}
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-900 hover:underline"
              >
                View complaint history <ArrowRight size={15} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss success message"
              className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => switchTab("submit")}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                activeTab === "submit"
                  ? "bg-[#0A2463] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#0A2463]"
              }`}
            >
              <Plus size={18} />
              Submit Complaint
            </button>

            <button
              type="button"
              onClick={() => switchTab("history")}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                activeTab === "history"
                  ? "bg-[#0A2463] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#0A2463]"
              }`}
            >
              <History size={18} />
              Complaint History
              {complaints.length > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === "history"
                      ? "bg-white/15 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {complaints.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Submit tab */}
        {activeTab === "submit" && (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
              <h2 className="text-lg font-bold text-slate-900">
                Tell us what happened
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Provide enough detail to help the appropriate school staff
                understand your concern.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-8">
              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Complaint category <span className="text-red-500">*</span>
                </label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject <span className="text-red-500">*</span>
                </label>

                <input
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  maxLength={120}
                  placeholder="Briefly describe your concern"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />

                <p className="mt-1.5 text-right text-xs text-slate-400">
                  {form.subject.length}/120
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description <span className="text-red-500">*</span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={6}
                  placeholder="Explain the issue, including any details that may help the school address it..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />

                <p className="mt-1.5 text-right text-xs text-slate-400">
                  {form.description.length}/3000
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-[#0A2463]"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Please provide accurate information
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Complaints should be respectful and factual. Sensitive
                    concerns should be handled by an appropriate, authorized
                    member of school staff.
                  </p>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2463] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Submit Complaint
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* History tab */}
        {activeTab === "history" && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Your complaints
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review your reports and check for school responses.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => switchTab("submit")}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0A2463] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123A8F]"
                >
                  <Plus size={17} />
                  New complaint
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_190px]">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by subject or reference..."
                  aria-label="Search complaint history"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />

                <select
                  value={historyFilter}
                  onChange={(event) => setHistoryFilter(event.target.value)}
                  aria-label="Filter complaints by status"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="IN_REVIEW">Under review</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="DISMISSED">Closed</option>
                </select>
              </div>
            </div>

            {filteredComplaints.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <FileText size={26} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  {complaints.length === 0
                    ? "No complaints yet"
                    : "No matching complaints"}
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {complaints.length === 0
                    ? "When you submit a complaint, you will be able to track its progress here."
                    : "Try another search term or select a different status."}
                </p>

                {complaints.length === 0 && (
                  <button
                    type="button"
                    onClick={() => switchTab("submit")}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0A2463] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#123A8F]"
                  >
                    <Plus size={17} />
                    Submit your first complaint
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredComplaints.map((complaint) => {
                  const status =
                    STATUS_STYLES[complaint.status] ||
                    STATUS_STYLES.SUBMITTED;
                  const StatusIcon = status.icon;

                  return (
                    <button
                      type="button"
                      key={complaint.id}
                      onClick={() => setSelectedComplaint(complaint)}
                      className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-cyan-200 hover:shadow-md sm:p-6"
                    >
                      <div className="flex items-start gap-3">
                        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0A2463] sm:flex">
                          <MessageSquareText size={21} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {complaint.category}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}
                            >
                              <StatusIcon size={13} />
                              {status.label}
                            </span>
                          </div>

                          <h3 className="mt-3 font-semibold text-slate-900 transition group-hover:text-[#123A8F]">
                            {complaint.subject}
                          </h3>

                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                            {complaint.description}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
                            <span>
                              Ref: {complaint.id} ·{" "}
                              {formatDate(complaint.createdAt)}
                            </span>

                            <span className="inline-flex items-center gap-1 font-semibold text-[#0A2463]">
                              View details
                              <ArrowRight
                                size={14}
                                className="transition group-hover:translate-x-0.5"
                              />
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Complaint details modal */}
        {selectedComplaint && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
            onClick={() => setSelectedComplaint(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="complaint-details-title"
              className="my-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 bg-[#071A52] p-5 text-white sm:p-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-cyan-200">
                    Complaint details
                  </p>
                  <h2
                    id="complaint-details-title"
                    className="mt-2 text-xl font-bold"
                  >
                    {selectedComplaint.subject}
                  </h2>
                  <p className="mt-2 break-all text-xs text-blue-200">
                    Reference: {selectedComplaint.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  aria-label="Close complaint details"
                  className="rounded-xl p-2 text-blue-100 transition hover:bg-white/10 hover:text-white"
                >
                  <XCircle size={21} />
                </button>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                    {selectedComplaint.category}
                  </span>

                  {(() => {
                    const status =
                      STATUS_STYLES[selectedComplaint.status] ||
                      STATUS_STYLES.SUBMITTED;
                    const StatusIcon = status.icon;

                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${status.className}`}
                      >
                        <StatusIcon size={14} />
                        {status.label}
                      </span>
                    );
                  })()}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Date submitted
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(selectedComplaint.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Your description
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                    {selectedComplaint.description}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquareText
                      size={18}
                      className="text-[#0A2463]"
                    />
                    <h3 className="text-sm font-semibold text-slate-900">
                      School response
                    </h3>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedComplaint.response ||
                      "No response has been added yet. Please check back later."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Close details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
