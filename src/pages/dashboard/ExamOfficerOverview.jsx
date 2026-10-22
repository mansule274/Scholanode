
import {
  ArrowRight,
  ClipboardCheck,
  FileCheck2,
  FileText,
  GraduationCap,
  ListChecks,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const examActions = [
  {
    title: 'Manage Assessments',
    description: 'Access assessment and examination activities.',
    icon: ClipboardCheck,
    path: '/assessments',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    title: 'Manage Results',
    description: 'Access student results and result-related activities.',
    icon: FileText,
    path: '/results',
    color: 'bg-cyan-50 text-cyan-700',
  },
  {
    title: 'Review Results',
    description: 'Review results where your permissions allow.',
    icon: FileCheck2,
    path: '/results',
    color: 'bg-emerald-50 text-emerald-700',
  },
];

export default function ExamOfficerOverview() {
  return (
    <section className="space-y-5">
      {/* Section heading */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
            <GraduationCap size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Examination Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Access examination and student result management.
            </p>
          </div>
        </div>
      </div>

      {/* Overview banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-5 sm:p-6">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#123A8F] shadow-sm">
            <ListChecks size={14} />
            Exam Officer Workspace
          </span>

          <h3 className="mt-4 text-xl font-bold text-[#071A52]">
            Manage examinations and results
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Access the available assessment and result-management
            features to support accurate academic records across
            your school.
          </p>
        </div>

        <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full border-[22px] border-blue-100/60" />
      </div>

      {/* Exam quick actions */}
      <div>
        <div className="mb-4">
          <h3 className="font-semibold text-slate-800">
            Examination Quick Actions
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Quickly access examination-related features.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {examActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                to={action.path}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`rounded-xl p-3 ${action.color}`}>
                    <Icon size={22} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#123A8F]"
                  />
                </div>

                <h4 className="mt-4 font-semibold text-slate-800">
                  {action.title}
                </h4>

                <p className="mt-2 text-sm leading-5 text-slate-500">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
