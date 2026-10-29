import { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Loader2,
  LockKeyhole,
  RotateCcw,
  Settings2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { changePassword } from './settingsApi';

const EMPTY_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const EMPTY_VISIBILITY = {
  currentPassword: false,
  newPassword: false,
  confirmPassword: false,
};

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100';

const labelClass = 'mb-1.5 block text-[13px] font-semibold text-slate-700';

function PasswordField({
  label,
  name,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
  autoComplete,
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={inputClass}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

function Requirement({ met, children }) {
  return (
    <p className={`flex items-center gap-2 text-[13px] ${met ? 'text-emerald-700' : 'text-slate-500'}`}>
      <CheckCircle2 size={15} className={met ? 'text-emerald-600' : 'text-slate-300'} />
      {children}
    </p>
  );
}

export default function Settings() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [visibility, setVisibility] = useState(EMPTY_VISIBILITY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setError('');
    setNotice('');
  }

  function toggleVisibility(field) {
    setVisibility((current) => ({ ...current, [field]: !current[field] }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setVisibility(EMPTY_VISIBILITY);
    setError('');
    setNotice('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const currentPassword = form.currentPassword;
    const newPassword = form.newPassword;

    if (!currentPassword) {
      setError('Current password is required.');
      return;
    }

    if (!newPassword) {
      setError('New password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    if (!form.confirmPassword) {
      setError('Please confirm your new password.');
      return;
    }

    if (newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');
    setNotice('');

    try {
      const response = await changePassword({ currentPassword, newPassword });

      setForm(EMPTY_FORM);
      setVisibility(EMPTY_VISIBILITY);
      setNotice(response?.message || 'Password updated successfully.');
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'We could not update your password. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const newPasswordValid =
    form.newPassword.length >= 8 && form.newPassword !== form.currentPassword;
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.newPassword === form.confirmPassword;

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-slate-500">
        <span>Account</span>
        <ChevronRight size={14} />
        <span className="font-semibold text-[#071A52]">Settings</span>
      </nav>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[30px] border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-cyan-400/[0.08] blur-2xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <Settings2 size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                Account security
              </p>
              <h1 className="mt-1.5 text-2xl font-black sm:text-3xl">Settings</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                Manage the password you use to sign in to ScholaNode.
              </p>
            </div>
          </div>
        </div>
      </section>

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <span className="flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            {notice}
          </span>
          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Dismiss message"
            className="cursor-pointer rounded-lg p-1 transition hover:bg-emerald-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#071A52] to-[#123A8F] text-white">
              <KeyRound size={21} />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-[#071A52]">Change password</h2>
              <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
                Enter your current password, then choose a new one.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6">
            <div className="space-y-5">
              <PasswordField
                label="Current password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                visible={visibility.currentPassword}
                onToggle={() => toggleVisibility('currentPassword')}
                placeholder="Enter your current password"
                autoComplete="current-password"
              />

              <div className="border-t border-slate-100" />

              <div>
                <PasswordField
                  label="New password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  visible={visibility.newPassword}
                  onToggle={() => toggleVisibility('newPassword')}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                />

                <div className="mt-2.5 space-y-1.5 rounded-xl bg-slate-50 px-4 py-3">
                  <Requirement met={form.newPassword.length >= 8}>
                    At least 8 characters
                  </Requirement>
                  <Requirement
                    met={
                      form.newPassword.length > 0 &&
                      form.newPassword !== form.currentPassword
                    }
                  >
                    Different from your current password
                  </Requirement>
                </div>
              </div>

              <PasswordField
                label="Confirm new password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                visible={visibility.confirmPassword}
                onToggle={() => toggleVisibility('confirmPassword')}
                placeholder="Enter your new password again"
                autoComplete="new-password"
              />

              {form.confirmPassword.length > 0 && (
                <p
                  className={`text-[13px] font-medium ${
                    passwordsMatch ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {passwordsMatch ? 'Passwords match.' : 'Passwords do not match yet.'}
                </p>
              )}
            </div>

            {error && (
              <p
                role="alert"
                className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] font-medium text-rose-700"
              >
                <Info size={15} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw size={16} />
                Clear fields
              </button>

              <button
                type="submit"
                disabled={submitting || !newPasswordValid || !passwordsMatch}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#071A52] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ShieldCheck size={16} />
                )}
                {submitting ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
            <LockKeyhole size={17} />
          </span>

          <h2 className="mt-3 text-base font-extrabold text-[#071A52]">Password tips</h2>
          <p className="mt-1 text-[13px] leading-5 text-slate-500">
            A small habit keeps your account safe.
          </p>

          <ul className="mt-4 space-y-3 text-[13px] leading-5 text-slate-600">
            <li className="flex gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
              Use a password you do not use on any other site.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
              Longer passwords are harder to guess than short, complex ones.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
              Never share it with staff, parents or students.
            </li>
          </ul>

          <p className="mt-4 border-t border-slate-100 pt-4 text-[13px] leading-5 text-slate-500">
            Use your new password the next time you sign in.
          </p>
        </aside>
      </div>
    </div>
  );
}
