import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import ChildPageLayout from "./ChildPageLayout";
import { getDisplayName } from "./childDisplay";

function ResultsBody({ child }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <BookOpen size={24} />
      </div>
      <p className="mt-4 text-lg font-bold text-slate-800">
        Results are not available yet
      </p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-500">
        Your school has not published results for {getDisplayName(child)}. They
        will appear here once they are published.
      </p>
      <Link
        to={`/children/${child.id}/profile`}
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#123A8F]"
      >
        <ArrowLeft size={15} />
        Back to profile
      </Link>
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
