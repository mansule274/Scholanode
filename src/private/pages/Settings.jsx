
import React, { useState } from "react";
import {
  Settings2,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
  LockKeyhole,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Clock3,
  BadgeCheck,
} from "lucide-react";

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
  autoComplete,
}) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {visible ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

const Settings = () => {
  const [activeSection, setActiveSection] = useState("security");

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [visibility, setVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [message, setMessage] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage(null);
  };

  const toggleVisibility = (field) => {
    setVisibility((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage(null);

    if (
      !form.currentPassword ||
      !form.newPassword ||
      !form.confirmPassword
    ) {
      setMessage({
        type: "error",
        text: "Please fill in all password fields.",
      });
      return;
    }

    if (form.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Your new password must contain at least 8 characters.",
      });
      return;
    }

    if (form.newPassword === form.currentPassword) {
      setMessage({
        type: "error",
        text: "Your new password must differ from your current password.",
      });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage({
        type: "error",
        text: "Your new password and confirmation do not match.",
      });
      return;
    }

    // MOCK ONLY: no API request and no password change.
    setMessage({
      type: "success",
      text: "Demo validation passed. No password was changed or sent anywhere.",
    });
  };

  const handleReset = () => {
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setVisibility({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });

    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[30px] border border-slate-200 bg-gradient-to-r from-[#071A52] via-[#0A2463] to-[#123A8F] p-5 text-white shadow-[0_20px_45px_rgba(7,26,82,0.18)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                <Settings2 size={14} />
                Account management
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/90">
                Manage your access, password, and secure preferences from one beautiful control center.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-100">
              <Info size={15} />
              Demo mode
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Security</span>
              <ShieldCheck className="text-emerald-600" size={18} />
            </div>
            <p className="mt-4 text-2xl font-extrabold text-slate-900">Strong</p>
            <p className="mt-1 text-sm text-slate-500">Password protection status</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Session</span>
              <Clock3 className="text-blue-600" size={18} />
            </div>
            <p className="mt-4 text-2xl font-extrabold text-slate-900">Active</p>
            <p className="mt-1 text-sm text-slate-500">Your account is currently signed in</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Access</span>
              <BadgeCheck className="text-violet-600" size={18} />
            </div>
            <p className="mt-4 text-2xl font-extrabold text-slate-900">Verified</p>
            <p className="mt-1 text-sm text-slate-500">Your account verification is ready</p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Account settings
            </p>

            <button
              type="button"
              onClick={() => setActiveSection("security")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                activeSection === "security"
                  ? "bg-[#071A52] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <ShieldCheck size={19} />
              <span className="flex-1">
                <span className="block text-sm font-semibold">
                  Security
                </span>
                <span
                  className={`mt-0.5 block text-xs ${
                    activeSection === "security"
                      ? "text-blue-100"
                      : "text-slate-400"
                  }`}
                >
                  Password and protection
                </span>
              </span>
              <ChevronRight size={16} />
            </button>

            <div className="mt-3 rounded-xl bg-slate-50 p-3">
              <div className="flex items-start gap-2">
                <LockKeyhole
                  size={16}
                  className="mt-0.5 shrink-0 text-cyan-700"
                />
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Keep your account secure
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Use a strong password that you do not reuse elsewhere.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            {activeSection === "security" && (
              <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#071A52] to-[#123A8F] text-white shadow-sm">
                      <KeyRound size={23} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-[#071A52]">
                        Change password
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Update your password to keep your ScholaNode account protected.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-5 sm:p-8">
                  {/* Demo notice */}
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
                    <Info
                      size={18}
                      className="mt-0.5 shrink-0 text-cyan-700"
                    />
                    <p className="text-xs leading-5 text-slate-600">
                      This is a frontend demonstration. Password
                      validation runs locally in your browser. Nothing
                      is sent to a server, and your password is not
                      actually changed.
                    </p>
                  </div>

                  <div className="max-w-2xl space-y-5">
                    <PasswordField
                      label="Current password"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      visible={visibility.currentPassword}
                      onToggle={() =>
                        toggleVisibility("currentPassword")
                      }
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                    />

                    <div className="border-t border-slate-100" />

                    <PasswordField
                      label="New password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      visible={visibility.newPassword}
                      onToggle={() =>
                        toggleVisibility("newPassword")
                      }
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                    />

                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="mb-2 text-xs font-semibold text-slate-600">
                        Password checklist
                      </p>

                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-xs text-slate-500">
                          <CheckCircle2
                            size={15}
                            className={
                              form.newPassword.length >= 8
                                ? "text-emerald-600"
                                : "text-slate-300"
                            }
                          />
                          At least 8 characters
                        </p>

                        <p className="flex items-center gap-2 text-xs text-slate-500">
                          <CheckCircle2
                            size={15}
                            className={
                              form.newPassword.length > 0 &&
                              form.newPassword !== form.currentPassword
                                ? "text-emerald-600"
                                : "text-slate-300"
                            }
                          />
                          Different from your current password
                        </p>
                      </div>
                    </div>

                    <PasswordField
                      label="Confirm new password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      visible={visibility.confirmPassword}
                      onToggle={() =>
                        toggleVisibility("confirmPassword")
                      }
                      placeholder="Enter your new password again"
                      autoComplete="new-password"
                    />

                    {form.confirmPassword.length > 0 && (
                      <p
                        className={`text-xs font-medium ${
                          form.newPassword === form.confirmPassword
                            ? "text-emerald-700"
                            : "text-rose-600"
                        }`}
                      >
                        {form.newPassword === form.confirmPassword
                          ? "Passwords match."
                          : "Passwords do not match yet."}
                      </p>
                    )}
                  </div>

                  {/* Feedback */}
                  {message && (
                    <div
                      role="status"
                      aria-live="polite"
                      className={`mt-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
                        message.type === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-rose-200 bg-rose-50 text-rose-800"
                      }`}
                    >
                      {message.type === "success" ? (
                        <CheckCircle2
                          size={19}
                          className="mt-0.5 shrink-0"
                        />
                      ) : (
                        <Info size={19} className="mt-0.5 shrink-0" />
                      )}
                      <p>{message.text}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <RotateCcw size={16} />
                      Clear fields
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#071A52] to-[#123A8F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-blue-200"
                    >
                      <ShieldCheck size={17} />
                      Validate demo form
                    </button>
                  </div>
                </form>
              </section>
            )}
          </main>
        </div>

        <p className="text-center text-xs text-slate-400">
          ScholaNode · Account settings
        </p>
      </div>
    </div>
  );
};

export default Settings;
