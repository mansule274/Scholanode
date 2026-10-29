import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { initializePayment } from '../get-start/registrationApi';

export default function PaymentPage() {
  const { state } = useLocation();
  const registration = state?.registration;
  const school = registration?.school;
  const admin = registration?.admin;
  const plan = registration?.plan;
  const hasRegistration = Boolean(school && admin && plan);
  const [paymentState, setPaymentState] = useState({ status: 'idle', message: '' });
  const [paymentDetails, setPaymentDetails] = useState(null);

  const formatCurrency = (value) => {
    if (value === 'FREE' || value === undefined || value === null) return 'Free';
    return `₦${new Intl.NumberFormat('en-NG').format(value)}`;
  };

  const handlePayment = async () => {
    setPaymentState({ status: 'loading', message: '' });

    try {
      const response = await initializePayment(school.id, {
        email: admin.email,
        plan: plan.plan,
        tierId: plan.tierId,
        billingCycle: plan.billingCycle,
        metadata: {
          schoolName: school.schoolName,
          schoolCode: school.schoolCode,
          adminId: admin.id,
        },
      });

      const paymentData = response?.data;
      const paymentUrl = paymentData?.authorizationUrl;

      console.log('Payment initialization response:', response);

      setPaymentDetails(paymentData);

      if (paymentUrl) {
        window.location.assign(paymentUrl);
        return;
      }

      setPaymentState({
        status: 'success',
        message: response?.message || 'Payment initialized successfully.',
      });
    } catch (error) {
        console.error('Payment initialization failed:', error?.response?.data || error.message);    
      setPaymentState({
        status: 'error',
        message: error?.response?.data?.message || 'Unable to initialize payment. Please try again.',
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f8fc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/get-started" className="inline-flex items-center gap-2 text-sm font-bold text-[#071A52] hover:text-cyan-600"><ArrowLeft size={17} /> Back to registration</Link>

        {!hasRegistration ? (
          <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><CreditCard className="mx-auto text-slate-300" size={42} /><h1 className="mt-4 text-2xl font-extrabold text-[#071A52]">Payment details are unavailable</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Start registration again so we can show the plan confirmed by the backend.</p><Link to="/get-started" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white hover:bg-[#0A2463]">Return to registration <ArrowRight size={17} /></Link></section>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-[#071A52] px-6 py-8 text-white sm:px-9"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-[#071A52]"><CreditCard size={23} /></div><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Next step</p><h1 className="mt-2 text-3xl font-black leading-tight">Your school is ready for payment.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">We have confirmed your school and plan selection. Review the details below before payment is connected.</p></div>
              <div className="space-y-6 p-6 sm:p-9"><div className="flex items-start gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#071A52]"><GraduationCap size={23} /></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">School registered</p><h2 className="mt-1 text-xl font-extrabold text-[#071A52]">{school.schoolName}</h2><p className="mt-1 text-sm text-slate-500">School code: <span className="font-bold text-slate-700">{school.schoolCode}</span></p></div><span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><Check size={14} /> Confirmed</span></div><div className="rounded-2xl border border-slate-200 p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Account administrator</p><p className="mt-2 font-bold text-slate-800">{admin.firstName} {admin.lastName}</p><p className="mt-1 text-sm text-slate-500">{admin.email}</p></div><div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4"><ShieldCheck size={19} className="mt-0.5 shrink-0 text-cyan-600" /><p className="text-sm leading-6 text-slate-600">Your final amount is taken from the backend response, so the payment step uses the verified plan price.</p></div></div>
            </section>

            <aside className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">Order summary</p><div className="mt-3 flex items-center justify-between gap-3"><h2 className="text-2xl font-extrabold capitalize text-[#071A52]">{plan.plan} plan</h2><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">{plan.billingCycle}</span></div></div><div className="space-y-4 p-6"><div className="flex items-center justify-between gap-4 text-sm"><span className="text-slate-500">Tier</span><span className="text-right font-bold text-slate-800">{plan.tierId}</span></div><div className="flex items-center justify-between gap-4 text-sm"><span className="text-slate-500">Billing</span><span className="font-bold text-slate-800">{plan.billingCycle}</span></div><div className="border-t border-dashed border-slate-200 pt-5"><div className="flex items-end justify-between gap-4"><span className="font-bold text-slate-700">Total</span><span className="text-3xl font-black text-[#071A52]">{formatCurrency(paymentDetails?.pricing?.price ?? plan.price)}</span></div><p className="mt-1 text-right text-xs text-slate-500">Verified by ScholaNode</p></div>{paymentState.message && <p className={`rounded-xl px-3 py-2 text-xs font-semibold ${paymentState.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>{paymentState.message}</p>}{paymentDetails && <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"><p>Payment reference: <span className="font-bold text-slate-800">{paymentDetails.reference}</span></p><p className="mt-1">Payment ID: <span className="font-bold text-slate-800">{paymentDetails.paymentId}</span></p></div>}<button type="button" onClick={handlePayment} disabled={paymentState.status === 'loading'} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white hover:bg-[#0A2463] disabled:cursor-not-allowed disabled:opacity-60"><LockKeyhole size={17} /> {paymentState.status === 'loading' ? 'Preparing secure checkout...' : 'Proceed to secure payment'}</button><p className="text-center text-xs leading-5 text-slate-400">You will be redirected to the secure payment provider.</p></div></aside>
          </div>
        )}
      </div>
    </main>
  );
}
