import { useMemo, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { resendVerification, verifyCode } from '../../pages/get-start/registrationApi';
import { useUserContext } from '../../context/UserContext';
import { normalizeRole, ROLES } from '../../utils/roles';

function getDisplayName(user, student) {
  const nameFromUser = [user?.firstName, user?.surName || user?.surname].filter(Boolean).join(' ');
  if (nameFromUser) return nameFromUser;
  if (student?.firstName || student?.surName) {
    return [student?.firstName, student?.surName].filter(Boolean).join(' ');
  }
  return user?.name || 'User';
}

function getInitials(user, student) {
  const sourceName = getDisplayName(user, student);
  const initials = sourceName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'U';
}

export default function ProfilePage() {
  const { user, student, school } = useUserContext();
  const fileInputRef = useRef(null);
  const normalizedRole = normalizeRole(user?.role || student?.role);
  const isStudent = normalizedRole === ROLES.STUDENT;

  const [profileImage, setProfileImage] = useState(user?.profileImage || student?.profileImage || '');
  const [form, setForm] = useState(() => ({
    firstName: user?.firstName || student?.firstName || '',
    surName: user?.surName || user?.surname || student?.surName || '',
    email: user?.email || student?.email || '',
    phoneNumber: user?.phoneNumber || student?.phoneNumber || '',
    gender: user?.gender || student?.gender || '',
    dateOfBirth: user?.dateOfBirth || student?.dateOfBirth || '',
    address: user?.address || student?.address || '',
    classLevel: student?.currentClassId || student?.classLevel || student?.currentClass || '',
    admissionNumber: student?.admissionNumber || '',
    loginId: user?.loginId || student?.loginId || '',
    role: user?.role || student?.role || normalizedRole || '',
  }));
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const displayName = useMemo(() => getDisplayName(user, student), [user, student]);
  const initials = useMemo(() => getInitials(user, student), [user, student]);
  const schoolName = school?.schoolName || school?.name || 'ScholaNode School';
  const originalEmail = (user?.email || student?.email || '').trim().toLowerCase();
  const currentEmail = (form.email || '').trim().toLowerCase();
  const emailChanged = Boolean(currentEmail) && currentEmail !== originalEmail;

  const isFieldEditable = (field) => {
    if (field === 'profileImage') return true;
    if (field === 'email') return true;
    if (field === 'firstName' || field === 'surName') return !isStudent;
    return false;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const handleEmailVerificationRequest = async () => {
    const nextEmail = form.email.trim();

    if (!nextEmail || !/\S+@\S+\.\S+/.test(nextEmail)) {
      setVerificationError('Enter a valid email address before requesting a verification code.');
      return;
    }

    setSendingVerification(true);
    setVerificationError('');
    setVerificationMessage('');

    try {
      await resendVerification(nextEmail);
      setVerificationMessage('Verification code sent to your new email address.');
    } catch (error) {
      setVerificationError(error?.response?.data?.message || 'We could not send a verification code. Please try again.');
    } finally {
      setSendingVerification(false);
    }
  };

  const handleEmailVerification = async () => {
    const nextEmail = form.email.trim();
    const code = emailVerificationCode.trim();

    if (!nextEmail || !code) {
      setVerificationError('Enter the 6-digit verification code first.');
      return;
    }

    setVerifyingEmail(true);
    setVerificationError('');
    setVerificationMessage('');

    try {
      const verified = await verifyCode(nextEmail, code);
      if (!verified) {
        setVerificationError('The verification code is invalid or expired.');
        return;
      }

      setVerificationMessage('Email verified successfully. The backend profile update endpoint is still required before the change is permanently saved.');
      setVerificationError('');
    } catch (error) {
      setVerificationError(error?.response?.data?.message || 'Email verification failed. Please try again.');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleSave = () => {
    // No profile update endpoint is available yet. Do not claim a save happened.
    setVerificationError('Profile update persistence is not available yet. The UI is preview-only until the backend endpoint is ready.');
  };

  const fields = [
    { key: 'firstName', label: 'First name', type: 'text', value: form.firstName },
    { key: 'surName', label: 'Surname', type: 'text', value: form.surName },
    { key: 'email', label: 'Email', type: 'email', value: form.email },
    { key: 'phoneNumber', label: 'Phone number', type: 'tel', value: form.phoneNumber },
    { key: 'gender', label: 'Gender', type: 'text', value: form.gender },
    { key: 'dateOfBirth', label: 'Date of birth', type: 'date', value: form.dateOfBirth },
    { key: 'address', label: 'Residential address', type: 'text', value: form.address },
    { key: 'classLevel', label: 'Class level', type: 'text', value: form.classLevel },
    { key: 'admissionNumber', label: 'Admission number', type: 'text', value: form.admissionNumber },
    { key: 'loginId', label: 'Login ID', type: 'text', value: form.loginId },
    { key: 'role', label: 'Role', type: 'text', value: form.role },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-1">
      <div className="rounded-[28px] border border-slate-200 bg-gradient-to-r from-[#071A52] via-[#0A2463] to-[#123A8F] p-5 text-white shadow-lg sm:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 text-2xl font-bold shadow-inner">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white text-[#071A52] shadow-lg transition hover:scale-105"
                aria-label="Upload profile image"
              >
                <Camera size={16} />
              </button>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-100">Account profile</p>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">{displayName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-blue-100">
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1">{form.role || normalizedRole || 'User'}</span>
                <span className="hidden sm:inline">•</span>
                <span>{schoolName}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#071A52] shadow-sm opacity-70"
          >
            <Save size={16} />
            Profile save unavailable
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
              <UserRound size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Personal details</h2>
              <p className="text-sm text-slate-500">Only fields allowed by your role are editable.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => {
              const editableField = isFieldEditable(field.key);
              const currentValue = field.value || '';

              return (
                <label key={field.key} className="block">
                  <span className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>{field.label}</span>
                    {editableField ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                        <PencilLine size={12} /> Editable
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        <ShieldCheck size={12} /> Locked
                      </span>
                    )}
                  </span>

                  <input
                    type={field.type}
                    value={currentValue}
                    disabled={!editableField}
                    onChange={(event) => {
                      if (field.key === 'email') {
                        setForm((current) => ({ ...current, email: event.target.value }));
                        return;
                      }

                      if (field.key === 'firstName' || field.key === 'surName') {
                        setForm((current) => ({ ...current, [field.key]: event.target.value }));
                        return;
                      }
                    }}
                    className={`w-full rounded-2xl border bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition ${
                      editableField
                        ? 'border-slate-200 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100'
                        : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                    }`}
                  />
                </label>
              );
            })}
          </div>

          {emailChanged && (
            <div className="mt-6 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-800">Email change verification</p>
              <p className="mt-1 text-sm text-blue-700">
                The changed email needs verification before it can be accepted.
              </p>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleEmailVerificationRequest}
                  disabled={sendingVerification || verifyingEmail}
                  className="inline-flex items-center justify-center rounded-xl bg-[#071A52] px-3 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sendingVerification ? 'Sending code...' : 'Send verification code'}
                </button>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={emailVerificationCode}
                  onChange={(event) => setEmailVerificationCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 sm:max-w-[180px]"
                />

                <button
                  type="button"
                  onClick={handleEmailVerification}
                  disabled={verifyingEmail || sendingVerification || emailVerificationCode.length !== 6}
                  className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm font-semibold text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {verifyingEmail ? 'Verifying...' : 'Verify'}
                </button>
              </div>

              {verificationMessage && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  <Check size={15} />
                  {verificationMessage}
                </div>
              )}

              {verificationError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {verificationError}
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Profile summary</h3>

            <div className="mt-5 space-y-4">
              <InfoChip icon={Mail} label="Email" value={form.email || 'Not provided'} />
              <InfoChip icon={Phone} label="Phone" value={form.phoneNumber || 'Not provided'} />
              <InfoChip icon={MapPin} label="Address" value={form.address || 'No address added'} />
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Role permissions</h3>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                {isStudent ? 'Student access' : 'Staff / leadership access'}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {isStudent
                  ? 'Students may change only their profile picture and email. The email change is verified before acceptance.'
                  : 'Non-student roles may change first name, surname, profile picture, and email; all other profile fields remain locked.'}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}
