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
import { useUserContext } from '../../context/UserContext';
import CreatorActions from '../../components/CreatorActions';

const quickLinks = [
  ['Students', Users, '/students'],
  ['Staff', GraduationCap, '/staff'],
  ['Classes', Building2, '/classes'],
  ['Subjects', BookOpen, '/subjects'],
  ['Sessions & terms', CalendarDays, '/sessions-terms'],
  ['Results', ClipboardList, '/results'],
];

export default function AdministrativeDashboard() {
  const { user, school } = useUserContext();
  const fullName = [user?.firstName, user?.surName || user?.surname || user?.lastName]
    .filter(Boolean)
    .join(' ');
  const schoolName = school?.schoolName || 'Your School';
  const schoolCode = school?.schoolCode || 'school-code';
  const greetingName = user?.firstName || 'Admin';

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-600">
              School administration
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#071A52] sm:text-4xl">
              Good afternoon, {greetingName}
            </h1>
            <p className="mt-2 text-slate-500">
              A clear view of your school and the tools you need to manage it.
            </p>
          </div>

          <Link
            to="/school-profile"
            className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-[#071A52] shadow-sm transition hover:border-cyan-300 hover:text-cyan-700"
          >
            <Settings2 size={17} />
            School settings
          </Link>
        </header>

        <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#071A52]">
              <Building2 size={26} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Your school
              </p>
              <h2 className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">
                {schoolName}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {schoolCode}
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={16} />
            Account active
          </span>
        </section>

        <CreatorActions />

        <section>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
              Quick navigation
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">
              Manage your school
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {quickLinks.map(([label, Icon, path]) => (
              <Link
                key={label}
                to={path}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:shadow-md"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#071A52] group-hover:bg-cyan-50 group-hover:text-cyan-700">
                  <Icon size={18} />
                </span>
                <span className="text-sm font-bold text-slate-700">
                  {label}
                </span>
                <ArrowRight
                  size={14}
                  className="ml-auto hidden text-slate-300 group-hover:text-cyan-600 sm:block"
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}