
import { useEffect, useState } from 'react';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { resendVerification, verifyCode } from './registrationApi';

export default function VerificationModal({
  open,
  registration,
  onProceedToPayment,
}) {
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [resendLoading, setResendLoading] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);



  const email = registration?.data?.user?.email || 'No email available';
 

  // Prevent closing the required verification modal
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  if (!open) return null;

  const handleResend = async () => {
    if (!email || resendLoading || verifying) {
      console.error('VerificationModal: resend called without email', { email, registration });
      setStatusType('error');
      setStatus('Verification email is missing. Please try again from the start.');
      return;
    }

    setResendLoading(true);
    setStatus('');
    setStatusType('info');

    try {
      console.log('VerificationModal: resending code for', email);
      await resendVerification(email);
      setStatusType('info');
      setStatus('New verification code sent. Check your inbox.');
    } catch (err) {
      console.error('VerificationModal: resendVerification failed', err?.response?.data || err);
      setStatusType('error');
      setStatus('Unable to resend verification. Try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyCode = async (codeValue = code) => {
    const trimmedCode = String(codeValue || '').trim();

    if (!email) {
      console.error('VerificationModal: verify attempt without email', { registration });
      setStatusType('error');
      setStatus('Verification email is missing. Please try again from the start.');
      return;
    }

    if (trimmedCode.length !== 6) {
      setStatusType('error');
      setStatus('Please enter the 6-digit code.');
      return;
    }

    setVerifying(true);
    setStatus('');
    setStatusType('info');

    try {
      console.log('VerificationModal: verifying code for', email, 'code length =', trimmedCode.length);
      const ok = await verifyCode(email, trimmedCode);

      if (ok) {
        setStatusType('success');
        setStatus('Email verified. Continuing...');
        onProceedToPayment?.();
      } else {
        setStatusType('error');
        setStatus('Invalid code. Please try again.');
      }
    } catch (err) {
      console.error('VerificationModal: verifyCode failed', {
        email,
        code: trimmedCode,
        error: err?.response?.data || err,
      });
      setStatusType('error');
      setStatus(err?.response?.data?.message || 'Verification failed. Try again later.');
    } finally {
      setVerifying(false);
    }
  };

  const busy = verifying || resendLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        {/* Progress */}
        <div className="mb-5 flex items-center justify-between">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            Step 1 of 2
          </span>
          <span className="text-xs text-slate-500">
            Account setup
          </span>
        </div>

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50">
            <Mail className="text-sky-600" size={23} />
          </div>

          <div>
            <h3
              id="verification-title"
              className="text-xl font-bold text-slate-800"
            >
              Secure your school account
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              One quick step before you continue to payment and school setup.
            </p>
          </div>
        </div>

        {/* Email information */}
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Verification code sent to
          </p>

          <p className="mt-1 break-all text-sm font-semibold text-slate-800">
            {email || 'your email'}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Check your inbox or spam folder.
          </p>
        </div>

        {/* Status */}
        {status && (
          <div
            role="status"
            aria-live="polite"
            className={[
              'mt-4 rounded-lg border p-3 text-sm',
              statusType === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : statusType === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600',
            ].join(' ')}
          >
            {status}
          </div>
        )}

        {/* Code input */}
        <div className="mt-5">
          <label
            htmlFor="verification-code"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            6-digit verification code
          </label>

          <input
            id="verification-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
              setCode(sanitized);
              setStatus('');

              if (sanitized.length === 6 && !busy && email && email !== 'No email available') {
                handleVerifyCode(sanitized);
              }
            }}
            placeholder="Enter code"
            disabled={busy}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-lg font-semibold tracking-[0.35em] text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
          />
        </div>

        {/* Primary action */}
        <button
          type="button"
          onClick={handleVerifyCode}
          disabled={busy || code.length !== 6}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0B256C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {verifying ? 'Verifying...' : 'Verify & Continue'}
          {!verifying && <ArrowRight size={16} />}
        </button>

        {/* Secondary actions */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={busy}
            className="text-sm font-medium text-sky-600 hover:text-sky-700 disabled:opacity-50"
          >
            {resendLoading ? 'Resending...' : 'Resend code'}
          </button>
        </div>

        {/* Reassurance */}
        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
          <ShieldCheck size={16} className="shrink-0 text-slate-400" />

          <p className="text-xs text-slate-500">
            Your email helps protect your school account.
          </p>
        </div>
      </div>
    </div>
  );
}