import { useState } from 'react';
import { ArrowRight, School, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearLastSchool, readLastSchool } from '../lastSchool';
import { getSchoolInitials } from '../schoolDisplay';

export default function WelcomeCard() {
  const navigate = useNavigate();
  const [lastSchool, setLastSchool] = useState(readLastSchool);

  const focusSchoolSearch = () => {
    const searchInput = document.getElementById('school-code');
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      searchInput.focus();
    }
  };

  if (!lastSchool) {
    return (
      <div className="animate-sn-fade-up rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#123A8F]">
              <Sparkles size={24} />
            </div>

            <div className="min-w-0">
              <p className="mb-1 text-sm text-slate-500">Remembers your school</p>
              <h3 className="text-xl font-bold text-slate-900">
                No school saved on this device yet
              </h3>
              <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
                ScholaNode simplifies your login: after your first successful
                sign-in, your school is saved on this device, so you won't need
                to search for it again.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <button
              type="button"
              onClick={focusSchoolSearch}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#071A52] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#071A52]/20 transition hover:bg-[#0A2463]"
            >
              Find your school
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    navigate(`/school-login?code=${encodeURIComponent(lastSchool.schoolCode)}`, {
      state: { school: lastSchool },
    });
  };

  const handleChooseAnother = () => {
    clearLastSchool();
    setLastSchool(null);
    focusSchoolSearch();
  };

  return (
    <div className="animate-sn-fade-up rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 text-[#071A52]">
            {lastSchool.logoUrl ? (
              <img
                src={lastSchool.logoUrl}
                alt={`${lastSchool.schoolName} logo`}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-base font-black">
                {getSchoolInitials(lastSchool.schoolName)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="mb-1 text-sm text-slate-500">Your last school</p>
            <h3 className="break-words text-xl font-bold text-slate-900">
              {lastSchool.schoolName}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Code: {lastSchool.schoolCode}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#071A52] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#071A52]/20 transition hover:bg-[#0A2463]"
          >
            Continue to school
            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            onClick={handleChooseAnother}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#071A52] transition hover:underline"
          >
            <School size={15} />
            Not your school? Choose another
          </button>
        </div>
      </div>
    </div>
  );
}
