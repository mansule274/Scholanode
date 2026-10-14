import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Circle,
  CircleAlert,
  LoaderCircle,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { getAcademicProgress } from '../pages/academic/academicSetupApi';

const initialProgress = {
  percentage: 0,
  steps: { sessions: false, classes: false, subjects: false },
};

export default function CreatorActions() {
  const { user } = useUserContext();
  const [progress, setProgress] = useState(initialProgress);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.isOwner) return undefined;

    let cancelled = false;

    async function loadProgress() {
      try {
        setLoading(true);
        setError('');
        const response = await getAcademicProgress();
        if (!cancelled) setProgress(normalizeProgress(response));
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError?.response?.data?.message ||
              'We could not load your school setup progress.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProgress();
    return () => {
      cancelled = true;
    };
  }, [user?.isOwner]);

  if (!user?.isOwner) return null;

  const steps = [
    { label: 'Sessions and terms', complete: progress.steps.sessions },
    { label: 'Classes and arms', complete: progress.steps.classes },
    { label: 'Subjects', complete: progress.steps.subjects },
  ];
  const completedSteps = steps.filter((step) => step.complete).length;
  const setupComplete = completedSteps === steps.length;

  return (
    <section className="overflow-hidden rounded-4xl border border-cyan-100 bg-white shadow-xl shadow-blue-950/5">
      <div className="relative overflow-hidden bg-linear-to-br from-[#071A52] via-[#0A2463] to-[#087E9B] px-6 py-7 text-white sm:px-8 sm:py-9">
        <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full border-40 border-cyan-200/10" />
        <div className="absolute -bottom-28 right-1/3 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
              <Sparkles size={15} />
              School creator workspace
            </div>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Bring your school to life.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Your school is yours to shape. Complete the essentials and get
              your academic workspace ready for your team.
            </p>
            <Link
              to={setupComplete ? '/sessions-terms' : '/academic-setup'}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-extrabold text-[#071A52] shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              {setupComplete ? 'Explore your academic setup' : 'Start setting up your school'}
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:p-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-black text-[#071A52] shadow-lg">
              {loading ? <LoaderCircle size={24} className="animate-spin text-cyan-700" /> : `${progress.percentage}%`}
            </div>
            <div>
              <p className="text-sm font-bold text-white">Setup progress</p>
              <p className="mt-1 text-xs text-blue-100">
                {loading ? 'Checking your progress' : `${completedSteps} of ${steps.length} essentials complete`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-700">
                Your launch checklist
              </p>
              <h3 className="mt-1 text-lg font-extrabold text-[#071A52]">
                A strong start, step by step
              </h3>
            </div>
            {loading && <LoaderCircle size={18} className="animate-spin text-cyan-700" />}
          </div>

          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="School setup progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percentage}
          >
            <div
              className="h-full rounded-full bg-linear-to-r from-cyan-500 to-blue-600 transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          {error ? (
            <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
              <CircleAlert size={17} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {steps.map(({ label, complete }) => {
                const Icon = complete ? CheckCircle2 : Circle;
                return (
                  <li key={label} className="flex items-center gap-2.5 text-sm">
                    <Icon size={17} className={complete ? 'text-emerald-600' : 'text-slate-300'} />
                    <span className={complete ? 'font-semibold text-slate-700' : 'text-slate-500'}>
                      {label}
                    </span>
                    {complete && <span className="ml-auto text-xs font-bold text-emerald-700">Ready</span>}
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && !error && (
            <p className="mt-4 text-xs leading-5 text-slate-500">
              {setupComplete
                ? 'Everything is in place. You can review and manage your academic calendar.'
                : 'Complete these essentials to give your team a confident start.'}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <CreatorActionLink
            to="/academic-setup"
            icon={CalendarDays}
            title="Set up academics"
            description="Create sessions, classes and subjects."
            tone="cyan"
          />
          <CreatorActionLink
            to="/staff"
            icon={Users}
            title="Build your team"
            description="Review staff accounts and access."
            tone="blue"
          />
          <CreatorActionLink
            to="/school-profile"
            icon={Building2}
            title="Shape your school profile"
            description="Keep your school information up to date."
            tone="violet"
          />
        </div>
      </div>
    </section>
  );
}

function CreatorActionLink({ to, icon: Icon, title, description, tone }) {
  const toneClasses = {
    cyan: 'bg-cyan-50 text-cyan-800 group-hover:bg-cyan-100',
    blue: 'bg-blue-50 text-blue-800 group-hover:bg-blue-100',
    violet: 'bg-violet-50 text-violet-800 group-hover:bg-violet-100',
  };

  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-3.5 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100 sm:p-4"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${toneClasses[tone]}`}>
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-[#071A52]">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <ArrowRight size={17} className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-700" />
    </Link>
  );
}

function normalizeProgress(response) {
  const payload = response?.data?.data ?? response?.data ?? response ?? {};
  const data = payload?.data ?? payload;
  const backendSteps = data.steps || {};
  const percentage = Number(
    data.progress ?? data.percentage ?? data.completionPercentage ?? 0,
  );

  return {
    percentage: Math.min(100, Math.max(0, percentage)),
    steps: {
      sessions: backendSteps.sessionsAndTerms === true,
      classes: backendSteps.classesAndArms === true,
      subjects: backendSteps.subjects === true,
    },
  };
}