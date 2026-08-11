import { ChevronRight } from 'lucide-react';

const schools = [
  'FUD International School',
  'Skyline Academy',
  'Green Valley School',
  'Excellence College',
  'Bright Future Academy',
];

export default function SchoolList() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">All Schools</h3>

        <select className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#071A52]/20">
          <option>All Schools</option>
        </select>
      </div>

      <div className="space-y-3">
        {schools.map((school, index) => (
          <button
            key={school}
            className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 hover:border-[#071A52]/30 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-[#071A52]">
                {index + 1}
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 group-hover:text-[#071A52] transition-colors">
                  {school}
                </h4>
                <p className="text-sm text-slate-500">
                  {school.toLowerCase().replace(/\s+/g, '-')}
                </p>
              </div>
            </div>

            <ChevronRight className="text-slate-400 group-hover:text-[#071A52] transition-colors" />
          </button>
        ))}
      </div>

      <div className="text-center pt-2">
        <button className="px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:border-[#071A52] hover:text-[#071A52] transition-all cursor-pointer">
          Load More Schools
        </button>
      </div>
    </section>
  );
}