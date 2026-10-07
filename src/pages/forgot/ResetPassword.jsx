import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import publicAxiosInstance from '../../auth/publicAxiosInstance';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const resetToken = location.state?.resetToken || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!password || password.length < 6) {
      setError('Your new password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!resetToken) {
      setError('Your recovery session has expired. Please start again.');
      return;
    }

    setLoading(true);
    try {
      const response = await publicAxiosInstance.post('/auths/reset-password', {
        token: resetToken,
        password,
      });
      console.log('Password reset response:', response.data);
      setSuccess(response.data?.message || 'Password updated successfully.');
      setPassword('');
      setConfirmPassword('');
      window.setTimeout(() => navigate('/school-login', { replace: true }), 1800);
    } catch (requestError) {
      console.error('Password reset failed:', requestError?.response?.data || requestError);
      setError(requestError?.response?.data?.message || 'We could not update your password. Please request a new code.');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !resetToken) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-10">
        <section className="w-full max-w-md rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600"><LockKeyhole size={26} /></div>
          <h1 className="mt-5 text-2xl font-extrabold text-[#071A52]">Recovery link expired</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">This password reset session is missing or no longer valid. Start a new recovery request.</p>
          <Link to="/forgot-password" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 font-semibold text-white transition hover:bg-[#0A2463]">Start again <ArrowRight size={17} /></Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative overflow-hidden bg-[#071A52] p-7 text-white sm:p-10">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-24 border-cyan-300/20" />
          <div className="relative flex h-full flex-col justify-between gap-12">
            <div>
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-[#071A52]"><KeyRound size={27} /></div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">New credentials</p>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">Make your next sign-in yours.</h1>
              <p className="mt-5 max-w-sm leading-7 text-blue-100">Choose a strong password you can remember and keep your school account protected.</p>
            </div>
            <div className="flex items-start gap-3 border-t border-white/15 pt-5 text-sm text-blue-100"><ShieldCheck className="mt-0.5 shrink-0 text-cyan-300" size={19} /><span>Password recovery is secured for {email}.</span></div>
          </div>
        </aside>

        <section className="p-6 sm:p-10">
          <Link to="/school-login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#071A52]"><ArrowLeft size={17} /> Back to login</Link>
          <div className="mt-12 max-w-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[#0EA5E9]"><LockKeyhole size={23} /></div>
            <h2 className="mt-6 text-3xl font-extrabold text-[#071A52]">Set a new password</h2>
            <p className="mt-3 leading-7 text-slate-500">Create a new password for <span className="font-semibold text-slate-700">{email}</span>.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <PasswordField id="new-password" label="New password" value={password} onChange={setPassword} visible={showPassword} onToggle={() => setShowPassword((current) => !current)} placeholder="At least 6 characters" />
              <PasswordField id="confirm-password" label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} visible={showConfirmPassword} onToggle={() => setShowConfirmPassword((current) => !current)} placeholder="Enter the password again" />

              {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              {success && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3.5 font-semibold text-white shadow-lg shadow-[#071A52]/20 transition hover:bg-[#0A2463] disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Updating password...' : 'Update password'}{!loading && <ArrowRight size={18} />}</button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function PasswordField({ id, label, value, onChange, visible, onToggle, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
        <input id={id} type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required className="w-full rounded-2xl border border-slate-200 py-3.5 pl-12 pr-12 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E9]/10" />
        <button type="button" onClick={onToggle} aria-label={visible ? `Hide ${label}` : `Show ${label}`} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#071A52]">
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
