import {
  ArrowRight,
  Check,
  GraduationCap,
  ShieldCheck,
  Receipt,
  CreditCard,
  Building2,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function PaymentSuccessPage() {
  const { state } = useLocation();

  const payment = state?.payment;
  const school = state?.school;
  const admin = state?.admin;
  const plan = state?.plan;

  const formatCurrency = (value) => {
    if (
      value === 'FREE' ||
      value === undefined ||
      value === null
    ) {
      return 'Free';
    }

    return `₦${new Intl.NumberFormat('en-NG').format(value)}`;
  };

  return (
    <main className="min-h-screen bg-[#f6f8fc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] text-white shadow-xl">
          <div className="relative overflow-hidden">
            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

            <div className="relative px-6 py-12 text-center sm:px-10 sm:py-16">

              {/* Success icon */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 shadow-lg shadow-emerald-950/20">
                <Check
                  size={42}
                  strokeWidth={3}
                  className="text-[#071A52]"
                />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
                Payment successful
              </p>

              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                Welcome to ScholaNode!
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                Your payment has been confirmed and your school subscription
                is now active. Your school is ready to get started.
              </p>
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#071A52]">
                <GraduationCap size={24} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
                  School activated
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">
                  {school?.schoolName || 'Your School'}
                </h2>

                {school?.schoolCode && (
                  <p className="mt-1 text-sm text-slate-500">
                    School code:{' '}
                    <span className="font-bold text-slate-700">
                      {school.schoolCode}
                    </span>
                  </p>
                )}
              </div>

              <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <Check size={14} />
                Active
              </span>
            </div>

            {/* What's next */}
            <div className="mt-8">
              <h3 className="text-lg font-extrabold text-[#071A52]">
                You're ready to get started
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Your school account has been created successfully. You can
                now continue setting up your school.
              </p>

              <div className="mt-5 space-y-3">

                <NextStep
                  number="1"
                  title="Complete your school setup"
                  description="Add classes, subjects, teachers and other school information."
                />

                <NextStep
                  number="2"
                  title="Add your school staff"
                  description="Create accounts for teachers and other staff members."
                />

                <NextStep
                  number="3"
                  title="Start managing your school"
                  description="Begin managing students, attendance, results and communication."
                />

              </div>
            </div>

            {/* Security note */}
            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-cyan-600"
              />

              <p className="text-sm leading-6 text-slate-600">
                Your payment was processed securely. You can safely continue
                to your school dashboard.
              </p>
            </div>

          </section>

          {/* Right */}
          <aside className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            {/* Summary header */}
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#071A52]">
                  <Receipt size={21} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
                    Payment confirmation
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-[#071A52]">
                    Order summary
                  </h2>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">

              {/* Plan */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Plan
                </span>

                <span className="font-bold capitalize text-slate-800">
                  {plan?.plan || 'Starter'} Plan
                </span>
              </div>

              {/* Billing */}
              {plan?.billingCycle && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Billing
                  </span>

                  <span className="font-bold capitalize text-slate-800">
                    {plan.billingCycle}
                  </span>
                </div>
              )}

              {/* Amount */}
              <div className="border-t border-dashed border-slate-200 pt-5">
                <div className="flex items-end justify-between gap-4">
                  <span className="font-bold text-slate-700">
                    Amount paid
                  </span>

                  <span className="text-3xl font-black text-[#071A52]">
                    {formatCurrency(
                      payment?.amount ?? plan?.price
                    )}
                  </span>
                </div>
              </div>

              {/* Reference */}
              {payment?.reference && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard
                      size={18}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Payment reference
                      </p>

                      <p className="mt-1 break-all text-sm font-bold text-slate-700">
                        {payment.reference}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin */}
              {admin && (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <Building2
                      size={18}
                      className="mt-0.5 shrink-0 text-[#0EA5E9]"
                    />

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Account administrator
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {admin.firstName} {admin.lastName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {admin.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <Link
                to="/admin-dashboard"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#071A52]/10 transition hover:bg-[#0A2463]"
              >
                Go to School Dashboard
                <ArrowRight size={18} />
              </Link>

              <p className="text-center text-xs leading-5 text-slate-400">
                Your subscription is active and your school account is ready.
              </p>

            </div>
          </aside>
        </div>

        {/* Bottom */}
        <div className="mt-6 flex items-center justify-center gap-2 px-4 pb-4 text-center text-sm text-slate-500">
          <ShieldCheck
            size={18}
            className="shrink-0 text-[#0EA5E9]"
          />

          <p>
            Thank you for choosing ScholaNode to manage your school.
          </p>
        </div>

      </div>
    </main>
  );
}


/* =========================================================
   Reusable Components
========================================================= */

function NextStep({ number, title, description }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#071A52] text-sm font-bold text-white">
        {number}
      </div>

      <div>
        <h4 className="font-bold text-slate-800">
          {title}
        </h4>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}