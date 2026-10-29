import { School, ArrowRight } from 'lucide-react';

export default function WelcomeCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#071A52]">
            <School size={28} />
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">Welcome back!</p>
            <h3 className="text-xl font-bold text-slate-900">
              FUD International School
            </h3>
            <p className="text-slate-500">fud-international</p>

            <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" defaultChecked className="accent-[#071A52]" />
              Remember my last school
            </label>
          </div>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-3">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#071A52] text-white hover:bg-[#0A2463] shadow-lg shadow-[#071A52]/20 transition-all cursor-pointer">
            Continue to School
            <ArrowRight size={18} />
          </button>

          <a href="#" className="text-sm text-[#071A52] hover:underline cursor-pointer">
            Not your school? Choose another
          </a>
        </div>
      </div>
    </div>
  );
}