import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import publicAxiosInstance from '../../auth/publicAxiosInstance';

const getSchoolInitials = (school) => {
  const source = school?.name || school?.schoolName || school?.school?.name || 'School';
  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

  return initials || 'S';
};

export default function SchoolSearch() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [school, setSchool] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    setSchool(null);
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Please enter your school code.');
      return;
    }

    setLoading(true);
    try {
      const res = await publicAxiosInstance.get(`/schools/get/${trimmed}`);
      setSchool(res.data?.data || res.data);
    } catch (err) {
      setError('School not found. Check the code and try again.');
      console.error('SchoolSearch: error fetching school', err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSelect = (selectedSchool) => {
    if (!selectedSchool) return;
    navigate('/school-login', {
      state: { school: selectedSchool },
    });
  };

  const contactEmail =
    school?.contactEmail ||
    school?.email ||
    school?.schoolEmail ||
    school?.adminEmail ||
    'support@school.edu.ng';

  return (
    <section className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Search className="text-[#071A52]" />
          Find Your School
        </h3>

        <p className="mt-1 text-slate-500">Enter your school's code to locate it quickly.</p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Enter school code (e.g. fud-international)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-36 transition-all focus:border-[#071A52] focus:outline-none focus:ring-4 focus:ring-[#071A52]/10"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />

        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-2 rounded-2xl bg-[#0EA5E9] px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Find School'}
        </button>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {school && (
        <button
          type="button"
          onClick={() => handleSchoolSelect(school)}
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#071A52]/30 hover:shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-lg font-bold text-[#071A52]">
              {school.logoUrl || school.logo_url ? (
                <img
                  src={school.logoUrl || school.logo_url}
                  alt={school.name || school.schoolName || 'School logo'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{getSchoolInitials(school)}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="truncate font-semibold text-slate-900">
                  {school.name || school.schoolName || 'School'}
                </h4>
                <span className="text-xs font-medium text-slate-500">
                  Code: {school.code || school.schoolCode || code}
                </span>
              </div>

              <div className="mt-3">
                <a
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent('Contact School')}`}
                  onClick={(event) => event.stopPropagation()}
                  className="text-xs font-medium text-[#0EA5E9] underline-offset-2 hover:underline"
                >
                  Contact school
                </a>
              </div>
            </div>
          </div>
        </button>
      )}
    </section>
  );
}