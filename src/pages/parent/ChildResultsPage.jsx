import { useEffect, useState } from "react";
import {
  AlertCircle,
  Award,
  BookOpen,
  GraduationCap,
  Percent,
  RefreshCw,
} from "lucide-react";
import ChildPageLayout from "./ChildPageLayout";
import { formatTermName, getPeriodLabel } from "./childDisplay";
import { fetchChildResults, RESULT_TERMS } from "./childResultsPreview";

const gradeStyles = {
  A: "border-emerald-200 bg-emerald-50 text-emerald-700",
  B: "border-sky-200 bg-sky-50 text-sky-700",
  C: "border-blue-200 bg-blue-50 text-blue-700",
  D: "border-amber-200 bg-amber-50 text-amber-700",
  E: "border-orange-200 bg-orange-50 text-orange-700",
  F: "border-rose-200 bg-rose-50 text-rose-700",
};

function GradePill({ grade }) {
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-black ${
        gradeStyles[grade] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {grade}
    </span>
  );
}

function SummaryTile({ icon: Icon, iconClass, label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <Icon size={12} className={iconClass} />
        {label}
      </div>
      <p className="mt-1.5 text-lg font-extrabold leading-none text-[#071A52]">
        {value}
      </p>
      {hint && <p className="mt-1 text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[76px] animate-pulse rounded-xl bg-slate-100"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

function ResultsBody({ child }) {
  const [termName, setTermName] = useState(RESULT_TERMS[0].termName);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const selectedTerm =
    RESULT_TERMS.find((term) => term.termName === termName) || RESULT_TERMS[0];

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchChildResults({
          studentId: child.id,
          termName,
        });
        if (cancelled) return;

        setResults(data);
      } catch (requestError) {
        if (cancelled) return;

        setResults(null);
        setError(
          requestError?.message ||
            "We could not load these results. Check your connection and try again."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [child.id, termName, reloadToken]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-sm font-extrabold text-[#071A52]">
            Term results
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {getPeriodLabel(selectedTerm)}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select term">
          {RESULT_TERMS.map((term) => {
            const active = term.termName === termName;

            return (
              <button
                key={term.termName}
                type="button"
                onClick={() => setTermName(term.termName)}
                aria-pressed={active}
                className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                  active
                    ? "bg-[#071A52] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {formatTermName(term.termName)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-rose-600">
              <AlertCircle size={18} />
            </div>
            <p className="mt-2.5 text-sm font-bold text-slate-800">
              Results could not be loaded
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setReloadToken((value) => value + 1)}
              className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#071A52] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#123A8F]"
            >
              <RefreshCw size={13} />
              Try again
            </button>
          </div>
        ) : loading || !results ? (
          <ResultsSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <SummaryTile
                icon={Percent}
                iconClass="text-emerald-600"
                label="Average"
                value={`${results.summary.average}%`}
                hint={`${results.summary.subjectCount} subjects`}
              />
              <SummaryTile
                icon={Award}
                iconClass="text-amber-600"
                label="Position"
                value={`${results.summary.position} of ${results.summary.classSize}`}
                hint="In class"
              />
              <SummaryTile
                icon={BookOpen}
                iconClass="text-blue-600"
                label="Subjects"
                value={results.summary.subjectCount}
                hint="Offered this term"
              />
              <SummaryTile
                icon={GraduationCap}
                iconClass="text-violet-600"
                label="Grade"
                value={results.summary.grade}
                hint={results.summary.gradeRemark}
              />
            </div>

            <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-100 md:block">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 pl-3 pr-3">Subject</th>
                    <th className="px-2 py-2.5 text-center">CA 1</th>
                    <th className="px-2 py-2.5 text-center">CA 2</th>
                    <th className="px-2 py-2.5 text-center">Exam</th>
                    <th className="px-2 py-2.5 text-center">Total</th>
                    <th className="px-2 py-2.5 text-center">Grade</th>
                    <th className="pl-2 pr-3 py-2.5">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.subjects.map((subject) => (
                    <tr key={subject.subjectId} className="text-slate-700">
                      <td className="py-2.5 pl-3 pr-3 font-semibold text-slate-800">
                        {subject.subjectName}
                      </td>
                      <td className="px-2 py-2.5 text-center">{subject.ca1}</td>
                      <td className="px-2 py-2.5 text-center">{subject.ca2}</td>
                      <td className="px-2 py-2.5 text-center">{subject.exam}</td>
                      <td className="px-2 py-2.5 text-center font-extrabold text-[#071A52]">
                        {subject.total}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <GradePill grade={subject.grade} />
                      </td>
                      <td className="pl-2 pr-3 py-2.5 text-[11px] text-slate-500">
                        {subject.remark}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 space-y-2 md:hidden">
              {results.subjects.map((subject) => (
                <div
                  key={subject.subjectId}
                  className="rounded-xl border border-slate-100 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {subject.subjectName}
                    </p>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span className="text-sm font-extrabold text-[#071A52]">
                        {subject.total}
                      </span>
                      <GradePill grade={subject.grade} />
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    CA 1 {subject.ca1} · CA 2 {subject.ca2} · Exam{" "}
                    {subject.exam}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Class teacher&apos;s remark
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-700">
                {results.teacherRemark}
              </p>
            </div>

            <p className="mt-3 text-[10px] text-slate-400">
              Results shown here are a preview until your school publishes them.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export default function ChildResultsPage() {
  return (
    <ChildPageLayout section="results" title="Results">
      {({ child }) => <ResultsBody child={child} />}
    </ChildPageLayout>
  );
}
