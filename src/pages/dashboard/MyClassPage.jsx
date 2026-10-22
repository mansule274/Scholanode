import { ArrowLeft, BookOpen, CalendarDays, CheckCircle2, GraduationCap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';

const mockClassData = {
  classLevel: 'JSS 1',
  arm: 'A',
  teacher: 'Mr. Hassan Abubakar',
  studentsCount: 28,
  attendanceToday: 24,
  nextEvent: 'Mathematics Quiz',
  lessons: [
    { subject: 'Mathematics', teacher: 'Mr. Hassan', time: '08:00 - 09:00' },
    { subject: 'English Language', teacher: 'Mrs. Saidu', time: '09:10 - 10:10' },
    { subject: 'Basic Science', teacher: 'Mr. Tukur', time: '10:30 - 11:30' },
  ],
};

export default function MyClassPage() {
  const { user } = useUserContext();
  const formClass = user?.formClass || mockClassData;
  const className = [formClass.classLevel, formClass.arm].filter(Boolean).join(' ');

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-600">Form Master</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#071A52]">My Class</h1>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#071A52]">
                <GraduationCap size={28} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Assigned class</p>
                <h2 className="mt-1 text-2xl font-extrabold text-slate-900">{className || 'Class not assigned'}</h2>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={16} />
              Attendance today: {mockClassData.attendanceToday}/{mockClassData.studentsCount}
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-[#123A8F]"><Users size={18} /></div>
              <div>
                <p className="text-sm text-slate-500">Students</p>
                <p className="text-2xl font-bold text-slate-900">{mockClassData.studentsCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-3 text-violet-700"><CalendarDays size={18} /></div>
              <div>
                <p className="text-sm text-slate-500">Next event</p>
                <p className="text-lg font-bold text-slate-900">{mockClassData.nextEvent}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700"><BookOpen size={18} /></div>
              <div>
                <p className="text-sm text-slate-500">Teacher</p>
                <p className="text-lg font-bold text-slate-900">{mockClassData.teacher}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Class timetable</h3>
            <div className="mt-5 space-y-4">
              {mockClassData.lessons.map((lesson) => (
                <div key={lesson.subject} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{lesson.subject}</p>
                      <p className="mt-1 text-sm text-slate-500">{lesson.teacher}</p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{lesson.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Quick links</h3>
            <div className="mt-5 space-y-3">
              <Link to="/attendance" className="block rounded-2xl border border-blue-100 bg-blue-50 p-4 font-semibold text-[#123A8F]">Take attendance</Link>
              <Link to="/classes" className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 font-semibold text-slate-700">View classes</Link>
              <Link to="/sessions-terms" className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 font-semibold text-slate-700">Academic sessions</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
