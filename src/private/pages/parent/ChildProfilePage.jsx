import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellOff,
  BellRing,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  Hash,
  Info,
  KeyRound,
  Mail,
  MailCheck,
  Pencil,
  UserRound,
  Users,
  X,
} from "lucide-react";
import ChildPageLayout from "./ChildPageLayout";
import ChildStatusBadge from "./ChildStatusBadge";
import {
  requestChildEmailChange,
  verifyChildEmailChange,
} from "../people/parentApi";
import {
  getClassName,
  getDisplayName,
  getInitials,
  getRelationshipLabel,
  titleCase,
} from "./childDisplay";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

function DetailField({ label, value, mono = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 truncate text-sm font-semibold text-slate-700 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || "Not provided"}
      </p>
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function ChildEmailCard({ childId, email, onEmailChange }) {
  const [step, setStep] = useState("idle");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function resetForm() {
    setNewEmail("");
    setCurrentPassword("");
    setShowPassword(false);
    setVerificationCode("");
    setPendingEmail("");
    setError("");
  }

  function startEditing() {
    resetForm();
    setNotice("");
    setStep("form");
  }

  function cancelEditing() {
    resetForm();
    setStep("idle");
  }

  function backToForm() {
    setVerificationCode("");
    setError("");
    setStep("form");
  }

  async function handleRequest(event) {
    event.preventDefault();

    const nextEmail = newEmail.trim().toLowerCase();

    if (!nextEmail) {
      setError("Enter your child's email address.");
      return;
    }

    if (!EMAIL_PATTERN.test(nextEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (nextEmail === String(email || "").trim().toLowerCase()) {
      setError("Enter an email address different from the current one.");
      return;
    }

    if (!currentPassword.trim()) {
      setError("Enter your current password to confirm this request.");
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const response = await requestChildEmailChange(childId, {
        newEmail: nextEmail,
        currentPassword,
      });

      setPendingEmail(nextEmail);
      setCurrentPassword("");
      setShowPassword(false);
      setVerificationCode("");
      setStep("code");
      setNotice(
        response?.message ||
          "A verification code has been sent to the new email address."
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "We could not start the email change. Check your password and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(event) {
    event.preventDefault();

    const code = verificationCode.trim();

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code sent to the new email address.");
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const response = await verifyChildEmailChange(childId, {
        newEmail: pendingEmail,
        code,
      });

      const savedEmail = response?.data?.email || pendingEmail;

      onEmailChange(savedEmail);
      resetForm();
      setStep("idle");
      setNotice(
        response?.message ||
          "Your child's email address has been updated successfully."
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "That code could not be verified. Check the code and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
          <Mail size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-extrabold text-[#071A52]">
            Email address
          </h2>
          <p className="mt-0.5 text-[13px] text-slate-500">
            The school uses this address for your child&apos;s records and
            communication.
          </p>
        </div>
      </div>

      {step === "idle" ? (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                {email ? "Current email" : "Email"}
              </p>
              <p
                className={`mt-1 truncate text-sm font-semibold ${
                  email ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {email || "Not provided"}
              </p>
            </div>

            <button
              type="button"
              onClick={startEditing}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-bold text-[#123A8F] transition hover:border-blue-300 hover:bg-blue-50"
            >
              <Pencil size={14} />
              {email ? "Edit email" : "Add email"}
            </button>
          </div>

          {notice && (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13px] font-medium text-emerald-800">
              <Check size={15} className="mt-0.5 shrink-0" />
              {notice}
            </p>
          )}
        </>
      ) : (
        <form
          onSubmit={step === "code" ? handleVerify : handleRequest}
          className="mt-4 space-y-3 border-t border-slate-100 pt-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">
              {step === "code"
                ? "Verify the new email"
                : "Change your child's email"}
            </h3>

            <button
              type="button"
              onClick={cancelEditing}
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cancel email change"
            >
              <X size={18} />
            </button>
          </div>

          {step === "form" ? (
            <>
              <div>
                <label
                  htmlFor="child-new-email"
                  className="mb-1.5 block text-[13px] font-semibold text-slate-600"
                >
                  New email address
                </label>
                <input
                  id="child-new-email"
                  type="email"
                  value={newEmail}
                  onChange={(event) => {
                    setNewEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="student@example.com"
                  className={inputClass}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="child-email-password"
                  className="mb-1.5 block text-[13px] font-semibold text-slate-600"
                >
                  Your current password
                </label>

                <div className="relative">
                  <input
                    id="child-email-password"
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(event) => {
                      setCurrentPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your current password"
                    className={`${inputClass} pr-12`}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3.5 text-slate-400 transition hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] font-medium text-rose-700">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={submitting}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0A2463] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <KeyRound size={16} />
                  {submitting ? "Sending code..." : "Send verification code"}
                </button>
              </div>

              <p className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-3 text-[13px] leading-5 text-blue-900">
                <Info size={15} className="mt-0.5 shrink-0" />
                We will send a 6-digit code to the new address. Your child&apos;s
                current email stays active until the new one is verified.
              </p>
            </>
          ) : (
            <>
              {notice && (
                <p className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13px] font-medium text-emerald-800">
                  <Check size={15} className="mt-0.5 shrink-0" />
                  {notice}
                </p>
              )}

              <p className="rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-3 text-[13px] leading-5 text-blue-900">
                Enter the 6-digit code sent to{" "}
                <span className="font-bold">{pendingEmail}</span>. The current
                email stays active until this code is verified.
              </p>

              <div>
                <label
                  htmlFor="child-email-code"
                  className="mb-1.5 block text-[13px] font-semibold text-slate-600"
                >
                  Verification code
                </label>
                <input
                  id="child-email-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(event) => {
                    setVerificationCode(event.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  placeholder="000000"
                  className={`${inputClass} text-center text-lg font-bold tracking-[0.4em]`}
                />
              </div>

              {error && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] font-medium text-rose-700">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={backToForm}
                  disabled={submitting}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Use a different email
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0A2463] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MailCheck size={16} />
                  {submitting ? "Verifying..." : "Verify and update email"}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </section>
  );
}

function ChildProfileBody({ child }) {
  const [email, setEmail] = useState(child.email || "");

  const fields = [
    {
      key: "firstName",
      label: "First name",
      value: titleCase(child.firstName),
    },
    {
      key: "surName",
      label: "Surname",
      value: titleCase(child.surName),
    },
    {
      key: "className",
      label: "Class",
      value: getClassName(child),
    },
    {
      key: "admissionNumber",
      label: "Admission number",
      value: child.admissionNumber || "",
      mono: true,
    },
    {
      key: "relationship",
      label: "Linked to you as",
      value: getRelationshipLabel(child.relationship),
    },
    {
      key: "alerts",
      label: "School alerts",
      value: child.receivesNotifications === false ? "Disabled" : "Enabled",
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[30px] border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-cyan-400/[0.08] blur-2xl" />

        <div className="relative flex flex-wrap items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-black shadow-inner">
            {getInitials(child)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
              Student profile
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
              <h1 className="truncate text-2xl font-black sm:text-3xl">
                {getDisplayName(child)}
              </h1>
              <ChildStatusBadge status={child.admissionStatus} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-blue-100">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                <GraduationCap size={14} />
                {getClassName(child)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-mono">
                <Hash size={13} />
                {child.admissionNumber || "—"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                <Users size={14} />
                Linked as {getRelationshipLabel(child.relationship)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <UserRound size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#071A52]">
                  Student details
                </h2>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  Information shared by the school for this student.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {fields.map((field) => (
                <DetailField
                  key={field.key}
                  label={field.label}
                  value={field.value}
                  mono={field.mono}
                />
              ))}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-3">
              <Info size={16} className="mt-0.5 shrink-0 text-blue-700" />
              <p className="text-[13px] leading-5 text-blue-900">
                Student records are managed by the school. Contact the school
                office if any of these details need to be corrected.
              </p>
            </div>
          </section>

          <ChildEmailCard
            childId={child.id}
            email={email}
            onEmailChange={setEmail}
          />
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-[#071A52]">
              Student summary
            </h3>

            <div className="mt-3 space-y-2">
              <InfoChip
                icon={GraduationCap}
                label="Class"
                value={getClassName(child)}
              />
              <InfoChip
                icon={Hash}
                label="Admission number"
                value={child.admissionNumber}
              />
              <InfoChip
                icon={Mail}
                label="Email"
                value={email}
              />
              <InfoChip
                icon={Users}
                label="Linked to you as"
                value={getRelationshipLabel(child.relationship)}
              />
              <InfoChip
                icon={child.receivesNotifications ? BellRing : BellOff}
                label="School alerts"
                value={
                  child.receivesNotifications === false ? "Disabled" : "Enabled"
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-[#071A52]">
              Parent access
            </h3>
            <p className="mt-2 text-[13px] leading-5 text-slate-500">
              You can update your child&apos;s email address. Other student
              records are managed by the school, and results appear here once
              they are published.
            </p>

            <Link
              to={`/children/${child.id}/results`}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-bold text-[#123A8F] transition hover:border-blue-300 hover:bg-blue-50"
            >
              View term results
              <ArrowRight size={15} />
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}

export default function ChildProfilePage() {
  return (
    <ChildPageLayout section="profile" title="Profile" hideIdentity>
      {({ child }) => <ChildProfileBody key={child.id} child={child} />}
    </ChildPageLayout>
  );
}
