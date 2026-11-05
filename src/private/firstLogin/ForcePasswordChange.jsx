import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';

import PasswordField from '../components/PasswordField';
import { changePassword } from '../pages/settingsApi';
import { useUserContext } from '../../context/UserContext';
import { isProfilePending } from '../../utils/staffDisplay';
import FirstLoginShell from './FirstLoginShell';

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

function Requirement({ met, children }) {
  return (
    <p className={`flex items-center gap-2 text-[13px] ${met ? 'text-emerald-700' : 'text-slate-500'}`}>
      <CheckCircle2 size={15} className={met ? 'text-emerald-600' : 'text-slate-300'} />
      {children}
    </p>
  );
}

export default function ForcePasswordChange() {
  const { user, school, fetchLoggedInUser, logout } = useUserContext();

  const [form, setForm] = useState(EMPTY_FORM);
  const [visibility, setVisibility] = useState(EMPTY_VISIBILITY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const namesPending = isProfilePending(user);
  const displayName = namesPending
    ? ''
    : [user?.firstName, user?.surName].filter(Boolean).join(' ');

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  }

  function toggleVisibility(field) {
    setVisibility((current) => ({ ...current, [field]: !current[field] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const currentPassword = form.currentPassword;
    const newPassword = form.newPassword;

    if (!currentPassword) {
      setError('Enter the password you signed in with.');
      return;
    }

    if (!newPassword) {
      setError('Choose a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Your new password must be at least 8 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('Your new password must be different from your current password.');
      return;
    }

    if (newPassword !== form.confirmPassword) {
      setError('The two new passwords do not match yet.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await changePassword({ currentPassword, newPassword });

      setForm(EMPTY_FORM);
      setVisibility(EMPTY_VISIBILITY);

      // The gate reads the flags from the cached profile, so it needs the
      // refreshed account before it can move on to the next step.
      await fetchLoggedInUser();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'We could not update your password. Check your connection and try again.'
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
    <FirstLoginShell
      step={1}
      schoolName={school?.schoolName || school?.name}
      onSignOut={logout}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#071A52] p-2.5 text-white">
          <LockKeyhole size={20} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#071A52] sm:text-2xl">
            Choose a new password
          </h1>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {displayName
              ? `Welcome, ${displayName}. `
              : 'Welcome. '}
            You are signing in with a temporary password, so set your own before
            continuing. You will not be asked again.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <PasswordField
          label="Current password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          visible={visibility.currentPassword}
          onToggle={() => toggleVisibility('currentPassword')}
          placeholder="Enter your temporary password"
          autoComplete="current-password"
        />

        <div>
          <PasswordField
            label="New password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            visible={visibility.newPassword}
            onToggle={() => toggleVisibility('newPassword')}
            placeholder="Choose a password only you know"
            autoComplete="new-password"
          />

          <div className="mt-2.5 space-y-1.5 rounded-xl bg-slate-50 px-4 py-3">
            <Requirement met={form.newPassword.length >= 8}>
              At least 8 characters
            </Requirement>
            <Requirement met={newPasswordValid}>
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

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p className="leading-5">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !newPasswordValid || !passwordsMatch}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 size={17} className="animate-spin" /> : <ShieldCheck size={17} />}
          {submitting ? 'Updating your password...' : 'Save password and continue'}
        </button>

        <p className="text-center text-xs text-slate-500">
          If you did not expect this step, sign out and contact your school administrator.
        </p>
      </form>
    </FirstLoginShell>
  );
}
