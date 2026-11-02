import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Headphones,
  LoaderCircle,
  Lock,
  LogIn,
  Mail,
  Phone,
  SearchX,
  Shield,
  User,
} from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import publicAxiosInstance from '../../auth/publicAxiosInstance';
import { useUserContext } from '../../context/UserContext';
import { getSchoolByCode } from '../schoolLookupApi';
import { saveLastSchool } from '../lastSchool';
import {
  formatOwnershipType,
  formatSchoolLevel,
  getSchoolInitials,
} from '../schoolDisplay';
import SchoolSearch from '../components/SchoolSearch';

const normalizeSchoolCode = (schoolCode) =>
  String(schoolCode || '').trim().toUpperCase();

const rememberKeyFor = (schoolCode) =>
  `scholanode:login-id:${normalizeSchoolCode(schoolCode)}`;

const rememberPrefKeyFor = (schoolCode) =>
  `scholanode:login-id-remember:${normalizeSchoolCode(schoolCode)}`;

function readRememberedLoginId(schoolCode) {
  if (!schoolCode) return '';

  try {
    return window.localStorage.getItem(rememberKeyFor(schoolCode)) || '';
  } catch {
    return '';
  }
}

// Remembering is on by default; only an explicit opt-out per school turns it off.
function readRememberPreference(schoolCode) {
  if (!schoolCode) return true;

  try {
    return window.localStorage.getItem(rememberPrefKeyFor(schoolCode)) !== 'off';
  } catch {
    return true;
  }
}

function writeRememberPreference(schoolCode, remember) {
  if (!schoolCode) return;

  try {
    if (remember) {
      window.localStorage.setItem(rememberPrefKeyFor(schoolCode), 'on');
    } else {
      window.localStorage.setItem(rememberPrefKeyFor(schoolCode), 'off');
    }
  } catch {
    // Storage can be unavailable in private browsing; remembering is optional.
  }
}

function writeRememberedLoginId(schoolCode, loginId, remember) {
  if (!schoolCode) return;

  try {
    if (remember && loginId) {
      window.localStorage.setItem(rememberKeyFor(schoolCode), loginId);
    } else {
      window.localStorage.removeItem(rememberKeyFor(schoolCode));
    }
  } catch {
    // Storage can be unavailable in private browsing; remembering is optional.
  }
}

export default function SchoolLoginPage({ onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useUserContext();

  const candidateSchool = location.state?.school;
  const stateSchool =
    candidateSchool && (candidateSchool.schoolCode || candidateSchool.schoolName)
      ? candidateSchool
      : null;
  const codeFromUrl = (searchParams.get('code') || '').trim();

  const [school, setSchool] = useState(stateSchool);
  const [schoolStatus, setSchoolStatus] = useState(
    stateSchool ? 'ready' : codeFromUrl ? 'loading' : 'missing'
  );
  const [schoolError, setSchoolError] = useState('');

  const [loginId, setLoginId] = useState(() =>
    readRememberedLoginId(stateSchool?.schoolCode || codeFromUrl)
  );
  const [rememberLoginId, setRememberLoginId] = useState(() =>
    readRememberPreference(stateSchool?.schoolCode || codeFromUrl)
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const activeSchool = school || stateSchool;
  const resolvedStatus = activeSchool
    ? 'ready'
    : schoolStatus === 'error'
      ? 'error'
      : codeFromUrl
        ? 'loading'
        : 'missing';

  useEffect(() => {
    if (stateSchool || !codeFromUrl) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const result = await getSchoolByCode(codeFromUrl);

        if (cancelled) return;

        if (!result) {
          setSchoolError(
            'No school matches that code. Check the code and try again.'
          );
          setSchoolStatus('error');
          return;
        }

        setSchool(result);
        setSchoolError('');
        setSchoolStatus('ready');

        setLoginId(readRememberedLoginId(result.schoolCode));
        setRememberLoginId(readRememberPreference(result.schoolCode));
      } catch (error) {
        if (cancelled) return;

        setSchoolError(
          error?.response?.data?.message ||
            'We could not load this school. Check your connection and try again.'
        );
        setSchoolStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stateSchool, codeFromUrl]);

  const handleRetry = async () => {
    if (!codeFromUrl) return;

    setSchoolError('');
    setSchoolStatus('loading');

    try {
      const result = await getSchoolByCode(codeFromUrl);

      if (!result) {
        setSchoolError(
          'No school matches that code. Check the code and try again.'
        );
        setSchoolStatus('error');
        return;
      }

      setSchool(result);

      setLoginId(readRememberedLoginId(result.schoolCode));
      setRememberLoginId(readRememberPreference(result.schoolCode));

      setSchoolStatus('ready');
    } catch (error) {
      setSchoolError(
        error?.response?.data?.message ||
          'We could not load this school. Check your connection and try again.'
      );
      setSchoolStatus('error');
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const schoolCode = activeSchool?.schoolCode;
    const trimmedLoginId = loginId.trim();

    if (!schoolCode) {
      setLoginError('Choose your school before signing in.');
      return;
    }

    if (!trimmedLoginId || !password.trim()) {
      setLoginError('Please enter your login ID and password.');
      return;
    }

    setLoading(true);
    setLoginError('');

    try {
      const payload = {
        schoolCode,
        loginId: trimmedLoginId,
        password,
      };

      console.log('Login attempt:', { schoolCode, loginId: trimmedLoginId });

      const response = await publicAxiosInstance.post('/auths/login', payload);
      const token = response.data?.accessToken;

      if (!token) {
        setLoginError(
          'We could not complete the sign-in. Please try again or contact your school administrator.'
        );
        return;
      }

      const responseUser = response.data?.user || null;
      const authPayload = responseUser
        ? response.data
        : { user: null, school: response.data?.school || activeSchool };

      writeRememberPreference(schoolCode, rememberLoginId);
      writeRememberedLoginId(schoolCode, trimmedLoginId, rememberLoginId);
      saveLastSchool(activeSchool);
      login(token, authPayload);
      navigate('/dashboard', { state: { school: activeSchool, user: authPayload.user } });
    } catch (error) {
      console.error('Login request failed:', {
        schoolCode,
        status: error?.response?.status,
        message: error?.response?.data?.message || error?.message,
      });

      setLoginError(
        error?.response?.data?.message ||
          'Login failed. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRememberChange = (event) => {
    const next = event.target.checked;
    setRememberLoginId(next);

    if (!activeSchool?.schoolCode) return;

    writeRememberPreference(activeSchool.schoolCode, next);
    if (!next) writeRememberedLoginId(activeSchool.schoolCode, '', false);
  };

  const schoolName = activeSchool?.schoolName || 'School';
  const schoolCode = activeSchool?.schoolCode || '';
  const levelLabel = formatSchoolLevel(activeSchool?.schoolLevel);
  const ownershipLabel = formatOwnershipType(activeSchool?.ownershipType);
  const supportEmail = activeSchool?.supportEmail || null;
  const supportPhone = activeSchool?.supportPhone || null;
  const hasSupportInfo = Boolean(supportEmail || supportPhone);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => (onBack ? onBack() : navigate('/'))}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#071A52]"
          >
            <ArrowLeft size={17} />
            Back to school search
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#071A52] transition hover:text-[#123A8F]"
          >
            <GraduationCap size={22} />
            ScholaNode
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {resolvedStatus === 'loading' && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="animate-sn-fade-up w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <LoaderCircle
                size={28}
                className="mx-auto animate-spin text-[#123A8F]"
              />
              <p className="mt-4 text-sm font-semibold text-slate-700">
                Loading your school
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Fetching the details for code {codeFromUrl || 'provided'}.
              </p>
            </div>
          </div>
        )}

        {resolvedStatus === 'error' && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="animate-sn-fade-up w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-9">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <SearchX size={26} />
              </div>

              <h1 className="mt-5 text-2xl font-black text-[#071A52]">
                We couldn't load that school
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {schoolError}
              </p>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0A2463]"
                >
                  Try again
                </button>

                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-[#071A52] transition hover:bg-slate-50"
                >
                  Search for your school
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {resolvedStatus === 'missing' && (
          <div className="animate-sn-fade-up mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#123A8F]">
                <GraduationCap size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-black text-[#071A52]">
                  Choose your school first
                </h1>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  School logins are scoped to a single school. Find yours by
                  code to continue.
                </p>
              </div>
            </div>

            <SchoolSearch />
          </div>
        )}

        {resolvedStatus === 'ready' && activeSchool && (
          <>
            <div className="grid items-start gap-6 lg:grid-cols-3">
              <section className="animate-sn-fade-up rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
                <div className="text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                    {activeSchool.logoUrl ? (
                      <img
                        src={activeSchool.logoUrl}
                        alt={`${schoolName} logo`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-2xl font-black text-[#071A52]">
                        {getSchoolInitials(schoolName)}
                      </span>
                    )}
                  </div>

                  <h1 className="mt-5 break-words text-2xl font-black tracking-tight text-[#071A52] sm:text-3xl">
                    {schoolName}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    {schoolCode && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        Code: {schoolCode}
                      </span>
                    )}
                    {levelLabel && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#123A8F]">
                        {levelLabel}
                      </span>
                    )}
                    {ownershipLabel && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {ownershipLabel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="my-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />
                  <Shield size={18} className="text-slate-400" />
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="mb-6 flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#071A52] text-white">
                    <User size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Sign in to your portal
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Use the login ID and password issued by {schoolName}.
                    </p>
                  </div>
                </div>

                <form className="space-y-5" onSubmit={handleLogin} noValidate>
                  <div>
                    <label
                      htmlFor="login-id"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Login ID
                    </label>

                    <div className="relative">
                      <Mail
                        size={19}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="login-id"
                        name="loginId"
                        type="text"
                        autoComplete="username"
                        value={loginId}
                        onChange={(event) => {
                          setLoginId(event.target.value);
                          setLoginError('');
                        }}
                        placeholder="Enter your login ID"
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#071A52] focus:ring-4 focus:ring-[#071A52]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={19}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setLoginError('');
                        }}
                        placeholder="Enter your password"
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-24 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#071A52] focus:ring-4 focus:ring-[#071A52]/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#071A52] transition hover:bg-slate-100"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                    >
                      {loginError}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={rememberLoginId}
                          onChange={handleRememberChange}
                          className="h-4 w-4 accent-[#071A52]"
                        />
                        Remember my login ID
                      </label>

                      <p className="mt-1 pl-6 text-xs leading-5 text-slate-500">
                        Saved only for {schoolCode} on this device.
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-1 text-sm sm:items-end">
                      <Link
                        to="/forgot-password"
                        className="font-semibold text-[#071A52] hover:underline"
                      >
                        Forgot password?
                      </Link>
                      <Link
                        to="/forgot-login-id"
                        className="font-semibold text-[#071A52] hover:underline"
                      >
                        Forgot login ID?
                      </Link>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#071A52]/20 transition hover:bg-[#0A2463] focus:outline-none focus:ring-4 focus:ring-[#071A52]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn size={18} />
                        Sign in
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 space-y-2 border-t border-slate-200 pt-6 text-center">
                  <p className="font-semibold text-slate-800">Need help signing in?</p>
                  <p className="mx-auto max-w-md text-sm leading-6 text-slate-500">
                    If you're having trouble accessing your account, please
                    contact your school administrator.
                  </p>

                  <Link
                    to={`/school-contact${schoolCode ? `?code=${encodeURIComponent(schoolCode)}` : ''}`}
                    state={{ school: activeSchool }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0EA5E9] hover:underline"
                  >
                    Contact {schoolName}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </section>

              <aside className="animate-sn-fade-up space-y-6">
                <InfoCard
                  color="blue"
                  icon={Shield}
                  title="Login instructions"
                  items={[
                    'Students sign in with the admission number issued by their school.',
                    'Teachers and staff use the staff login ID provided by the school.',
                    'Parents use the login details given to them by the school.',
                    'Contact your school administrator if you cannot access your account.',
                  ]}
                />

                <InfoCard
                  color="green"
                  icon={CheckCircle2}
                  title="Account guidelines"
                  items={[
                    'Student, teacher, and parent accounts are created by the school administrator.',
                    'Self-registration is not available.',
                    'Use the recovery links if you have forgotten your password or login ID.',
                  ]}
                />

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                      <Headphones size={21} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      School support
                    </h3>
                  </div>

                  {hasSupportInfo ? (
                    <div className="mt-4 space-y-3">
                      {supportEmail && (
                        <a
                          href={`mailto:${supportEmail}`}
                          className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white"
                        >
                          <Mail size={16} className="shrink-0 text-[#071A52]" />
                          <span className="break-all">{supportEmail}</span>
                        </a>
                      )}

                      {supportPhone && (
                        <a
                          href={`tel:${supportPhone.replace(/[^\d+]/g, '')}`}
                          className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white"
                        >
                          <Phone size={16} className="shrink-0 text-[#071A52]" />
                          <span>{supportPhone}</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-slate-500">
                      This school has not published support contacts yet.
                      Contact your school administrator directly for help with
                      your account.
                    </p>
                  )}
                </section>
              </aside>
            </div>

            {activeSchool.welcomeMessage && (
              <section className="animate-sn-fade-up mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0EA5E9]">
                  About the school
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#071A52]">
                  {schoolName}
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {activeSchool.welcomeMessage}
                </p>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function InfoCard({ icon: Icon, title, items, color = 'blue' }) {
  const styles = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-700',
      text: 'text-blue-900',
      bullet: 'text-blue-600',
    },
    green: {
      bg: 'bg-emerald-50',
      icon: 'bg-emerald-100 text-emerald-700',
      text: 'text-emerald-900',
      bullet: 'text-emerald-600',
    },
  };

  const tone = styles[color];

  return (
    <section className={`rounded-2xl border border-slate-200 p-5 shadow-sm sm:p-6 ${tone.bg}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone.icon}`}>
          <Icon size={21} />
        </div>
        <h3 className={`text-base font-bold ${tone.text}`}>{title}</h3>
      </div>

      <ul className="space-y-3.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
            <CheckCircle2 className={`mt-0.5 shrink-0 ${tone.bullet}`} size={18} />
            <span className="leading-6">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
