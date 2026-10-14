import { ArrowLeft, Globe, Mail, MapPin, MessageSquareText, Phone, Send, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function SchoolContactPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const school = location.state?.school || {};

  const schoolName = school.schoolName || school.name || 'School';
  const schoolCode = school.schoolCode || school.code || 'School code';
  const logoUrl = school.logoUrl || school.logo_url || null;
  const supportEmail = school.supportEmail || school.contactEmail || school.email || school.schoolEmail || 'support@school.edu.ng';
  const supportPhone = school.supportPhone || school.phone || school.contactPhone || '+234 800 000 0000';
  const address = school.address || 'School address not provided yet.';
  const website = school.website || '#';
  const welcomeMessage = school.welcomeMessage || 'We are committed to providing a safe and engaging learning environment for your child.';

  const initials = schoolName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('') || 'S';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#071A52] transition hover:underline"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {logoUrl ? (
                  <img src={logoUrl} alt={schoolName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-[#071A52]">{initials}</span>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">School contact</p>
                <h1 className="mt-1 text-2xl font-black text-[#071A52]">{schoolName}</h1>
                <p className="text-sm text-slate-500">{schoolCode}</p>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} />
                Verified school
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">School message</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{welcomeMessage}</p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <Mail className="mt-0.5 text-[#071A52]" size={18} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Email</p>
                <a href={`mailto:${supportEmail}`} className="mt-1 block text-sm font-medium text-slate-700 hover:text-[#071A52] hover:underline">
                  {supportEmail}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <Phone className="mt-0.5 text-[#071A52]" size={18} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Phone</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{supportPhone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <MapPin className="mt-0.5 text-[#071A52]" size={18} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Address</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{address}</p>
              </div>
            </div>

            {website && website !== '#' && (
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                <Globe className="mt-0.5 text-[#071A52]" size={18} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Website</p>
                  <a href={website} target="_blank" rel="noreferrer" className="mt-1 block text-sm font-medium text-slate-700 hover:text-[#071A52] hover:underline">
                    {website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#071A52] text-white">
              <MessageSquareText size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Contact form</p>
              <h2 className="text-xl font-bold text-[#071A52]">Send a message</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#071A52] focus:ring-4 focus:ring-[#071A52]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#071A52] focus:ring-4 focus:ring-[#071A52]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
              <textarea
                rows={5}
                placeholder="Tell the school how we can help you..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#071A52] focus:ring-4 focus:ring-[#071A52]/10"
              />
            </div>

            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A2463]"
            >
              <Send size={16} />
              Send message
            </button>

            <div className="pt-4">
              <Link
                to="/school-login"
                state={{ school }}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#071A52] transition hover:border-slate-300 hover:bg-slate-50"
              >
                Go to login
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
