import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  UserRound,
  Tag,
  ClipboardCheck,
  Check,
  Info,
  ShieldCheck,
  Eye,
  EyeOff,
  LockKeyhole,
} from 'lucide-react';

const starterTiers = [
  {
    id: 'starter-100',
    label: 'Up to 100 Students',
    maxStudents: 100,
    price: 5000,
  },
  {
    id: 'starter-200',
    label: '101 – 200 Students',
    maxStudents: 200,
    price: 8000,
  },
  {
    id: 'starter-300',
    label: '201 – 300 Students',
    maxStudents: 300,
    price: 12000,
  },
  {
    id: 'starter-301',
    label: '301+ Students',
    maxStudents: Infinity,
    price: 15000,
  },
];

const steps = [
  'School Information',
  'Administrator Information',
  'Choose Plan',
  'Review & Finish',
];

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG').format(amount);
}

export default function GetStarted() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: '',
    schoolType: '',
    state: '',
    lga: '',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    studentCount: '',
    academicSession: '',

    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminRole: '',
    password: '',
    confirmPassword: '',

    plan: 'free',
    starterTier: 'starter-100',
  });

  const selectedTier = useMemo(
    () =>
      starterTiers.find((tier) => tier.id === formData.starterTier) ||
      starterTiers[0],
    [formData.starterTier]
  );

  const selectedPrice =
    formData.plan === 'starter' ? selectedTier.price : 0;

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const suggestStarterTier = (studentCount) => {
    const count = Number(studentCount);

    if (!count || count <= 100) {
      return 'starter-100';
    }

    if (count <= 200) {
      return 'starter-200';
    }

    if (count <= 300) {
      return 'starter-300';
    }

    return 'starter-301';
  };

  const handleStudentCountChange = (value) => {
    updateField('studentCount', value);

    if (formData.plan === 'starter' && value) {
      updateField('starterTier', suggestStarterTier(value));
    }
  };

  const handlePlanChange = (plan) => {
    updateField('plan', plan);

    if (plan === 'starter' && formData.studentCount) {
      updateField(
        'starterTier',
        suggestStarterTier(formData.studentCount)
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.plan === 'free') {
      console.log('Create Free School', formData);
      return;
    }

    console.log('Continue to payment', {
      ...formData,
      selectedTier,
      price: selectedPrice,
    });
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] text-white shadow-2xl">
          <div className="relative overflow-hidden">
            <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="relative px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <Building2 size={17} />
                School Registration
              </div>

              <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                Get Started with ScholaNode
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                Create your school account in a few simple steps and
                choose the plan that fits your school today.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="absolute left-[12%] right-[12%] top-5 hidden h-0.5 bg-slate-200 sm:block" />

          <div className="relative grid grid-cols-4 gap-2">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const completed = currentStep > stepNumber;
              const active = currentStep === stepNumber;

              return (
                <button
                  type="button"
                  key={step}
                  onClick={() => {
                    if (completed) {
                      setCurrentStep(stepNumber);
                    }
                  }}
                  className="group flex flex-col items-center text-center"
                >
                  <span
                    className={[
                      'z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all',
                      completed || active
                        ? 'border-[#071A52] bg-[#071A52] text-white'
                        : 'border-slate-300 bg-white text-slate-500',
                    ].join(' ')}
                  >
                    {completed ? <Check size={18} /> : stepNumber}
                  </span>

                  <span
                    className={[
                      'mt-2 text-[11px] font-medium sm:text-sm',
                      active || completed
                        ? 'text-[#071A52]'
                        : 'text-slate-500',
                    ].join(' ')}
                  >
                    {step}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-7xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8"
      >
        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left column */}
          <div className="space-y-6">
            {/* School Information */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeader
                icon={<Building2 size={24} />}
                title="School Information"
                description="Tell us about your school"
              />

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <InputField
                  label="School Name"
                  required
                  value={formData.schoolName}
                  onChange={(e) =>
                    updateField('schoolName', e.target.value)
                  }
                  placeholder="ABC International School"
                />

                <SelectField
                  label="School Type"
                  required
                  value={formData.schoolType}
                  onChange={(e) =>
                    updateField('schoolType', e.target.value)
                  }
                  options={[
                    'Primary School',
                    'Secondary School',
                    'Primary & Secondary',
                  ]}
                />

                <SelectField
                  label="State"
                  required
                  value={formData.state}
                  onChange={(e) =>
                    updateField('state', e.target.value)
                  }
                  options={[
                    'Abuja (FCT)',
                    'Jigawa',
                    'Kano',
                    'Kaduna',
                    'Lagos',
                    'Katsina',
                    'Bauchi',
                  ]}
                />

                <InputField
                  label="LGA"
                  required
                  value={formData.lga}
                  onChange={(e) => updateField('lga', e.target.value)}
                  placeholder="Dutse"
                />

                <div className="sm:col-span-2">
                  <InputField
                    label="School Address"
                    required
                    value={formData.schoolAddress}
                    onChange={(e) =>
                      updateField('schoolAddress', e.target.value)
                    }
                    placeholder="No. 12 Education Road"
                  />
                </div>

                <InputField
                  label="School Phone Number"
                  required
                  type="tel"
                  value={formData.schoolPhone}
                  onChange={(e) =>
                    updateField('schoolPhone', e.target.value)
                  }
                  placeholder="08012345678"
                />

                <InputField
                  label="School Email Address"
                  required
                  type="email"
                  value={formData.schoolEmail}
                  onChange={(e) =>
                    updateField('schoolEmail', e.target.value)
                  }
                  placeholder="info@school.edu.ng"
                />

                <InputField
                  label="Current / Expected Students"
                  required
                  type="number"
                  min="1"
                  value={formData.studentCount}
                  onChange={(e) =>
                    handleStudentCountChange(e.target.value)
                  }
                  placeholder="250"
                />

                <SelectField
                  label="Academic Session"
                  required
                  value={formData.academicSession}
                  onChange={(e) =>
                    updateField('academicSession', e.target.value)
                  }
                  options={[
                    '2026/2027',
                    '2027/2028',
                    '2028/2029',
                  ]}
                />
              </div>

              <InfoBox>
                You can update your school information anytime from
                your school settings.
              </InfoBox>
            </section>

            {/* Administrator */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeader
                icon={<UserRound size={24} />}
                title="Administrator Information"
                description="Create the initial school admin account."
              />

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Full Name"
                  required
                  value={formData.adminName}
                  onChange={(e) =>
                    updateField('adminName', e.target.value)
                  }
                  placeholder="Full name"
                />

                <InputField
                  label="Email Address"
                  required
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) =>
                    updateField('adminEmail', e.target.value)
                  }
                  placeholder="admin@school.edu.ng"
                />

                <InputField
                  label="Phone Number"
                  required
                  type="tel"
                  value={formData.adminPhone}
                  onChange={(e) =>
                    updateField('adminPhone', e.target.value)
                  }
                  placeholder="08012345678"
                />

                <SelectField
                  label="Position / Role"
                  required
                  value={formData.adminRole}
                  onChange={(e) =>
                    updateField('adminRole', e.target.value)
                  }
                  options={[
                    'Proprietor / Owner',
                    'Principal',
                    'Administrator',
                    'School Manager',
                  ]}
                />

                <PasswordField
                  label="Password"
                  required
                  value={formData.password}
                  visible={showPassword}
                  onToggle={() =>
                    setShowPassword((prev) => !prev)
                  }
                  onChange={(e) =>
                    updateField('password', e.target.value)
                  }
                  placeholder="Create password"
                />

                <PasswordField
                  label="Confirm Password"
                  required
                  value={formData.confirmPassword}
                  visible={showConfirmPassword}
                  onToggle={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  onChange={(e) =>
                    updateField('confirmPassword', e.target.value)
                  }
                  placeholder="Confirm password"
                />
              </div>

              <InfoBox>
                You will be able to add teachers, students and staff
                after registration.
              </InfoBox>
            </section>
          </div>

          {/* Right column */}
          <div>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:sticky lg:top-6">
              <SectionHeader
                icon={<Tag size={24} />}
                title="Choose Your Plan"
                description="Start for free or choose Starter based on your school size."
              />

              <div className="mt-6 space-y-4">
                {/* FREE */}
                <PlanCard
                  selected={formData.plan === 'free'}
                  onClick={() => handlePlanChange('free')}
                  badge="FREE"
                  title="Free Plan"
                  description="Perfect for schools exploring ScholaNode"
                  price="₦0"
                  features={[
                    'Basic student & teacher management',
                    'Announcements',
                    'Basic school management',
                    'Email support',
                  ]}
                />

                {/* STARTER */}
                <div
                  className={[
                    'rounded-3xl border-2 p-5 transition-all',
                    formData.plan === 'starter'
                      ? 'border-[#0EA5E9] bg-blue-50/30 shadow-lg shadow-[#0EA5E9]/10'
                      : 'border-slate-200 bg-white',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    onClick={() => handlePlanChange('starter')}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-3">
                      <Radio selected={formData.plan === 'starter'} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-slate-900">
                              Starter Plan
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              All core features to run your school smoothly.
                            </p>
                          </div>

                          <span className="rounded-lg bg-[#0EA5E9] px-3 py-1 text-xs font-semibold text-white">
                            Recommended
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {formData.plan === 'starter' && (
                    <div className="mt-6">
                      <p className="mb-3 text-sm font-semibold text-slate-800">
                        Choose the student range that fits your school:
                      </p>

                      <div className="space-y-2">
                        {starterTiers.map((tier) => (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() =>
                              updateField('starterTier', tier.id)
                            }
                            className={[
                              'flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all',
                              formData.starterTier === tier.id
                                ? 'border-[#0EA5E9] bg-white shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300',
                            ].join(' ')}
                          >
                            <Radio
                              selected={
                                formData.starterTier === tier.id
                              }
                            />

                            <span className="flex-1 text-sm font-medium text-slate-700">
                              {tier.label}
                            </span>

                            <span className="whitespace-nowrap text-sm font-bold text-[#071A52]">
                              ₦{formatCurrency(tier.price)}
                              <span className="ml-1 text-xs font-normal text-slate-500">
                                /month
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                        {[
                          'Student management',
                          'Teacher & staff management',
                          'Parent management',
                          'Class & subject management',
                          'Exam & result management',
                          'Report generation',
                          'Attendance tracking',
                          'Announcements & communication',
                          'Core school management',
                          'Priority support',
                        ].map((feature) => (
                          <div
                            key={feature}
                            className="flex items-start gap-2 text-sm text-slate-600"
                          >
                            <Check
                              size={17}
                              className="mt-0.5 shrink-0 text-emerald-500"
                            />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex gap-3">
                          <Info
                            size={18}
                            className="mt-0.5 shrink-0 text-[#0EA5E9]"
                          />

                          <p className="text-sm leading-relaxed text-slate-600">
                            More advanced features such as school fees,
                            transport, library, hostel management and
                            AI-powered tools can be introduced in future
                            plans.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Current plan summary */}
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Selected plan
                    </p>

                    <p className="mt-1 font-bold text-[#071A52]">
                      {formData.plan === 'free'
                        ? 'Free Plan'
                        : 'Starter Plan'}
                    </p>

                    {formData.plan === 'starter' && (
                      <p className="mt-1 text-sm text-slate-500">
                        {selectedTier.label}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-extrabold text-[#071A52]">
                      ₦{formatCurrency(selectedPrice)}
                    </p>
                    <p className="text-xs text-slate-500">per month</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Review */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-7">
            <SectionHeader
              icon={<ClipboardCheck size={24} />}
              title="Review Your Details"
              description="Please confirm your information before creating your school account."
            />

            <div className="mt-7 grid gap-6 md:grid-cols-4">
              <ReviewItem
                label="School"
                value={formData.schoolName || 'Not provided'}
                secondary={
                  formData.schoolType || 'School type not selected'
                }
              />

              <ReviewItem
                label="Administrator"
                value={formData.adminName || 'Not provided'}
                secondary={formData.adminEmail || 'Email not provided'}
              />

              <ReviewItem
                label="Selected Plan"
                value={
                  formData.plan === 'free'
                    ? 'Free Plan'
                    : 'Starter Plan'
                }
                secondary={
                  formData.plan === 'starter'
                    ? selectedTier.label
                    : 'No payment required'
                }
              />

              <ReviewItem
                label="Billing"
                value={
                  formData.plan === 'free'
                    ? 'Free'
                    : `₦${formatCurrency(selectedPrice)}`
                }
                secondary={
                  formData.plan === 'free'
                    ? '₦0 / month'
                    : 'Monthly billing'
                }
              />
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-b-3xl bg-[#071A52] p-5 text-white sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <LockKeyhole
                  size={21}
                  className="mt-1 shrink-0 text-cyan-300"
                />

                <div>
                  <p className="text-sm font-medium">
                    Your information is secure.
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    By continuing, you agree to our Terms of Service and
                    Privacy Policy.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentStep((prev) => Math.max(1, prev - 1))
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  <ArrowLeft size={18} />
                  Go Back
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0EA5E9] px-6 py-3 font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-[#0284C7]"
                >
                  {formData.plan === 'free'
                    ? 'Create School & Get Started'
                    : 'Create School & Continue to Payment'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Free plan note */}
        <div className="flex items-start justify-center gap-2 px-4 pb-4 text-center text-sm text-slate-500">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-[#0EA5E9]"
          />

          <p>
            If you select the Free Plan, your school can start using
            ScholaNode without completing a payment.
          </p>
        </div>
      </form>
    </main>
  );
}

/* =========================================================
   Reusable UI Components
========================================================= */

function SectionHeader({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#071A52]">
        {icon}
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function InputField({
  label,
  required,
  value,
  onChange,
  type = 'text',
  placeholder,
  min,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        required={required}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E9]/10"
      />
    </div>
  );
}

function SelectField({
  label,
  required,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E9]/10"
      >
        <option value="">Select {label.toLowerCase()}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function PasswordField({
  label,
  required,
  value,
  visible,
  onToggle,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E9]/10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#071A52]"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function InfoBox({ children }) {
  return (
    <div className="mt-5 flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-600">
      <Info size={17} className="mt-0.5 shrink-0 text-[#0EA5E9]" />
      <span>{children}</span>
    </div>
  );
}

function Radio({ selected }) {
  return (
    <span
      className={[
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
        selected
          ? 'border-[#0EA5E9]'
          : 'border-slate-300',
      ].join(' ')}
    >
      {selected && (
        <span className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9]" />
      )}
    </span>
  );
}

function PlanCard({
  selected,
  onClick,
  badge,
  title,
  description,
  price,
  features,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full rounded-3xl border-2 p-5 text-left transition-all',
        selected
          ? 'border-[#0EA5E9] bg-blue-50/30 shadow-lg shadow-[#0EA5E9]/10'
          : 'border-slate-200 bg-white hover:border-slate-300',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <Radio selected={selected} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">{title}</h3>

              <p className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            </div>

            {badge && (
              <span className="rounded-lg bg-[#0EA5E9] px-2.5 py-1 text-xs font-bold text-white">
                {badge}
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <Check
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-end justify-end gap-1">
            <span className="text-2xl font-extrabold text-[#071A52]">
              {price}
            </span>

            <span className="pb-1 text-xs text-slate-500">
              /month
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function ReviewItem({ label, value, secondary }) {
  return (
    <div className="border-l-2 border-slate-100 pl-4 first:border-l-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-[#071A52]">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">{secondary}</p>
    </div>
  );
}