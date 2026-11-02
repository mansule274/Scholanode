import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  CircleAlert,
  LoaderCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserContext } from '../../../context/UserContext';
import { getAcademicProgress } from '../academic/academicSetupApi';

const initialProgress = {
  percentage: 0,
  steps: { sessions: false, classes: false, subjects: false, workingDays: false },
};

export default function OwnerSetupPanel() {
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
    { label: 'Sessions & terms', complete: progress.steps.sessions },
    { label: 'Classes & arms', complete: progress.steps.classes },
    { label: 'Subjects', complete: progress.steps.subjects },
    { label: 'Working days', complete: progress.steps.workingDays },
  ];
  const completedSteps = steps.filter((step) => step.complete).length;
  const setupComplete = completedSteps === steps.length;

  return (
    <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur lg:max-w-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
            Owner setup
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {loading
              ? 'Checking your progress…'
              : setupComplete
                ? 'Everything is ready'
                : `${completedSteps} of ${steps.length} essentials done`}
          </p>
        </div>

        <p className="shrink-0 text-3xl font-black leading-none text-white">
          {loading ? (
            <LoaderCircle size={26} className="animate-spin text-cyan-200" />
          ) : (
            `${progress.percentage}%`
          )}
        </p>
      </div>

      <div
        className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-white/15"
        role="progressbar"
        aria-label="School setup progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percentage}
      >
        <div
          className="h-full rounded-full bg-cyan-300 transition-all duration-500"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-3.5 flex items-start gap-2 rounded-xl bg-rose-500/15 p-2.5 text-[13px] leading-5 text-rose-100"
        >
          <CircleAlert size={15} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      ) : (
        <ul className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-2">
          {steps.map(({ label, complete }) => {
            const Icon = complete ? CheckCircle2 : Circle;

            return (
              <li
                key={label}
                className={`flex items-center gap-1.5 text-[13px] ${
                  complete ? 'text-white' : 'text-blue-100'
                }`}
              >
                <Icon
                  size={14}
                  className={complete ? 'text-cyan-300' : 'text-blue-200/70'}
                />
                <span className="truncate">{label}</span>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        to={setupComplete ? '/sessions-terms' : '/academic-setup'}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0A2463] transition hover:bg-cyan-50"
      >
        {setupComplete ? 'Review academic setup' : 'Continue setup'}
        <ArrowRight size={16} />
      </Link>
    </div>
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
      workingDays: backendSteps.workingDays === true,
    },
  };
}
