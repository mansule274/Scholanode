import { useState } from 'react';
import {
  Gift,
  UsersRound,
  ShieldCheck,
  TrendingUp,
  Copy,
  Check,
  Link2,
  Info,
  ArrowRight,
  School,
  Clock3,
  CircleCheck,
} from 'lucide-react';

const MOCK_REFERRAL_CODE = 'SCHOLANODE-REF123';
const MOCK_REFERRAL_LINK =
  'https://scholanode.com/ref/SCHOLANODE-REF123';

const MOCK_REFERRAL_STATS = {
  totalReferrals: 8,
  qualifiedReferrals: 3,
  totalEarned: 24500,
};

const MOCK_EARNINGS = {
  totalEarned: 39500,
  pending: 15000,
  availableToWithdraw: 24500,
};

const MOCK_REFERRALS = [
  {
    school: 'Al-Hikmah Academy',
    status: 'Qualified',
    reward: '₦8,500',
  },
  {
    school: 'Future Scholars School',
    status: 'Qualified',
    reward: '₦7,500',
  },
  {
    school: 'Wisdom International School',
    status: 'Qualified',
    reward: '₦8,500',
  },
  {
    school: 'Excellent Model School',
    status: 'In Progress',
    reward: '—',
  },
  {
    school: 'Bright Future Academy',
    status: 'Trial',
    reward: '—',
  },
];

export default function ReferAndEarn() {
  const [activated, setActivated] = useState(false);
  const [copied, setCopied] = useState('');
  const [payoutAccount, setPayoutAccount] = useState(null);
  const [withdrawFlow, setWithdrawFlow] = useState('idle');
  const [payoutForm, setPayoutForm] = useState({
    bank: '',
    accountNumber: '',
    accountName: '',
  });

  const handleActivate = () => {
    setActivated(true);
  };

  const handleCopy = async (value, type) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(type);

      setTimeout(() => {
        setCopied('');
      }, 1800);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleWithdrawClick = () => {
    if (!payoutAccount) {
      setWithdrawFlow('setup');
      return;
    }

    setWithdrawFlow('confirm');
  };

  const handleSavePayout = (event) => {
    event.preventDefault();

    const bank = payoutForm.bank.trim();
    const accountNumber = payoutForm.accountNumber.trim();
    const accountName = payoutForm.accountName.trim();

    if (!bank || !accountNumber || !accountName) {
      return;
    }

    setPayoutAccount({
      bank,
      accountNumber,
      accountName,
    });

    setPayoutForm({
      bank: '',
      accountNumber: '',
      accountName: '',
    });

    setWithdrawFlow('confirm');
  };

  const handleConfirmWithdrawal = () => {
    setWithdrawFlow('success');
  };

  const handleChangePayout = () => {
    if (!payoutAccount) {
      setPayoutForm({ bank: '', accountNumber: '', accountName: '' });
      setWithdrawFlow('setup');
      return;
    }

    setPayoutForm({
      bank: payoutAccount.bank,
      accountNumber: payoutAccount.accountNumber,
      accountName: payoutAccount.accountName,
    });
    setWithdrawFlow('setup');
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] text-white shadow-2xl">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-14 lg:py-14">

            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <Gift size={17} className="text-cyan-300" />
                Refer & Earn
              </div>

              <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                Help Other Schools Discover ScholarNode
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                Know a school that could benefit from ScholarNode?
                Refer them and earn rewards when the school joins
                and makes qualifying payments.
              </p>

              <div className="mt-7 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-300 backdrop-blur">
                  <TrendingUp size={24} />
                </div>

                <div>
                  <p className="text-sm font-medium text-white/70">
                    Your earning opportunity
                  </p>

                  <p className="mt-0.5 text-2xl font-extrabold sm:text-3xl">
                    Up to{' '}
                    <span className="text-cyan-300">
                      ₦500,000
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-white/60 sm:text-sm">
                    Depending on the schools you refer and their
                    qualifying payments.
                  </p>
                </div>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="hidden items-center justify-center lg:flex">
              <div className="relative flex h-64 w-64 items-center justify-center">
                <div className="absolute h-64 w-64 rounded-full border border-white/10" />
                <div className="absolute h-48 w-48 rounded-full border border-cyan-300/10" />

                <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur">
                  <Gift
                    size={58}
                    strokeWidth={1.5}
                    className="text-cyan-300"
                  />
                </div>

                <div className="absolute right-0 top-8 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs text-white/60">
                    Refer
                  </p>
                  <p className="font-bold text-cyan-300">
                    +₦
                  </p>
                </div>

                <div className="absolute bottom-8 left-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs text-white/60">
                    Earn
                  </p>
                  <p className="font-bold text-white">
                    More
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            WHY REFER
        ====================================================== */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Why Refer Schools?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Help schools discover a better way to manage their
              operations while creating an earning opportunity for
              yourself.
            </p>
          </div>

          <div className="mt-7 grid gap-0 md:grid-cols-2 lg:grid-cols-4">
            <Benefit
              icon={<UsersRound size={22} />}
              title="Help Other Schools"
              description="Introduce schools to a platform designed to simplify school management."
            />

            <Benefit
              icon={<Gift size={22} />}
              title="Earn Rewards"
              description="Earn based on the qualifying subscriptions and payments of schools you refer."
            />

            <Benefit
              icon={<ShieldCheck size={22} />}
              title="Trusted Platform"
              description="Recommend ScholarNode as a platform built to support modern school operations."
            />

            <Benefit
              icon={<TrendingUp size={22} />}
              title="Grow Your Earnings"
              description="The more successful schools you refer, the greater your earning opportunity."
              last
            />
          </div>
        </section>

        {/* =====================================================
            ACTIVATION / ACTIVE REFERRAL
        ====================================================== */}
        {!activated ? (
          <ActivationCard onActivate={handleActivate} />
        ) : (
          <ActivatedReferral
            referralCode={MOCK_REFERRAL_CODE}
            referralLink={MOCK_REFERRAL_LINK}
            copied={copied}
            onCopy={handleCopy}
            payoutAccount={payoutAccount}
            withdrawFlow={withdrawFlow}
            payoutForm={payoutForm}
            setPayoutForm={setPayoutForm}
            onWithdrawClick={handleWithdrawClick}
            onSavePayout={handleSavePayout}
            onConfirmWithdrawal={handleConfirmWithdrawal}
            onChangePayout={handleChangePayout}
            onCloseModal={() => setWithdrawFlow('idle')}
          />
        )}

        {/* =====================================================
            HOW IT WORKS
        ====================================================== */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#071A52]">
              <Info size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                How Refer & Earn Works
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                A simple way to introduce schools to ScholarNode.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <Step
              number="01"
              title="Activate"
              description="Activate your referral account and receive your personal referral code and link."
            />

            <Step
              number="02"
              title="Refer a School"
              description="Share your referral code or link with school owners, principals, administrators or other education professionals."
            />

            <Step
              number="03"
              title="Earn Rewards"
              description="When referred schools meet the qualifying conditions, your referral reward becomes eligible."
            />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
            <Info
              size={18}
              className="mt-0.5 shrink-0 text-[#0EA5E9]"
            />

            <p className="text-sm leading-relaxed text-slate-600">
              Referral rewards are based on the qualifying payments
              made by schools you successfully refer.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}


/* =========================================================
   ACTIVATION CARD
========================================================= */

function ActivationCard({ onActivate }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="pointer-events-none absolute -bottom-20 left-0 h-40 w-full rounded-[50%] bg-blue-50/70 blur-2xl" />

      <div className="relative px-5 py-10 sm:px-7 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0EA5E9]">
            <Gift size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-extrabold text-[#071A52]">
            Activate Your Referral Account
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Activate your referral account to receive your personal
            referral code and link. You can then share them with
            schools, principals, teachers, administrators and other
            education professionals.
          </p>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-sm font-semibold text-slate-800">
              Your referral account is not active yet.
            </p>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Activate now to start referring schools and earning
              rewards.
            </p>
          </div>

          <button
            type="button"
            onClick={onActivate}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0EA5E9] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#0EA5E9]/20 transition hover:bg-[#0284C7] active:scale-[0.98]"
          >
            <Gift size={18} />
            Activate Referral
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}


/* =========================================================
   ACTIVATED REFERRAL
========================================================= */

function ActivatedReferral({
  referralCode,
  referralLink,
  copied,
  onCopy,
  payoutAccount,
  withdrawFlow,
  payoutForm,
  setPayoutForm,
  onWithdrawClick,
  onSavePayout,
  onConfirmWithdrawal,
  onChangePayout,
  onCloseModal,
}) {
  const maskedAccountNumber = payoutAccount
    ? `****${String(payoutAccount.accountNumber).slice(-4)}`
    : '';

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5 sm:p-7">

        {/* =================================================
            ACTIVATED HEADER
        ================================================= */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Check size={24} />
          </div>

          <div>
            <div className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
              Referral Account Activated
            </div>

            <h2 className="mt-2 text-xl font-bold text-slate-900">
              Your referral details are ready
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Share your code or link with schools you want to
              refer to ScholarNode.
            </p>
          </div>
        </div>


        {/* =================================================
            REFERRAL CODE + LINK
        ================================================= */}
        <div className="mt-7 grid gap-5 lg:grid-cols-2">

          <ReferralValue
            icon={<Gift size={18} />}
            label="Your Referral Code"
            value={referralCode}
            helper="Share this code with school owners or administrators."
            copied={copied === 'code'}
            onCopy={() => onCopy(referralCode, 'code')}
          />

          <ReferralValue
            icon={<Link2 size={18} />}
            label="Your Referral Link"
            value={referralLink}
            helper="Share this link directly to invite schools."
            copied={copied === 'link'}
            onCopy={() => onCopy(referralLink, 'link')}
          />

        </div>


        {/* =================================================
            REFERRAL OVERVIEW
        ================================================= */}
        <div className="mt-8">

          <div>
            <h3 className="text-lg font-bold text-[#071A52]">
              Your Referral Overview
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Track the schools you refer and your current earnings.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">

            <StatCard
              icon={<UsersRound size={21} />}
              label="Total Referrals"
              value={MOCK_REFERRAL_STATS.totalReferrals}
              description="Schools referred"
              iconClass="bg-blue-50 text-[#0EA5E9]"
            />

            <StatCard
              icon={<CircleCheck size={21} />}
              label="Qualified"
              value={MOCK_REFERRAL_STATS.qualifiedReferrals}
              description="Successful referrals"
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              icon={<TrendingUp size={21} />}
              label="Total Earned"
              value={`₦${MOCK_REFERRAL_STATS.totalEarned.toLocaleString()}`}
              description="Referral rewards"
              iconClass="bg-amber-50 text-amber-600"
            />

          </div>
        </div>


        {/* =================================================
            REFERRAL LIST
        ================================================= */}
        <div className="mt-8">

          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#071A52]">
                Your Referrals
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                See the progress of schools you have referred.
              </p>
            </div>

            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:block">
              {MOCK_REFERRALS.length} schools
            </span>
          </div>


          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">

            {/* Desktop heading */}
            <div className="hidden grid-cols-[1fr_160px_120px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
              <span>School</span>
              <span>Status</span>
              <span className="text-right">Reward</span>
            </div>


            {MOCK_REFERRALS.map((referral, index) => (
              <div
                key={referral.school}
                className={`grid gap-3 px-4 py-4 sm:grid-cols-[1fr_160px_120px] sm:items-center sm:gap-4 sm:px-5 ${
                  index !== MOCK_REFERRALS.length - 1
                    ? 'border-b border-slate-100'
                    : ''
                }`}
              >

                {/* School */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0EA5E9]">
                    <School size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {referral.school}
                    </p>

                    <p className="text-xs text-slate-400 sm:hidden">
                      {referral.status}
                    </p>
                  </div>
                </div>


                {/* Status */}
                <div>
                  <StatusBadge status={referral.status} />
                </div>


                {/* Reward */}
                <div className="text-left sm:text-right">
                  <p
                    className={`text-sm font-bold ${
                      referral.status === 'Qualified'
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {referral.reward}
                  </p>
                </div>

              </div>
            ))}

          </div>
        </div>


        {/* =================================================
            INFO
        ================================================= */}
        <div className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#071A52]">
                Earnings
              </h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <EarningsSummary
              label="Total Earned"
              value="₦39,500"
              helper="All referral rewards earned"
            />

            <EarningsSummary
              label="Pending"
              value="₦15,000"
              helper="Not yet eligible for withdrawal"
            />

            <EarningsSummary
              label="Available to Withdraw"
              value="₦24,500"
              helper="This is ready to withdraw"
              prominent
            />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Available to Withdraw
                </p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight text-[#071A52]">
                  ₦24,500
                </p>
              </div>

              <button
                type="button"
                onClick={onWithdrawClick}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0EA5E9] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#0EA5E9]/20 transition hover:bg-[#0284C7] active:scale-[0.98]"
              >
                Withdraw ₦24,500
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
          <Info
            size={18}
            className="mt-0.5 shrink-0 text-[#0EA5E9]"
          />

          <p className="text-sm leading-relaxed text-slate-600">
            A referral becomes qualified when the referred school
            meets the required qualifying conditions. Your reward
            is calculated based on the qualifying payments made by
            that school.
          </p>
        </div>

        {withdrawFlow !== 'idle' && (
          <WithdrawalModal
            flow={withdrawFlow}
            payoutAccount={payoutAccount}
            payoutForm={payoutForm}
            setPayoutForm={setPayoutForm}
            maskedAccountNumber={maskedAccountNumber}
            onSavePayout={onSavePayout}
            onConfirmWithdrawal={onConfirmWithdrawal}
            onClose={onCloseModal}
            onChangePayout={onChangePayout}
          />
        )}

      </div>
    </section>
  );
}


/* =========================================================
   EARNINGS SUMMARY
========================================================= */

function EarningsSummary({ label, value, helper, prominent = false }) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        prominent
          ? 'border-[#0EA5E9]/30 bg-gradient-to-br from-[#E0F2FE] to-white text-[#071A52]'
          : 'border-slate-200 bg-white'
      }`}
    >
      <p
        className={`text-sm font-medium ${
          prominent ? 'text-[#071A52]/80' : 'text-slate-500'
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-extrabold tracking-tight ${
          prominent ? 'text-[#071A52]' : 'text-slate-800'
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-1 text-xs ${
          prominent ? 'text-slate-600' : 'text-slate-400'
        }`}
      >
        {helper}
      </p>
    </div>
  );
}


/* =========================================================
   WITHDRAWAL MODAL
========================================================= */

function WithdrawalModal({
  flow,
  payoutAccount,
  payoutForm,
  setPayoutForm,
  maskedAccountNumber,
  onSavePayout,
  onConfirmWithdrawal,
  onClose,
  onChangePayout,
}) {
  const isSetup = flow === 'setup';
  const isConfirm = flow === 'confirm';
  const isSuccess = flow === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        {isSetup && (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-[#071A52]">
                  Set Up Your Payout Account
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Add the bank account where you want to receive your referral earnings. Your account will be saved for future withdrawals.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 transition hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSavePayout} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Bank
                </label>
                <input
                  type="text"
                  value={payoutForm.bank}
                  onChange={(event) =>
                    setPayoutForm((prev) => ({
                      ...prev,
                      bank: event.target.value,
                    }))
                  }
                  placeholder="GTBank"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-[#0EA5E9] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Account Number
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={payoutForm.accountNumber}
                  onChange={(event) =>
                    setPayoutForm((prev) => ({
                      ...prev,
                      accountNumber: event.target.value.replace(/[^0-9]/g, '').slice(0, 10),
                    }))
                  }
                  placeholder="0123456789"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-[#0EA5E9] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Account Name
                </label>
                <input
                  type="text"
                  value={payoutForm.accountName}
                  onChange={(event) =>
                    setPayoutForm((prev) => ({
                      ...prev,
                      accountName: event.target.value,
                    }))
                  }
                  placeholder="Hassan Abubakar"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-[#0EA5E9] focus:bg-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#0EA5E9] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0EA5E9]/20 transition hover:bg-[#0284C7]"
                >
                  Save & Continue
                </button>
              </div>
            </form>
          </>
        )}

        {isConfirm && (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-[#071A52]">
                  Confirm Withdrawal
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 transition hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-500">Amount</span>
                <span className="text-lg font-extrabold text-[#071A52]">₦24,500</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-500">Payout Account</span>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">{payoutAccount?.bank || 'GTBank'}</p>
                  <p className="text-xs text-slate-500">{maskedAccountNumber || '****1234'}</p>
                  <p className="text-xs text-slate-500">{payoutAccount?.accountName || 'Hassan Abubakar'}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={onChangePayout}
                className="font-medium text-[#0EA5E9] transition hover:text-[#0284C7]"
              >
                Change payout account
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onConfirmWithdrawal}
                  className="rounded-xl bg-[#0EA5E9] px-4 py-2.5 font-semibold text-white shadow-lg shadow-[#0EA5E9]/20 transition hover:bg-[#0284C7]"
                >
                  Confirm Withdrawal
                </button>
              </div>
            </div>
          </>
        )}

        {isSuccess && (
          <>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
                ✓
              </div>
            </div>

            <div className="mt-5 text-center">
              <h3 className="text-xl font-bold text-[#071A52]">
                Withdrawal Requested
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Your ₦24,500 withdrawal request has been submitted successfully.
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl bg-[#0EA5E9] px-5 py-3 font-semibold text-white shadow-lg shadow-[#0EA5E9]/20 transition hover:bg-[#0284C7]"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#071A52]">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}


/* =========================================================
   REFERRAL VALUE
========================================================= */

function ReferralValue({
  icon,
  label,
  value,
  helper,
  copied,
  onCopy,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[#071A52]">
          {icon}
        </span>

        <label className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

        <div className="min-w-0 flex-1 overflow-hidden px-2">
          <p className="truncate text-sm font-bold text-[#071A52]">
            {value}
          </p>
        </div>

        <button
          type="button"
          onClick={onCopy}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0EA5E9] hover:bg-blue-50 hover:text-[#071A52]"
        >
          {copied ? (
            <>
              <Check size={16} className="text-emerald-500" />
              Copied
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy
            </>
          )}
        </button>

      </div>

      <p className="mt-2 text-xs text-slate-500">
        {helper}
      </p>
    </div>
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  if (status === 'Qualified') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
        <CircleCheck size={14} />
        Qualified
      </span>
    );
  }

  if (status === 'In Progress') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600">
        <Clock3 size={14} />
        In Progress
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
      <Clock3 size={14} />
      Trial
    </span>
  );
}


/* =========================================================
   BENEFIT
========================================================= */

function Benefit({
  icon,
  title,
  description,
  last = false,
}) {
  return (
    <div
      className={[
        'px-0 py-5 md:px-5 lg:py-2',
        !last ? 'lg:border-r lg:border-slate-200' : '',
      ].join(' ')}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0EA5E9]">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-[#071A52]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}


/* =========================================================
   HOW IT WORKS STEP
========================================================= */

function Step({ number, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#071A52] text-xs font-bold text-white">
          {number}
        </span>

        <h3 className="font-bold text-slate-900">
          {title}
        </h3>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-500">
        {description}
      </p>

    </div>
  );
}