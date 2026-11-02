import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Settings2,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserContext } from '../../../context/UserContext';
import OwnerSetupPanel from './OwnerSetupPanel';

const quickLinks = [
  ['Students', Users, '/students'],
  ['Staff', GraduationCap, '/staff'],
  ['Classes', Building2, '/classes'],
  ['Subjects', BookOpen, '/subjects'],
  ['Sessions & terms', CalendarDays, '/sessions-terms'],
  ['Results', ClipboardList, '/results'],
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';

  return 'Good evening';
}

export default function AdministrativeDashboard() {
  const { user, school } = useUserContext();
  const isOwner = Boolean(user?.isOwner);
  const greetingName = user?.firstName || 'Admin';
  const schoolName = school?.schoolName || 'Your school';
  const schoolCode = school?.schoolCode || '';

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-5 text-white shadow-sm sm:p-7">
          <div className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full border-[30px] border-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-cyan-400/[0.08] blur-2xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                {isOwner ? 'Owner workspace' : 'School administration'}
              </p>

              <h1 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">
                {getGreeting()}, {greetingName}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                {isOwner
                  ? 'Your school workspace is live. Finish the setup essentials and keep your team moving.'
                  : 'A clear view of your school and the tools you need to run it day to day.'}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-blue-50">
                  <Building2 size={14} className="shrink-0" />
                  <span className="truncate">{schoolName}</span>
                </span>

                {schoolCode && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-blue-50">
                    {schoolCode}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/15 px-3 py-1.5 text-[13px] font-semibold text-emerald-100">
                  <CheckCircle2 size={14} />
                  Account active
                </span>
              </div>
            </div>

            {isOwner ? (
              <OwnerSetupPanel />
            ) : (
              <Link
                to="/school-profile"
                className="inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0A2463] transition hover:bg-blue-50"
              >
                <Settings2 size={16} />
                School settings
              </Link>
            )}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
              Quick navigation
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-[#071A52] sm:text-2xl">
              Manage your school
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {quickLinks.map(([label, Icon, path]) => (
              <Link
                key={label}
                to={path}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0A2463] transition group-hover:bg-cyan-50 group-hover:text-cyan-700">
                  <Icon size={19} />
                </span>

                <span className="min-w-0 flex-1 text-sm font-bold text-slate-700">
                  {label}
                </span>

                <ArrowRight
                  size={15}
                  className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-700"
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
