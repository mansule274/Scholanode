import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, UserRoundPen } from 'lucide-react';

import FirstLoginShell from './FirstLoginShell';
import { completeProfile } from './firstLoginApi';
import { useUserContext } from '../../context/UserContext';
import { getRoleLabel, normalizeRole, ROLES } from '../../utils/roles';
import { isProfilePending } from '../../utils/staffDisplay';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100';

const labelClass = 'mb-1.5 block text-[13px] font-semibold text-slate-700';

function Field({ id, label, hint, value, onChange, placeholder, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputClass}
      />
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function CompleteProfile() {
  const { user, school, fetchLoggedInUser, logout } = useUserContext();

  const role = normalizeRole(user?.role);
  const isStudent = role === ROLES.STUDENT;

  // An invited account carries the placeholder names the backend seeded it with,
  // so those are never offered back as if they were the person's real name.
  const namesPending = isProfilePending(user);
  const startingName = (value) => (namesPending ? '' : value || '');

  const [firstName, setFirstName] = useState(startingName(user?.firstName));
  const [surName, setSurName] = useState(startingName(user?.surName));
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const trimmedPhone = phoneNumber.trim();

  const canSubmit = isStudent
    ? !submitting
    : firstName.trim().length >= 2 && surName.trim().length >= 2 && !submitting;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isStudent) {
      if (firstName.trim().length < 2 || surName.trim().length < 2) {
        setError('Enter your real first name and surname.');
        return;
      }
    }

    if (trimmedPhone && trimmedPhone.length < 7) {
      setError('Enter a complete phone number, or leave it blank for now.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await completeProfile({
        ...(isStudent
          ? {}
          : { firstName: firstName.trim(), surName: surName.trim() }),
        ...(trimmedPhone ? { phoneNumber: trimmedPhone } : {}),
      });

      await fetchLoggedInUser();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'We could not save your details. Check your connection and try again.'
      );
      setSubmitting(false);
    }
  }

  return (
    <FirstLoginShell
      step={2}
      schoolName={school?.schoolName || school?.name}
      onSignOut={logout}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#071A52] p-2.5 text-white">
          <UserRoundPen size={20} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#071A52] sm:text-2xl">
            Complete your profile
          </h1>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Your account was created by {school?.schoolName || school?.name || 'your school'} as{' '}
            {getRoleLabel(role) || 'a member of staff'}. Confirm the details below so your
            name shows correctly to everyone else.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        {isStudent ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
            <p className="text-[13px] font-semibold text-slate-700">
              {user?.firstName} {user?.surName}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              A student&apos;s name is kept by the school. If anything here is wrong, ask your
              school office to correct it.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="firstName"
              label="First name"
              value={firstName}
              onChange={(event) => {
                setFirstName(event.target.value);
                setError('');
              }}
              placeholder="Your first name"
              autoComplete="given-name"
            />
            <Field
              id="surName"
              label="Surname"
              value={surName}
              onChange={(event) => {
                setSurName(event.target.value);
                setError('');
              }}
              placeholder="Your surname"
              autoComplete="family-name"
            />
          </div>
        )}

        <Field
          id="phoneNumber"
          label="Phone number (optional)"
          hint="Add it now and your school can reach you, or set it later from your profile page."
          value={phoneNumber}
          onChange={(event) => {
            setPhoneNumber(event.target.value);
            setError('');
          }}
          placeholder="08012345678"
          autoComplete="tel"
        />

        {user?.email && (
          <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-[13px] leading-5 text-slate-600">
              Invitations were sent to <span className="font-semibold">{user.email}</span>. You
              can change this later from your profile page.
            </p>
          </div>
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
          disabled={!canSubmit}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
          {submitting ? 'Saving your details...' : 'Save and enter ScholaNode'}
        </button>
      </form>
    </FirstLoginShell>
  );
}
