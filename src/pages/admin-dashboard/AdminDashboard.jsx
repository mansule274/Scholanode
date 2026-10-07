import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Settings2,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const dashboardData = {
  admin: { firstName: 'Amina' },
  school: { name: 'FUD International School', code: 'fud-international' },
  schoolSetup: { progress: 43, completed: 3, total: 7 },
  academicSetup: { progress: 0, completed: 0, total: 3 },
};

const setupCards = [
  {
    title: 'School profile',
    description: 'Identity, contact details and portal messaging.',
    progress: dashboardData.schoolSetup.progress,
    meta: '3 of 7 complete',
    icon: Settings2,
    path: '/school-profile',
    tone: 'blue',
  },
  {
    title: 'Academic setup',
    description: 'Sessions, classes, arms and subjects.',
    progress: dashboardData.academicSetup.progress,
    meta: '0 of 3 complete',
    icon: GraduationCap,
    path: '/academic-setup',
    tone: 'navy',
  },
  {
    title: 'People and access',
    description: 'Students, teachers and school accounts.',
    progress: null,
    meta: 'Ready when you are',
    icon: Users,
    path: '/students',
    tone: 'cyan',
  },
];

const quickLinks = [
  ['Students', Users, '/students'],
  ['Staff', GraduationCap, '/staff'],
  ['Classes', Building2, '/classes'],
  ['Subjects', BookOpen, '/subjects'],
  ['Sessions & terms', CalendarDays, '/sessions-terms'],
  ['Results', ClipboardList, '/results'],
];

export default function AdminDashboard() {
  const { admin, school } = dashboardData;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-600">School administration</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#071A52] sm:text-4xl">Good afternoon, {admin.firstName}</h1>
            <p className="mt-2 text-slate-500">A clear view of what is ready and what comes next.</p>
          </div>
          <Link to="/school-profile" className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-[#071A52] shadow-sm transition hover:border-cyan-300 hover:text-cyan-700">
            <Settings2 size={17} /> School settings
          </Link>
        </header>

        <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#071A52]"><Building2 size={26} /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Your school</p>
              <h2 className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">{school.name}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{school.code}</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-700"><CheckCircle2 size={16} /> Account active</span>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="relative overflow-hidden rounded-3xl bg-[#071A52] p-7 text-white shadow-xl shadow-[#071A52]/10 sm:p-9">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-36 border-cyan-300/10" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100"><Sparkles size={15} /> Setup overview</div>
              <h2 className="mt-6 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">Build your school workspace at your own pace.</h2>
              <p className="mt-4 max-w-xl leading-7 text-blue-100">Start with the academic calendar, then shape the rest of your school experience around it.</p>
              <Link to="/academic-setup" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-bold text-[#071A52] transition hover:bg-cyan-300">Continue setup <ArrowRight size={17} /></Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Academic readiness</p>
            <div className="mt-5 flex items-end gap-2"><span className="text-6xl font-black tracking-tight text-[#071A52]">0</span><span className="pb-2 text-sm font-bold text-slate-400">%</span></div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-0 rounded-full bg-cyan-400" /></div>
            <p className="mt-4 text-sm leading-6 text-slate-500">Create your first session to unlock the next setup stage.</p>
          </div>
        </section>

        <section>
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">Workspace</p><h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">Setup areas</h2></div>
          <div className="grid gap-4 md:grid-cols-3">
            {setupCards.map(({ title, description, progress, meta, icon: Icon, path, tone }) => (
              <Link key={title} to={path} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md">
                <div className="flex items-start justify-between gap-4"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone === 'navy' ? 'bg-[#071A52] text-white' : tone === 'cyan' ? 'bg-cyan-50 text-cyan-700' : 'bg-blue-50 text-[#071A52]'}`}><Icon size={22} /></div><ArrowRight size={18} className="mt-2 text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-500" /></div>
                <h3 className="mt-6 text-lg font-extrabold text-[#071A52]">{title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{description}</p>
                <div className="mt-5 flex items-center justify-between text-xs font-bold text-slate-500"><span>{meta}</span>{progress !== null && <span>{progress}%</span>}</div>
                {progress !== null && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${progress}%` }} /></div>}
              </Link>
            ))}
          </div>
        </section>

        <section><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">Quick navigation</p><h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">Manage your school</h2></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{quickLinks.map(([label, Icon, path]) => <Link key={label} to={path} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:shadow-md"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#071A52] group-hover:bg-cyan-50 group-hover:text-cyan-700"><Icon size={18} /></span><span className="text-sm font-bold text-slate-700">{label}</span></Link>)}</div></section>
      </div>
    </main>
  );
}
