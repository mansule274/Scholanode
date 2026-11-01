import { useState } from 'react';
import {
  ArrowRight,
  LoaderCircle,
  Mail,
  Search,
  SearchX,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSchoolByCode } from '../schoolLookupApi';
import {
  formatOwnershipType,
  formatSchoolLevel,
  getSchoolInitials,
} from '../schoolDisplay';

export default function SchoolSearch() {
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle');
  const [school, setSchool] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCodeChange = (event) => {
    setCode(event.target.value);

    if (status !== 'idle') {
      setStatus('idle');
      setErrorMessage('');
      setSchool(null);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setSchool(null);
      setStatus('error');
      setErrorMessage('Enter your school code to continue.');
      return;
    }

    setStatus('searching');
    setSchool(null);
    setErrorMessage('');

    try {
      const result = await getSchoolByCode(trimmedCode);

      if (!result) {
        setStatus('error');
        setErrorMessage(
          'No school matches that code. Check the code and try again.'
        );
        return;
      }

      setSchool(result);
      setStatus('found');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error?.response?.data?.message ||
          (error?.response
            ? 'No school matches that code. Check the code and try again.'
            : 'We could not reach the server. Check your connection and try again.')
      );
    }
  };

  const openSchool = (path) => {
    if (!school?.schoolCode) return;

    navigate(`${path}?code=${encodeURIComponent(school.schoolCode)}`, {
      state: { school },
    });
  };

  const levelLabel = formatSchoolLevel(school?.schoolLevel);
  const ownershipLabel = formatOwnershipType(school?.ownershipType);
  const isSearching = status === 'searching';

  return (
    <section
      id="school-search"
      className="scroll-mt-28 space-y-5"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0EA5E9]">
          School access
        </p>

        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
          Find your school to continue
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Enter your school code, then log in to your portal or send an
          inquiry directly to the school.
        </p>
      </div>

      <form onSubmit={handleSearch} noValidate>
        <label htmlFor="school-code" className="sr-only">
          School code
        </label>

        <div className="relative">
          <Search
            size={19}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="school-code"
            name="schoolCode"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            enterKeyHint="search"
            spellCheck={false}
            value={code}
            onChange={handleCodeChange}
            placeholder="Enter your school code (e.g. FUD)"
            aria-invalid={status === 'error'}
            aria-describedby={status === 'error' ? 'school-code-error' : undefined}
            className={`w-full rounded-2xl border bg-white py-4 pl-12 pr-28 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 sm:pr-36 ${
              status === 'error'
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                : 'border-slate-200 focus:border-[#071A52] focus:ring-[#071A52]/10'
            }`}
          />

          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-2 rounded-xl bg-[#0EA5E9] px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-[#0EA5E9]/20 transition hover:bg-[#0c96d4] focus:outline-none focus:ring-4 focus:ring-[#0EA5E9]/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSearching ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                <span className="hidden sm:inline">Searching...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Find school</span>
                <span className="sm:hidden">Search</span>
              </>
            )}
          </button>
        </div>
      </form>

      {status === 'error' && (
        <div
          id="school-code-error"
          role="alert"
          aria-live="polite"
          className="animate-sn-fade-up flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <SearchX size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-rose-900">
              School lookup failed
            </p>
            <p className="mt-1 text-sm leading-6 text-rose-700">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      {status === 'found' && school && (
        <article className="animate-sn-fade-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2">
                  {school.logoUrl ? (
                    <img
                      src={school.logoUrl}
                      alt={`${school.schoolName} logo`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-lg font-black text-[#071A52]">
                      {getSchoolInitials(school.schoolName)}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="break-words text-lg font-bold leading-6 text-[#071A52]">
                    {school.schoolName}
                  </h4>

                  <p className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    Code: {school.schoolCode}
                  </p>

                  {(levelLabel || ownershipLabel) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {levelLabel && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#123A8F]">
                          {levelLabel}
                        </span>
                      )}
                      {ownershipLabel && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {ownershipLabel}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {school.welcomeMessage && (
              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {school.welcomeMessage}
              </p>
            )}

            {school.supportEmail && (
              <a
                href={`mailto:${school.supportEmail}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0EA5E9] underline-offset-2 hover:underline"
              >
                <Mail size={16} />
                {school.supportEmail}
              </a>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={() => openSchool('/school-contact')}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Contact school
            </button>

            <button
              type="button"
              onClick={() => openSchool('/school-login')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0A2463]"
            >
              Login to portal
              <ArrowRight size={16} />
            </button>
          </div>
        </article>
      )}
    </section>
  );
}
