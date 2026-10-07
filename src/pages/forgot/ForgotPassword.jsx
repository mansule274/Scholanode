import { useState } from 'react';
import { ArrowLeft, ArrowRight, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import publicAxiosInstance from '../../auth/publicAxiosInstance';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const submittedEmail = email.trim().toLowerCase();

    if (!submittedEmail) {
      setError('Enter the email linked to your school account.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await publicAxiosInstance.post('/auths/forgot-password', {
        email: submittedEmail,
      });
      console.log('Password recovery request response:', response.data);
      navigate('/verify-email', {
        state: { email: submittedEmail, flowType: 'recovery' },
        replace: true,
      });
    } catch (requestError) {
      console.error('Password recovery request failed:', requestError?.response?.data || requestError);
      setError(requestError?.response?.data?.message || 'We could not start recovery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative overflow-hidden bg-[#071A52] p-7 text-white sm:p-10">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-24 border-cyan-300/20" />
          <div className="relative flex h-full flex-col justify-between gap-12">
            <div>
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-[#071A52] shadow-lg shadow-cyan-950/20">
                <KeyRound size={27} />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Account recovery</p>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">A secure way back into your school account.</h1>
              <p className="mt-5 max-w-sm leading-7 text-blue-100">We will send a short verification code to confirm it is really you.</p>
            </div>
            <div className="flex items-start gap-3 border-t border-white/15 pt-5 text-sm text-blue-100">
              <ShieldCheck className="mt-0.5 shrink-0 text-cyan-300" size={19} />
              <span>Your account details remain protected throughout recovery.</span>
            </div>
          </div>
        </aside>

        <section className="p-6 sm:p-10">
          <Link to="/school-login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#071A52]">
            <ArrowLeft size={17} /> Back to login
          </Link>

          <div className="mt-12 max-w-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[#0EA5E9]"><Mail size={23} /></div>
            <h2 className="mt-6 text-3xl font-extrabold text-[#071A52]">Forgot password?</h2>
            <p className="mt-3 leading-7 text-slate-500">Enter your registered email and we will send a verification code to begin resetting your password.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="recovery-email" className="mb-2 block text-sm font-semibold text-slate-700">Registered email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                  <input id="recovery-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} placeholder="you@school.edu.ng" required disabled={loading} className="w-full rounded-2xl border border-slate-200 py-3.5 pl-12 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E9]/10 disabled:bg-slate-50" />
                </div>
              </div>

              {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3.5 font-semibold text-white shadow-lg shadow-[#071A52]/20 transition hover:bg-[#0A2463] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Sending code...' : 'Send verification code'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="mt-8 text-sm text-slate-500">Remember your password? <Link to="/school-login" className="font-semibold text-[#0EA5E9] hover:underline">Return to login</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}
