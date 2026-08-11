import { Search } from 'lucide-react';

export default function SchoolSearch() {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Search className="text-[#071A52]" />
          Find Your School
        </h3>
        <p className="text-slate-500 mt-1">
          Search for your school to access your portal
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search school by name..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#071A52]/10 focus:border-[#071A52] transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
      </div>
    </section>
  );
}