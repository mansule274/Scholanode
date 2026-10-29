import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  MessageSquareText,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const MAX_MESSAGE_LENGTH = 2000;

export default function SchoolContactPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const school = location.state?.school || {};

  const schoolName =
    school.schoolName || school.name || 'Your School';

  const schoolCode =
    school.schoolCode || school.code || 'School code unavailable';

  const schoolId = school.id || school.schoolId;

  const logoUrl =
    school.logoUrl || school.logo_url || null;

  const initials =
    schoolName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('') || 'S';

  const [formData, setFormData] = useState({
    fullName: '',
    contact: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submissionState, setSubmissionState] = useState('idle');

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: '',
    }));

    if (submissionState !== 'idle') {
      setSubmissionState('idle');
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    const fullName = formData.fullName.trim();
    const contact = formData.contact.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!fullName) {
      nextErrors.fullName = 'Please enter your full name.';
    } else if (fullName.length < 2) {
      nextErrors.fullName =
        'Your name must contain at least 2 characters.';
    } else if (fullName.length > 100) {
      nextErrors.fullName = 'Your name is too long.';
    }

    if (!contact) {
      nextErrors.contact =
        'Enter an email address or phone number.';
    } else {
      const looksLikeEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);

      const phoneDigits = contact.replace(/\D/g, '');

      const looksLikePhone =
        /^[+\d\s().-]+$/.test(contact) &&
        phoneDigits.length >= 7 &&
        phoneDigits.length <= 15;

      if (!looksLikeEmail && !looksLikePhone) {
        nextErrors.contact =
          'Enter a valid email address or phone number.';
      }
    }

    if (!subject) {
      nextErrors.subject = 'Please enter an inquiry subject.';
    } else if (subject.length < 3) {
      nextErrors.subject =
        'The subject must contain at least 3 characters.';
    } else if (subject.length > 150) {
      nextErrors.subject =
        'The subject cannot exceed 150 characters.';
    }

    if (!message) {
      nextErrors.message = 'Please write your inquiry.';
    } else if (message.length < 10) {
      nextErrors.message =
        'Please provide a little more detail (at least 10 characters).';
    } else if (message.length > MAX_MESSAGE_LENGTH) {
      nextErrors.message =
        `Your message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`;
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepared payload for the future backend integration.
    // The actual API request will be added when the controller is ready.
    const inquiryPayload = {
      schoolId,
      fullName: formData.fullName.trim(),
      contact: formData.contact.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    // Prevent an unused-variable warning while the API is not connected.
    void inquiryPayload;

    setSubmissionState('not-connected');
  };

  const inputClass = (field) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800
    placeholder:text-slate-400 outline-none transition
    focus:border-[#123A8F] focus:ring-4 focus:ring-[#123A8F]/10
    ${
      errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
        : 'border-slate-200'
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#071A52]"
          >
            <ArrowLeft size={17} />
            <span>Back</span>
          </button>

          <Link
            to="/school-login"
            state={{ school }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#071A52] transition hover:text-[#123A8F]"
          >
            School login
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-[#071A52] px-6 py-8 text-white shadow-lg shadow-[#071A52]/10 sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[36px] border-white/[0.05]" />
          <div className="pointer-events-none absolute -bottom-28 right-24 h-56 w-56 rounded-full bg-[#123A8F]/60 blur-3xl" />

          <div className="relative max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
              <MessageSquareText size={14} />
              School inquiries
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Get in touch with your school.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
              Have a question about admission, school activities, or
              something else? Send an inquiry directly to the school.
              Its administration can review your message and contact
              you personally.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-blue-100 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} />
                Your contact details stay private from other visitors
              </span>
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Selected school */}
          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                You are contacting
              </p>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${schoolName} logo`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xl font-black text-[#071A52]">
                      {initials}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="break-words text-lg font-bold leading-6 text-[#071A52]">
                    {schoolName}
                  </h2>
                  <p className="mt-1 break-words text-sm text-slate-500">
                    {schoolCode}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#123A8F]">
                    <GraduationCap size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Contact the school directly
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Your inquiry will be made available to the
                      school's authorized administrators so they
                      can follow up with you.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* What happens next */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h3 className="font-bold text-[#071A52]">
                What happens next?
              </h3>

              <div className="mt-5 space-y-5">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#123A8F]">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Send your inquiry
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Provide a clear subject and explain what you
                      would like to know.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#123A8F]">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      The school reviews it
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      An authorized administrator can view your
                      message through ScholaNode.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#123A8F]">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      The school contacts you
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      The school uses the email address or phone
                      number you provide to follow up.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>

          {/* Inquiry form */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#071A52] text-white">
                  <MessageSquareText size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#071A52]">
                    Send an inquiry
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Complete the details below to contact the school.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5 p-5 sm:p-7"
            >
              {submissionState === 'not-connected' && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
                >
                  <MessageSquareText
                    size={19}
                    className="mt-0.5 shrink-0 text-amber-700"
                  />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Inquiry submission is not available yet
                    </p>
                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      Your details have not been sent. This form needs
                      to be connected to the ScholaNode backend first.
                    </p>
                  </div>
                </div>
              )}

              {/* Full name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full name <span className="text-red-500">*</span>
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  value={formData.fullName}
                  onChange={(event) =>
                    updateField('fullName', event.target.value)
                  }
                  placeholder="Enter your full name"
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={
                    errors.fullName ? 'fullName-error' : undefined
                  }
                  className={inputClass('fullName')}
                />

                {errors.fullName && (
                  <p
                    id="fullName-error"
                    className="mt-2 text-xs font-medium text-red-600"
                  >
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Contact */}
              <div>
                <label
                  htmlFor="contact"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address or phone number{' '}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="contact"
                  name="contact"
                  type="text"
                  autoComplete="email"
                  maxLength={255}
                  value={formData.contact}
                  onChange={(event) =>
                    updateField('contact', event.target.value)
                  }
                  placeholder="How can the school reach you?"
                  aria-invalid={Boolean(errors.contact)}
                  aria-describedby={
                    errors.contact ? 'contact-error' : 'contact-hint'
                  }
                  className={inputClass('contact')}
                />

                {errors.contact ? (
                  <p
                    id="contact-error"
                    className="mt-2 text-xs font-medium text-red-600"
                  >
                    {errors.contact}
                  </p>
                ) : (
                  <p
                    id="contact-hint"
                    className="mt-2 text-xs leading-5 text-slate-500"
                  >
                    Provide an email address or phone number the
                    school can use to contact you.
                  </p>
                )}
              </div>

              {/* Subject - required */}
              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Inquiry subject <span className="text-red-500">*</span>
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  maxLength={150}
                  value={formData.subject}
                  onChange={(event) =>
                    updateField('subject', event.target.value)
                  }
                  placeholder="e.g. Admission enquiry, School fees"
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={
                    errors.subject ? 'subject-error' : 'subject-hint'
                  }
                  className={inputClass('subject')}
                />

                {errors.subject ? (
                  <p
                    id="subject-error"
                    className="mt-2 text-xs font-medium text-red-600"
                  >
                    {errors.subject}
                  </p>
                ) : (
                  <p
                    id="subject-hint"
                    className="mt-2 text-xs leading-5 text-slate-500"
                  >
                    Briefly describe the purpose of your inquiry.
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="message"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Your message{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <span className="text-xs tabular-nums text-slate-400">
                    {formData.message.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                </div>

                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  maxLength={MAX_MESSAGE_LENGTH}
                  value={formData.message}
                  onChange={(event) =>
                    updateField('message', event.target.value)
                  }
                  placeholder="Explain your question or inquiry here..."
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={
                    errors.message ? 'message-error' : undefined
                  }
                  className={`${inputClass('message')} min-h-36 resize-y leading-6`}
                />

                {errors.message && (
                  <p
                    id="message-error"
                    className="mt-2 text-xs font-medium text-red-600"
                  >
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Privacy notice */}
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <LockKeyhole
                  size={17}
                  className="mt-0.5 shrink-0 text-slate-500"
                />
                <p className="text-xs leading-5 text-slate-600">
                  Your contact details are provided to help the school
                  respond to your inquiry. They are not displayed as
                  public school contact information.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submissionState === 'submitting'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0A2463] focus:outline-none focus:ring-4 focus:ring-[#071A52]/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submissionState === 'submitting' ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Sending inquiry...
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Send inquiry
                  </>
                )}
              </button>

              <p className="text-center text-xs leading-5 text-slate-500">
                You can also return to the school login page if you
                already have an account.
              </p>

              <Link
                to="/school-login"
                state={{ school }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#071A52] transition hover:border-slate-300 hover:bg-slate-50"
              >
                Go to school login
                <ArrowRight size={16} />
              </Link>
            </form>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2 text-sm font-bold text-[#071A52]">
            <GraduationCap size={19} />
            ScholaNode
          </div>

          <p className="text-xs leading-5 text-slate-500">
            Helping schools and communities stay connected.
          </p>
        </footer>
      </main>
    </div>
  );
}