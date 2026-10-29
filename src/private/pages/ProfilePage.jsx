import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Eye,
  EyeOff,
  FileLock2,
  GraduationCap,
  ImagePlus,
  Info,
  KeyRound,
  LockKeyhole,
  Mail,
  Pencil,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';

import { useUserContext } from '../../context/UserContext';
import {
  getRoleLabel,
  normalizeRole,
  ROLES,
} from '../../utils/roles';

function getDisplayName(user, student) {
  const name = [
    user?.firstName || student?.firstName,
    user?.surName || user?.surname || student?.surName || student?.surname,
  ]
    .filter(Boolean)
    .join(' ');

  return name || user?.name || 'User';
}

function getInitials(name) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  );
}

function getDateValue(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function getClassName(student) {
  const currentClass = student?.currentClass;

  if (currentClass && typeof currentClass === 'object') {
    return [
      currentClass.className,
      currentClass.classLevel,
      currentClass.arm,
    ]
      .filter(Boolean)
      .join(' ') || 'Not assigned';
  }

  return (
    currentClass ||
    student?.classLevel ||
    student?.currentClassId ||
    'Not assigned'
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100';

const lockedInputClass =
  'w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-500';

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-extrabold text-[#071A52]">{title}</h2>
        {description && (
          <p className="mt-1 text-[13px] leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  editable = false,
  placeholder,
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 flex items-center justify-between gap-2 text-[13px] font-semibold text-slate-700">
        <span>{label}</span>
        {editable ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600">
            <Pencil size={12} />
            Editable
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
            <LockKeyhole size={12} />
            Read-only
          </span>
        )}
      </span>

      <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        disabled={!editable}
        placeholder={editable ? placeholder : placeholder || 'Not provided'}
        className={editable ? inputClass : lockedInputClass}
      />
    </label>
  );
}

function StatusMessage({ type = 'info', children }) {
  const styles = {
    info: 'border-blue-100 bg-blue-50 text-blue-800',
    error: 'border-red-100 bg-red-50 text-red-700',
    warning: 'border-amber-100 bg-amber-50 text-amber-800',
  };

  const Icon = type === 'error' ? X : Info;

  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-5 ${styles[type]}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
          {value || 'Not provided'}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, student, school } = useUserContext();
  const fileInputRef = useRef(null);

  const normalizedRole = normalizeRole(user?.role || student?.role);
  const isStudent = normalizedRole === ROLES.STUDENT;
  const roleLabel =
    getRoleLabel(normalizedRole || user?.role || student?.role) || 'User';

  const displayName = useMemo(
    () => getDisplayName(user, student),
    [user, student],
  );

  const initials = useMemo(() => getInitials(displayName), [displayName]);

  const schoolName = school?.schoolName || school?.name || '';
  const originalEmail = (user?.email || student?.email || '').trim();

  const initialProfile = useMemo(
    () => ({
      firstName: user?.firstName || student?.firstName || '',
      surName:
        user?.surName ||
        user?.surname ||
        student?.surName ||
        student?.surname ||
        '',
    }),
    [user, student],
  );

  const [profileImage, setProfileImage] = useState(
    user?.profileImage || student?.profileImage || '',
  );
  const [form, setForm] = useState(initialProfile);
  const [imageChanged, setImageChanged] = useState(false);

  const [profileMessage, setProfileMessage] = useState('');
  const [profileMessageType, setProfileMessageType] = useState('info');

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailMessage, setEmailMessage] = useState('');
  const [emailMessageType, setEmailMessageType] = useState('info');

  const [showEmailForm, setShowEmailForm] = useState(false);

  const profileChanged =
    form.firstName !== initialProfile.firstName ||
    form.surName !== initialProfile.surName ||
    imageChanged;

  const normalizedOriginalEmail = originalEmail.toLowerCase();
  const normalizedNewEmail = newEmail.trim().toLowerCase();

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedNewEmail);
  const emailIsDifferent =
    emailIsValid && normalizedNewEmail !== normalizedOriginalEmail;

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setProfileMessage('');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileMessageType('error');
      setProfileMessage('Please choose a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileMessageType('error');
      setProfileMessage('Your profile picture must be 5 MB or smaller.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileImage(reader.result);
        setImageChanged(true);
        setProfileMessage('');
      }
    };

    reader.onerror = () => {
      setProfileMessageType('error');
      setProfileMessage('We could not read this image. Please try another one.');
    };

    reader.readAsDataURL(file);
  };

  const handleProfileSave = () => {
    setProfileMessageType('warning');
    setProfileMessage(
      imageChanged
        ? 'Your new photo is a local preview only. Profile updates are not connected yet, so nothing was uploaded.'
        : 'Your changes are not saved yet. Profile updates are not connected, so nothing was sent to your school.',
    );
  };

  const resetProfileChanges = () => {
    setForm(initialProfile);
    setProfileImage(user?.profileImage || student?.profileImage || '');
    setImageChanged(false);
    setProfileMessage('');
  };

  const resetEmailFields = () => {
    setNewEmail('');
    setCurrentPassword('');
    setShowPassword(false);
    setEmailMessage('');
  };

  const handleEmailRequest = () => {
    if (!normalizedOriginalEmail) {
      setEmailMessageType('error');
      setEmailMessage('Your current account email is not available.');
      return;
    }

    if (!emailIsValid) {
      setEmailMessageType('error');
      setEmailMessage('Enter a valid new email address.');
      return;
    }

    if (!emailIsDifferent) {
      setEmailMessageType('error');
      setEmailMessage('Enter an email address different from your current one.');
      return;
    }

    if (!currentPassword.trim()) {
      setEmailMessageType('error');
      setEmailMessage('Enter your current password to confirm this request.');
      return;
    }

    setCurrentPassword('');
    setEmailMessageType('warning');
    setEmailMessage(
      'Email changes are not available yet. Your current email stays active and no request was sent.',
    );
  };

  const closeEmailForm = () => {
    resetEmailFields();
    setShowEmailForm(false);
  };

  const contactDetails = [
    {
      key: 'phoneNumber',
      label: 'Phone number',
      value: user?.phoneNumber || student?.phoneNumber || '',
      type: 'tel',
    },
    {
      key: 'gender',
      label: 'Gender',
      value: user?.gender || student?.gender || '',
      type: 'text',
    },
    {
      key: 'dateOfBirth',
      label: 'Date of birth',
      value: getDateValue(user?.dateOfBirth || student?.dateOfBirth),
      type: 'date',
    },
    {
      key: 'address',
      label: 'Residential address',
      value: user?.address || student?.address || '',
      type: 'text',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-[13px] text-slate-500"
        >
          <span>Account</span>
          <ChevronRight size={14} />
          <span className="font-semibold text-[#071A52]">My profile</span>
        </nav>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
          <ShieldCheck size={14} />
          Secure account settings
        </span>
      </div>

      {/* Profile hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-5 text-white shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full border-[30px] border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-cyan-400/[0.08] blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 text-2xl font-black shadow-inner sm:h-24 sm:w-24 sm:text-3xl">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-white text-[#071A52] shadow-lg transition hover:scale-105"
                aria-label="Change profile picture"
                title="Change profile picture"
              >
                <Camera size={17} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                Your account
              </p>
              <h1 className="mt-2 truncate text-2xl font-black sm:text-3xl">
                {displayName}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-blue-100">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-semibold text-white">
                  <UserRound size={14} />
                  {roleLabel}
                </span>

                {schoolName && (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                    <ShieldCheck size={14} />
                    <span className="truncate">{schoolName}</span>
                  </span>
                )}

                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                  <Mail size={14} />
                  <span className="truncate">
                    {originalEmail || 'No email address added'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-1 sm:items-end">
            <div className="flex items-center gap-2 text-xs text-blue-100">
              <ImagePlus size={15} />
              Profile photo
            </div>
            <p className="text-xs text-blue-200">
              PNG, JPG or WebP · Max 5 MB
            </p>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          {/* Personal information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeading
                icon={CircleUserRound}
                title="Personal information"
                description="The details your account currently has on record."
              />

              {profileChanged && (
                <span className="flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">
              <Field
                label="First name"
                value={form.firstName}
                editable={!isStudent}
                placeholder="Enter first name"
                onChange={(event) => updateForm('firstName', event.target.value)}
              />

              <Field
                label="Surname"
                value={form.surName}
                editable={!isStudent}
                placeholder="Enter surname"
                onChange={(event) => updateForm('surName', event.target.value)}
              />

              {contactDetails.map((field) => (
                <Field
                  key={field.key}
                  label={field.label}
                  value={field.value}
                  type={field.type}
                />
              ))}
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-3">
              <Info size={16} className="mt-0.5 shrink-0 text-blue-700" />
              <p className="text-[13px] leading-5 text-blue-800">
                {isStudent
                  ? 'Student names and academic records are managed by the school. You can change your photo and request an email change.'
                  : 'Some details are managed by your school. Contact the school office if a record needs to be corrected.'}
              </p>
            </div>

            {profileMessage && (
              <div className="mt-4">
                <StatusMessage type={profileMessageType}>
                  {profileMessage}
                </StatusMessage>
              </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={resetProfileChanges}
                disabled={!profileChanged}
                className="cursor-pointer rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Discard changes
              </button>

              <button
                type="button"
                onClick={handleProfileSave}
                disabled={!profileChanged}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#123A8F] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Save size={16} />
                Save changes
              </button>
            </div>
          </section>

          {/* Email settings */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <SectionHeading
                icon={Mail}
                title="Email address"
                description="Used for account communication and verification."
              />

              <span className="flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600">
                <LockKeyhole size={12} />
                Protected
              </span>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                  <Mail size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500">
                    Current email
                  </p>
                  <p className="mt-0.5 break-all text-sm font-semibold text-slate-800">
                    {originalEmail || 'No email address added'}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[13px] leading-5 text-slate-500">
              Email is updated separately from your personal details so a single
              verification only affects the new address. Your current email
              stays active until a change is verified and saved.
            </p>

            {!showEmailForm ? (
              <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Need to use another email?
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-slate-500">
                    You will need your current password and access to the new
                    inbox.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(true);
                    setEmailMessage('');
                  }}
                  className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-[#123A8F] transition hover:bg-blue-50"
                >
                  <Pencil size={15} />
                  Change email
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Change your email
                  </h3>

                  <button
                    type="button"
                    onClick={closeEmailForm}
                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Cancel email change"
                  >
                    <X size={18} />
                  </button>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-slate-700">
                    New email address
                  </span>
                  <input
                    id="new-email"
                    type="email"
                    autoComplete="email"
                    value={newEmail}
                    onChange={(event) => {
                      setNewEmail(event.target.value);
                      setEmailMessage('');
                    }}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-slate-700">
                    Current password
                  </span>

                  <div className="relative">
                    <input
                      id="current-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      placeholder="Enter your current password"
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3.5 text-slate-400 transition hover:text-slate-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                {emailMessage && (
                  <StatusMessage type={emailMessageType}>
                    {emailMessage}
                  </StatusMessage>
                )}

                <div className="flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={resetEmailFields}
                    className="cursor-pointer rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    Reset fields
                  </button>

                  <button
                    type="button"
                    onClick={handleEmailRequest}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F]"
                  >
                    <KeyRound size={16} />
                    Request email change
                  </button>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                  <FileLock2 size={16} className="mt-0.5 shrink-0 text-blue-700" />
                  <p className="text-[13px] leading-5 text-blue-800">
                    A real update must validate your current password, verify the
                    new address, and only then replace your account email.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Account sidebar */}
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-[#071A52]">
              Account overview
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-slate-500">
              Your school account details.
            </p>

            <div className="mt-4 space-y-2.5">
              <InfoChip
                icon={UserRound}
                label="Login ID"
                value={user?.loginId || student?.loginId}
              />

              {isStudent && (
                <>
                  <InfoChip
                    icon={CircleUserRound}
                    label="Admission number"
                    value={student?.admissionNumber}
                  />
                  <InfoChip
                    icon={GraduationCap}
                    label="Class"
                    value={getClassName(student)}
                  />
                </>
              )}

              <InfoChip icon={ShieldCheck} label="Account role" value={roleLabel} />
            </div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#123A8F]">
              <ShieldCheck size={20} />
            </div>
            <h2 className="mt-3 text-base font-extrabold text-[#071A52]">
              Your privacy matters
            </h2>
            <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
              Some information is managed by your school to keep records
              consistent.
            </p>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                <p className="text-[13px] leading-5 text-slate-600">
                  Only permitted profile fields can be edited.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                <p className="text-[13px] leading-5 text-slate-600">
                  Email changes are verified separately.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                <p className="text-[13px] leading-5 text-slate-600">
                  School records stay read-only.
                </p>
              </div>
            </div>
          </section>

          <Link
            to="/help-support"
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <div>
              <p className="text-base font-extrabold text-[#071A52]">
                Need help?
              </p>
              <p className="mt-1 text-[13px] leading-5 text-slate-500">
                Contact support about your account.
              </p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-slate-400" />
          </Link>
        </aside>
      </div>

      <div className="flex items-center justify-center gap-2 pb-2 text-xs text-slate-500">
        <LockKeyhole size={13} />
        ScholaNode · Account settings
      </div>
    </div>
  );
}
