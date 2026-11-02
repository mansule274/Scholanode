import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Edit3,
  GraduationCap,
  Hash,
  ImagePlus,
  Landmark,
  LifeBuoy,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserContext } from '../../../context/UserContext';
import {
  confirmMediaUpload,
  MEDIA_UPLOAD_STAGES,
  uploadMedia,
} from '../../../services/media/mediaUploadService';
import { COMPRESSION_PRESETS, compressImage } from '../../../utils/media/compressImage';
import {
  SCHOOL_LOGO_MEDIA_RULES,
  validateMediaFile,
} from '../../../utils/media/validateMedia';
import { normalizeRole, ROLES } from '../../../utils/roles';
import {
  buildSetupProgress,
  confirmSchoolLogoUpload,
  getMySchoolProfile,
  requestSchoolLogoUploadUrl,
  updateMySchoolSetup,
} from './schoolProfileApi';

const EDITOR_ROLES = [ROLES.LEADER, ROLES.VICE_LEADER, ROLES.ADMINISTRATOR];

const SCHOOL_LEVEL_LABELS = {
  PRIMARY: 'Primary school',
  SECONDARY: 'Secondary school',
  COMBINED: 'Combined school',
};

const OWNERSHIP_LABELS = {
  GOVERNMENT: 'Government-owned',
  PRIVATE: 'Privately owned',
};

const STATUS_LABELS = {
  ACTIVE: 'Active',
  PENDING_VERIFICATION: 'Pending verification',
  PENDING_ACTIVATION: 'Pending activation',
  SUSPENDED: 'Suspended',
};

const STATUS_STYLES = {
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  PENDING_VERIFICATION: 'border-amber-200 bg-amber-50 text-amber-700',
  PENDING_ACTIVATION: 'border-amber-200 bg-amber-50 text-amber-700',
  SUSPENDED: 'border-rose-200 bg-rose-50 text-rose-700',
};

const SETUP_STEP_ITEMS = [
  {
    key: 'supportEmail',
    label: 'Support email',
    description: 'Where families can reach the school.',
  },
  {
    key: 'supportPhone',
    label: 'Support phone',
    description: 'A number for urgent questions.',
  },
  {
    key: 'welcomeMessage',
    label: 'Welcome message',
    description: 'A short note shown on your portal.',
  },
  {
    key: 'logo',
    label: 'School logo',
    description: 'A recognizable mark for your portal.',
  },
];

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100';

function createDraft(source) {
  return {
    supportEmail: source?.supportEmail || '',
    supportPhone: source?.supportPhone || '',
    welcomeMessage: source?.welcomeMessage || '',
  };
}

function validateDraft(draft) {
  const supportEmail = draft.supportEmail.trim();
  const supportPhone = draft.supportPhone.trim();
  const welcomeMessage = draft.welcomeMessage.trim();

  if (supportEmail && !/^\S+@\S+\.\S+$/.test(supportEmail)) {
    return 'Enter a valid support email address.';
  }

  if (supportEmail.length > 100) {
    return 'Support email cannot exceed 100 characters.';
  }

  if (supportPhone.length > 20) {
    return 'Support phone cannot exceed 20 characters.';
  }

  if (welcomeMessage.length > 2000) {
    return 'Welcome message cannot exceed 2000 characters.';
  }

  return '';
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export default function SchoolProfile() {
  const { user, school: cachedSchool, fetchLoggedInUser } = useUserContext();
  const role = normalizeRole(user?.role);
  const canManage = EDITOR_ROLES.includes(role);

  const [school, setSchool] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(createDraft(null));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [notice, setNotice] = useState('');

  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoError, setLogoError] = useState('');
  const [pendingLogoKey, setPendingLogoKey] = useState('');

  useEffect(() => {
    if (!canManage) return undefined;

    let cancelled = false;

    const load = async () => {
      try {
        const result = await getMySchoolProfile();

        if (cancelled) return;

        setSchool(result.school);
        setProgress(result.progress);
        setDraft(createDraft(result.school));
        setLoadError('');
        setEditing(false);
      } catch (error) {
        if (cancelled) return;

        setLoadError(
          getErrorMessage(
            error,
            'We could not load your school profile. Check your connection and try again.'
          )
        );
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [canManage, refreshKey]);

  const identity = school ?? cachedSchool ?? {};
  const schoolName = identity.schoolName || 'Your school';
  const detailsLoading = canManage && !school && !loadError;

  const progressLabel = !canManage
    ? 'Setup progress is managed by school leaders'
    : progress
      ? `${progress.completedSteps} of ${progress.totalSteps} setup details complete`
      : loadError
        ? 'Setup progress unavailable'
        : 'Loading setup progress...';

  function retryLoad() {
    setLoadError('');
    setRefreshKey((value) => value + 1);
  }

  function beginEditing() {
    setDraft(createDraft(school));
    setSaveError('');
    setNotice('');
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(createDraft(school));
    setSaveError('');
    setEditing(false);
  }

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaveError('');
  }

  function applyConfirmedLogo(confirmation) {
    const logoUrl = confirmation?.school?.logoUrl;

    if (!logoUrl) {
      setLogoError(
        'The logo was uploaded, but we could not read the new logo. Reload the page to see it.'
      );
      return;
    }

    const nextSchool = { ...(school || cachedSchool || {}), logoUrl };

    setSchool(nextSchool);
    setProgress(buildSetupProgress(nextSchool));
    setNotice(confirmation?.message || 'School logo updated successfully.');
    setLogoError('');
    setPendingLogoKey('');
    setLogoProgress(0);
    void fetchLoggedInUser();
  }

  async function handleLogoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || logoUploading) return;

    setLogoError('');
    setPendingLogoKey('');
    setLogoUploading(true);
    setLogoProgress(0);

    let preparedFile;

    try {
      preparedFile = await compressImage(file, COMPRESSION_PRESETS.SCHOOL_LOGO);

      const validation = validateMediaFile(
        preparedFile,
        SCHOOL_LOGO_MEDIA_RULES
      );

      if (!validation.valid) {
        throw new Error(validation.message);
      }
    } catch (error) {
      setLogoUploading(false);
      setLogoError(
        error?.message ||
          'We could not prepare that image. Please choose another file.'
      );
      return;
    }

    try {
      const result = await uploadMedia({
        file: preparedFile,
        requestUploadUrl: requestSchoolLogoUploadUrl,
        confirmUpload: confirmSchoolLogoUpload,
        onProgress: setLogoProgress,
      });

      applyConfirmedLogo(result.confirmation);
    } catch (error) {
      if (error?.phase === MEDIA_UPLOAD_STAGES.CONFIRMING && error?.key) {
        setPendingLogoKey(error.key);
      }

      setLogoError(
        error?.message || 'We could not upload your logo. Please try again.'
      );
    } finally {
      setLogoUploading(false);
    }
  }

  async function retryLogoConfirm() {
    if (!pendingLogoKey || logoUploading) return;

    setLogoUploading(true);
    setLogoError('');
    setLogoProgress(100);

    try {
      const result = await confirmMediaUpload({
        key: pendingLogoKey,
        confirmUpload: confirmSchoolLogoUpload,
      });

      applyConfirmedLogo(result.confirmation);
    } catch (error) {
      if (error?.phase === MEDIA_UPLOAD_STAGES.CONFIRMING && error?.key) {
        setPendingLogoKey(error.key);
      }

      setLogoError(
        error?.message ||
          'Your logo uploaded, but we could not save it to your school. Please try again.'
      );
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!school?.id) {
      setSaveError('School information is not available yet. Please reload the page.');
      return;
    }

    const validationError = validateDraft(draft);

    if (validationError) {
      setSaveError(validationError);
      return;
    }

    const updates = {
      supportEmail: draft.supportEmail.trim(),
      supportPhone: draft.supportPhone.trim(),
      welcomeMessage: draft.welcomeMessage.trim(),
    };

    setSaving(true);
    setSaveError('');

    try {
      const result = await updateMySchoolSetup(updates);
      const updatedSchool = result.school || { ...school, ...updates };

      setSchool(updatedSchool);
      setDraft(createDraft(updatedSchool));
      setProgress(buildSetupProgress(updatedSchool));
      setEditing(false);
      setNotice(result.message);
    } catch (error) {
      setSaveError(
        getErrorMessage(
          error,
          'We could not save these details. Please try again.'
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-[13px] text-slate-500"
      >
        <span>School</span>
        <ChevronRight size={14} />
        <span className="font-semibold text-[#071A52]">School profile</span>
      </nav>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[30px] border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-cyan-400/[0.08] blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10">
              {identity.logoUrl ? (
                <img
                  src={identity.logoUrl}
                  alt={`${schoolName} logo`}
                  className="h-full w-full object-contain p-1.5"
                />
              ) : (
                <Building2 size={24} />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                School profile
              </p>
              <h1 className="mt-1.5 break-words text-2xl font-black sm:text-3xl">
                {schoolName}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                Keep your school identity, support details and welcome message
                clear for everyone using the portal.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {identity.schoolCode && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">
                    <Hash size={12} />
                    {identity.schoolCode}
                  </span>
                )}
                {identity.status && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                      STATUS_STYLES[identity.status] ||
                      'border-white/20 bg-white/10 text-white'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {STATUS_LABELS[identity.status] || identity.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:max-w-xs lg:w-72">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-blue-100">Setup progress</span>
              <span className="text-cyan-200">
                {progress ? `${progress.percentage}%` : '—'}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-cyan-300 transition-all"
                style={{ width: `${progress?.percentage || 0}%` }}
              />
            </div>
            <p className="mt-2.5 text-xs leading-5 text-blue-100">
              {progressLabel}
            </p>
          </div>
        </div>
      </section>

      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <span className="flex items-start gap-2">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
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

      {loadError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-start gap-2">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            {loadError}
          </span>
          <button
            type="button"
            onClick={retryLoad}
            className="inline-flex w-fit shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-[13px] font-bold text-rose-700 transition hover:bg-rose-100"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <IdentityCard
            identity={identity}
            loading={detailsLoading}
            showAddress={canManage}
          />

          <PortalSetupCard
            draft={draft}
            onChange={updateDraft}
            canManage={canManage}
            editing={editing}
            onBeginEdit={beginEditing}
            onCancel={cancelEditing}
            onSubmit={handleSave}
            saving={saving}
            error={saveError}
            loading={detailsLoading}
            loadFailed={Boolean(loadError)}
            restricted={!canManage}
          />
        </div>

        <div className="space-y-5">
          <LogoCard
            logoUrl={identity.logoUrl}
            schoolName={schoolName}
            canUpload={canManage && Boolean(school) && !detailsLoading && !loadError}
            uploading={logoUploading}
            progress={logoProgress}
            error={logoError}
            canRetry={Boolean(pendingLogoKey)}
            onChange={handleLogoChange}
            onRetry={retryLogoConfirm}
          />

          <ChecklistCard
            progress={progress}
            loading={detailsLoading}
            loadFailed={Boolean(loadError)}
            restricted={!canManage}
          />

          {canManage && <SupportCard />}
        </div>
      </div>
    </div>
  );
}

function IdentityCard({ identity, loading, showAddress }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-[#071A52]">
            School identity
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-slate-500">
            These details were set when your school registered and cannot be
            edited here.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
          <ShieldCheck size={13} />
          Read only
        </span>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-6">
        <IdentityField
          icon={Building2}
          label="School name"
          value={identity.schoolName}
          loading={loading}
          className="sm:col-span-6"
        />
        <IdentityField
          icon={Hash}
          label="School code"
          value={identity.schoolCode}
          loading={loading}
          className="sm:col-span-2"
        />
        <IdentityField
          icon={GraduationCap}
          label="School level"
          value={
            SCHOOL_LEVEL_LABELS[identity.schoolLevel] || identity.schoolLevel
          }
          loading={loading}
          className="sm:col-span-2"
        />
        <IdentityField
          icon={Landmark}
          label="Ownership"
          value={
            OWNERSHIP_LABELS[identity.ownershipType] || identity.ownershipType
          }
          loading={loading}
          className="sm:col-span-2"
        />
        {showAddress && (
          <IdentityField
            icon={MapPin}
            label="School address"
            value={identity.address}
            loading={loading}
            className="sm:col-span-6"
          />
        )}
      </div>
    </section>
  );
}

function IdentityField({ icon: Icon, label, value, loading, className = '' }) {
  return (
    <div className={className}>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
        <Icon size={13} />
        {label}
      </p>
      {loading && !value ? (
        <div className="mt-2.5 h-4 w-2/3 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="mt-1.5 break-words text-sm font-semibold text-slate-700">
          {value || 'Not provided'}
        </p>
      )}
    </div>
  );
}

function PortalSetupCard({
  draft,
  onChange,
  canManage,
  editing,
  onBeginEdit,
  onCancel,
  onSubmit,
  saving,
  error,
  loading,
  loadFailed,
  restricted,
}) {
  const welcomeLength = draft.welcomeMessage.length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-[#071A52]">
            Portal setup
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-slate-500">
            The support details and welcome note families see in your school
            portal.
          </p>
        </div>

        {canManage && !editing && (
          <button
            type="button"
            onClick={onBeginEdit}
            disabled={loading || loadFailed}
            className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-xl bg-[#071A52] px-3.5 py-2 text-[13px] font-bold text-white transition hover:bg-[#0A2463] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Edit3 size={14} />
            Edit setup
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[13px] leading-5 text-rose-700"
        >
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {restricted ? (
        <p className="mt-5 flex items-start gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-[13px] leading-5 text-slate-500">
          <Lock size={15} className="mt-0.5 shrink-0" />
          School setup details are managed by your school leaders and
          administrators.
        </p>
      ) : loading ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <div key={index} className={index === 2 ? 'sm:col-span-2' : ''}>
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-11 animate-pulse rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
      ) : loadFailed ? (
        <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-[13px] leading-5 text-slate-500">
          The editable setup details are unavailable right now. Use the retry
          button above to load them again.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <EditableField
              label="Support email"
              type="email"
              icon={Mail}
              value={draft.supportEmail}
              editing={editing}
              onChange={(value) => onChange('supportEmail', value)}
              placeholder="support@yourschool.com"
              maxLength={100}
            />
            <EditableField
              label="Support phone"
              type="tel"
              icon={Phone}
              value={draft.supportPhone}
              editing={editing}
              onChange={(value) => onChange('supportPhone', value)}
              placeholder="+234 800 000 0000"
              maxLength={20}
            />

            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Welcome message
              </p>
              {editing ? (
                <>
                  <textarea
                    aria-label="Welcome message"
                    rows={5}
                    value={draft.welcomeMessage}
                    onChange={(event) =>
                      onChange('welcomeMessage', event.target.value)
                    }
                    maxLength={2000}
                    placeholder="Welcome to our school portal..."
                    className={`mt-2 resize-y ${inputClass}`}
                  />
                  <p className="mt-1.5 text-right text-xs text-slate-400">
                    {welcomeLength} / 2000
                  </p>
                </>
              ) : (
                <p
                  className={`mt-2 min-h-12 whitespace-pre-line break-words rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm leading-6 ${
                    draft.welcomeMessage ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {draft.welcomeMessage || 'No welcome message added yet.'}
                </p>
              )}
            </div>
          </div>

          {editing ? (
            <div className="mt-5 flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={15} />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#071A52] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0A2463] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save setup
                  </>
                )}
              </button>
            </div>
          ) : (
            !canManage && (
              <p className="mt-4 flex items-start gap-1.5 border-t border-slate-100 pt-4 text-[13px] leading-5 text-slate-400">
                <Lock size={14} className="mt-0.5 shrink-0" />
                Only school leaders and administrators can change these
                details.
              </p>
            )
          )}
        </form>
      )}
    </section>
  );
}

function EditableField({
  label,
  value,
  editing,
  onChange,
  type = 'text',
  placeholder,
  icon: Icon,
  maxLength,
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>

      {editing ? (
        <div className="relative mt-2">
          {Icon && (
            <Icon
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          )}
          <input
            type={type}
            aria-label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`${inputClass} ${Icon ? 'pl-10' : ''}`}
          />
        </div>
      ) : (
        <p
          className={`mt-2 min-h-11 break-words rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm ${
            value ? 'font-medium text-slate-700' : 'text-slate-400'
          }`}
        >
          {value || 'Not provided'}
        </p>
      )}
    </div>
  );
}

function LogoCard({
  logoUrl,
  schoolName,
  canUpload,
  uploading,
  progress,
  error,
  canRetry,
  onChange,
  onRetry,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[#071A52]">
            School logo
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-slate-500">
            This mark appears across your school portal.
          </p>
        </div>

        {canUpload && (
          <label
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[13px] font-bold text-[#071A52] transition ${
              uploading
                ? 'pointer-events-none opacity-60'
                : 'cursor-pointer hover:bg-slate-50'
            }`}
          >
            <ImagePlus size={14} />
            {uploading ? 'Uploading' : logoUrl ? 'Change' : 'Add logo'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onChange}
              disabled={uploading}
              className="sr-only"
            />
          </label>
        )}
      </div>

      <div className="mt-4 flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${schoolName} logo`}
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <ImagePlus size={26} />
            <span className="text-xs font-semibold">No logo added yet</span>
          </div>
        )}
      </div>

      {uploading && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#0A2463] transition-all"
              style={{ width: `${progress || 0}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            {progress === null ? 'Uploading logo...' : `Uploading ${progress || 0}%`}
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[13px] leading-5 text-rose-700"
        >
          <p>{error}</p>
          {canRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={uploading}
              className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={13} />
              Retry saving logo
            </button>
          )}
        </div>
      )}

      <p className="mt-3 text-xs leading-5 text-slate-400">
        {canUpload
          ? 'JPG, PNG or WebP up to 5MB. Your new logo appears as soon as the upload finishes.'
          : 'Only school leaders and administrators can change the logo.'}
      </p>
    </section>
  );
}

function ChecklistCard({ progress, loading, loadFailed, restricted }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-[#071A52]">
          Setup checklist
        </h2>
        <span className="text-xs font-bold text-slate-400">
          {progress ? `${progress.completedSteps}/${progress.totalSteps}` : '—'}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#0A2463] transition-all"
          style={{ width: `${progress?.percentage || 0}%` }}
        />
      </div>

      {restricted ? (
        <p className="mt-4 text-[13px] leading-5 text-slate-400">
          Setup progress is available to school leaders and administrators.
        </p>
      ) : loading ? (
        <div className="mt-4 space-y-3" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex items-start gap-2.5">
              <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-slate-100" />
              <div className="min-w-0 flex-1">
                <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                <div className="mt-1.5 h-2.5 w-40 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : loadFailed ? (
        <p className="mt-4 text-[13px] leading-5 text-slate-400">
          Setup progress is unavailable right now.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {SETUP_STEP_ITEMS.map((step) => {
            const done = Boolean(progress?.steps?.[step.key]);

            return (
              <li key={step.key} className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    done
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'border border-slate-200 text-slate-300'
                  }`}
                >
                  {done ? (
                    <Check size={12} />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-[13px] font-semibold ${
                      done ? 'text-slate-700' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-400">
                    {step.description}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function SupportCard() {
  return (
    <section className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5">
      <div className="flex items-center gap-2 text-[#071A52]">
        <LifeBuoy size={17} />
        <h2 className="text-sm font-extrabold">Need a hand?</h2>
      </div>
      <p className="mt-2 text-[13px] leading-5 text-slate-600">
        ScholaNode support can help with your school setup or any portal
        question.
      </p>
      <Link
        to="/help-support"
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-white px-3.5 py-2 text-[13px] font-bold text-[#071A52] transition hover:bg-cyan-50"
      >
        Contact support
        <ArrowUpRight size={14} />
      </Link>
    </section>
  );
}
