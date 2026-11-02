import { ArrowUpRight, MessageSquareText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SchoolComplaintCard({ schoolName }) {
  const complaintCenter = schoolName
    ? `${schoolName}'s complaint center`
    : "your school's complaint center";

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
          <MessageSquareText size={19} />
        </span>
        <div>
          <p className="text-sm font-bold text-[#071A52]">
            Need help or have a concern?
          </p>
          <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
            Send your issue to {complaintCenter}. Your school administration
            will review it and follow up with you.
          </p>
        </div>
      </div>

      <Link
        to="/complaints"
        className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-[13px] font-bold text-[#071A52] transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100"
      >
        Contact your school
        <ArrowUpRight size={15} />
      </Link>
    </section>
  );
}
