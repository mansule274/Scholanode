import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import publicAxiosInstance from '../../auth/publicAxiosInstance';

export default function VerifyRecoveryCode() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (event) => {
    event.preventDefault();
    const submittedCode = code.trim();

    if (!email) {
      setError('Your recovery session has expired. Start again from the login page.');
      return;
    }
    if (!submittedCode) {
      setError('Enter the verification code sent to your email.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await publicAxiosInstance.post('/verifications/verify-recovery-code', {
        verificationCode: submittedCode,
        email,
      });
      console.log('Recovery verification response:', response.data);
      setSuccess(response.data?.message || 'Code verified successfully.');
      navigate('/reset-password', {
        replace: true,
        state: { email, resetToken: response.data?.resetToken },
      });
    } catch (requestError) {
      console.error('Recovery verification failed:', requestError?.response?.data || requestError);
      setError(requestError?.response?.data?.message || 'That code could not be verified. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Your recovery session has expired. Start again from the login page.');
      return;
    }

    setError('');
    setSuccess('');
    setResending(true);
    try {
      const response = await publicAxiosInstance.post('/authss/new-verification-code', { email });
      console.log('Recovery code resend response:', response.data);
      setSuccess(response.data?.message || 'A new verification code has been sent.');
    } catch (requestError) {
      console.error('Recovery code resend failed:', requestError?.response?.data || requestError);
      setError(requestError?.response?.data?.message || 'We could not resend the code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative overflow-hidden bg-[#071A52] p-7 text-white sm:p-10">
          <div className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full border-28 border-cyan-300/15" />
          <div className="relative flex h-full flex-col justify-between gap-12">
            <div>
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-[#071A52]"><KeyRound size={27} /></div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Verify identity</p>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">One more step, then you are in control.</h1>
              <p className="mt-5 max-w-sm leading-7 text-blue-100">Use the code in your inbox to securely continue your password recovery.</p>
            </div>
            <div className="flex items-start gap-3 border-t border-white/15 pt-5 text-sm text-blue-100"><ShieldCheck className="mt-0.5 shrink-0 text-cyan-300" size={19} /><span>Never share your verification code with anyone.</span></div>
          </div>
        </aside>

        <section className="p-6 sm:p-10">
          <Link to="/forgot-password" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#071A52]"><ArrowLeft size={17} /> Change email</Link>

          <div className="mt-12 max-w-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[#0EA5E9]"><Mail size={23} /></div>
            <h2 className="mt-6 text-3xl font-extrabold text-[#071A52]">Check your inbox</h2>
            <p className="mt-3 leading-7 text-slate-500">Enter the verification code we sent to:</p>
            <p className="mt-1 break-all font-semibold text-slate-800">{email || 'your registered email'}</p>

            <form onSubmit={handleVerify} className="mt-8 space-y-5">
              <div>
                <label htmlFor="recovery-code" className="mb-2 block text-sm font-semibold text-slate-700">Verification code</label>
                <input id="recovery-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => { setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6)); setError(''); }} placeholder="Enter 6-digit code" required disabled={loading} className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-center text-xl font-bold tracking-[0.45em] text-slate-800 outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E9]/10 disabled:bg-slate-50" />
              </div>

              {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              {success && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 size={17} className="mt-0.5 shrink-0" />{success}</div>}

              <button type="submit" disabled={loading || code.length < 4} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3.5 font-semibold text-white shadow-lg shadow-[#071A52]/20 transition hover:bg-[#0A2463] disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Verifying code...' : 'Verify code'}{!loading && <ArrowRight size={18} />}</button>
            </form>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6 text-sm">
              <span className="text-slate-500">Did not receive it?</span>
              <button type="button" onClick={handleResend} disabled={resending} className="inline-flex items-center gap-2 font-semibold text-[#0EA5E9] hover:text-[#0284C7] disabled:opacity-60"><RefreshCw size={15} className={resending ? 'animate-spin' : ''} />{resending ? 'Resending...' : 'Resend code'}</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
