
import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GraduationCap,
  Lightbulb,
  LoaderCircle,
  Mail,
  MessageSquareText,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { createContactInquiry } from './contactInquiryApi';

const MAX_MESSAGE_LENGTH = 2000;

const CATEGORIES = [
  { value: 'GENERAL_INQUIRY', label: 'General inquiry' },
  { value: 'SCHOOL_REGISTRATION', label: 'School registration' },
  { value: 'ACCOUNT_ACTIVATION', label: 'Account activation' },
  { value: 'SUBSCRIPTION_AND_BILLING', label: 'Subscription & billing' },
  { value: 'TECHNICAL_SUPPORT', label: 'Technical support' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'OTHER', label: 'Other' },
];

const INITIAL_FORM = {
  fullName: '',
  email: '',
  category: 'GENERAL_INQUIRY',
  subject: '',
  message: '',
  allowEmailReply: false,
};

function validateForm(form) {
  const errors = {};

  const fullName = form.fullName.trim();
  const email = form.email.trim();
  const subject = form.subject.trim();
  const message = form.message.trim();

  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2 || fullName.length > 100) {
    errors.fullName = 'Full name must be between 2 and 100 characters.';
  }

  if (email && email.length > 255) {
    errors.email = 'Email address must be at most 255 characters.';
  } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (form.allowEmailReply && !email) {
    errors.email = 'An email address is required when you request an email reply.';
  }

  if (!CATEGORIES.some((item) => item.value === form.category)) {
    errors.category = 'Please select a valid category.';
  }

  if (!subject) {
    errors.subject = 'Subject is required.';
  } else if (subject.length < 3 || subject.length > 150) {
    errors.subject = 'Subject must be between 3 and 150 characters.';
  }

  if (!message) {
    errors.message = 'Message is required.';
  } else if (message.length < 10) {
    errors.message = 'Message must be at least 10 characters.';
  } else if (message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Message must be at most ${MAX_MESSAGE_LENGTH} characters.`;
  }

  return errors;
}

export default function ContactScholaNode() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submissionState, setSubmissionState] = useState('idle');
  const [submittedInquiry, setSubmittedInquiry] = useState(null);

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: '',
    }));

    setSubmitError('');
    setSubmissionState('idle');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(formData);
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) {
      setSubmissionState('idle');
      return;
    }

    const email = formData.email.trim();

    const payload = {
      fullName: formData.fullName.trim(),
      ...(email ? { email } : {}),
      category: formData.category,
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      allowEmailReply: Boolean(formData.allowEmailReply),
    };

    setSubmissionState('submitting');

    try {
      const response = await createContactInquiry(payload);
      setSubmittedInquiry({
        ...(response?.data || {}),
        message: response?.message || '',
      });
      setSubmissionState('success');
    } catch (requestError) {
      setSubmitError(
        requestError?.response?.data?.message ||
          'We could not send your message. Please try again.'
      );
      setSubmissionState('idle');
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setSubmitError('');
    setSubmittedInquiry(null);
    setSubmissionState('idle');
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
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#071A52]"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#071A52] transition hover:text-[#123A8F]"
          >
            <GraduationCap size={22} />
            ScholaNode
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-[#071A52] px-6 py-9 text-white shadow-lg shadow-[#071A52]/10 sm:px-10 sm:py-11">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[36px] border-white/[0.05]" />
          <div className="pointer-events-none absolute -bottom-28 right-32 h-56 w-56 rounded-full bg-[#123A8F]/70 blur-3xl" />

          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
              <MessageSquareText size={14} />
              Contact our team
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              We're here to help.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
              Have a question about ScholaNode, registering your school,
              subscriptions, or using the platform? Send us a message.
              Our team will review your inquiry and respond when appropriate.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-xs text-blue-100 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} />
                Your information is kept private
              </span>
              <span className="inline-flex items-center gap-2">
                <Mail size={16} />
                Optional email replies
              </span>
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          {/* Information sidebar */}
          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#123A8F]">
                <MessageSquareText size={23} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#071A52]">
                How can we help?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Whether you're exploring ScholaNode for your school or
                already using our platform, choose the category that best
                describes your message.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  {
                    icon: GraduationCap,
                    title: 'School registration',
                    description: 'Questions about getting your school started.',
                  },
                  {
                    icon: Lightbulb,
                    title: 'Ideas and feedback',
                    description: 'Suggestions that can help us improve.',
                  },
                  {
                    icon: MessageSquareText,
                    title: 'Technical assistance',
                    description: 'Report a problem or ask for guidance.',
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#123A8F]">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="font-bold text-[#071A52]">
                What happens next?
              </h2>

              <div className="mt-5 space-y-5">
                {[
                  {
                    title: 'Send your message',
                    description: 'Tell us what you need help with.',
                  },
                  {
                    title: 'Our team reviews it',
                    description: 'Your inquiry is checked by the platform team.',
                  },
                  {
                    title: 'Receive a reply if appropriate',
                    description:
                      'If you consent to email replies, we can send a personalized response.',
                  },
                ].map((item, index) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#123A8F]">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <Clock3 size={17} className="mt-0.5 shrink-0 text-slate-500" />
                <p className="text-xs leading-5 text-slate-600">
                  We appreciate your patience while our team reviews your
                  message. Sending an inquiry does not guarantee a reply.
                </p>
              </div>
            </section>
          </aside>

          {/* Contact form */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#071A52] text-white">
                  <Send size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#071A52]">
                    Contact ScholaNode
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Complete the form and share your message with us.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              {submissionState === 'success' ? (
                <div className="py-8 text-center sm:py-12">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={34} />
                  </div>

                  <h3 className="mt-5 text-2xl font-black text-[#071A52]">
                    Message sent successfully
                  </h3>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                    {submittedInquiry?.message ||
                      'Your inquiry has been submitted successfully. Our team will review it and respond when appropriate.'}
                  </p>

                  {(submittedInquiry?.subject || submittedInquiry?.id) && (
                    <div className="mx-auto mt-6 max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                      <p className="text-sm font-semibold text-slate-800">
                        Your inquiry
                      </p>
                      {submittedInquiry?.subject && (
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {submittedInquiry.subject}
                        </p>
                      )}
                      {submittedInquiry?.id && (
                        <p className="mt-2 break-all text-xs text-slate-500">
                          Reference: {submittedInquiry.id}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0A2463]"
                    >
                      <MessageSquareText size={16} />
                      Send another message
                    </button>

                    <Link
                      to="/"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-[#071A52] transition hover:bg-slate-50"
                    >
                      Back to home
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
                      autoComplete="name"
                      maxLength={100}
                      value={formData.fullName}
                      onChange={(event) =>
                        updateField('fullName', event.target.value)
                      }
                      placeholder="Enter your full name"
                      aria-invalid={Boolean(errors.fullName)}
                      className={inputClass('fullName')}
                    />
                    {errors.fullName && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                      <Mail size={16} />
                      Email address
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={255}
                      value={formData.email}
                      onChange={(event) =>
                        updateField('email', event.target.value)
                      }
                      placeholder="you@example.com"
                      aria-invalid={Boolean(errors.email)}
                      className={inputClass('email')}
                    />

                    {errors.email ? (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {errors.email}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Only required if you want to receive an email reply.
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      htmlFor="category"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Inquiry category{' '}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={(event) =>
                          updateField('category', event.target.value)
                        }
                        className={`${inputClass('category')} appearance-none pr-10`}
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={17}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>

                    {errors.category && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      maxLength={150}
                      value={formData.subject}
                      onChange={(event) =>
                        updateField('subject', event.target.value)
                      }
                      placeholder="What is your message about?"
                      aria-invalid={Boolean(errors.subject)}
                      className={inputClass('subject')}
                    />
                    {errors.subject && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {errors.subject}
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
                        Your message <span className="text-red-500">*</span>
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
                      placeholder="Explain your question, suggestion, or the problem you encountered..."
                      aria-invalid={Boolean(errors.message)}
                      className={`${inputClass('message')} resize-y leading-6`}
                    />
                    {errors.message && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Email reply consent */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.allowEmailReply}
                        onChange={(event) =>
                          updateField('allowEmailReply', event.target.checked)
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#123A8F]"
                      />

                      <span>
                        <span className="block text-sm font-semibold text-slate-800">
                          I agree to receive email responses regarding this inquiry.
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-600">
                          If selected, you authorize ScholaNode to email you
                          about this inquiry. If we need more information,
                          our team may contact you privately using the contact
                          details you provided.
                        </span>
                      </span>
                    </label>
                  </div>

                  {/* Privacy */}
                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-slate-500"
                    />
                    <p className="text-xs leading-5 text-slate-600">
                      Your information is submitted to the ScholaNode team
                      for handling your inquiry. Your email address will
                      not be used for inquiry replies unless you provide
                      the required consent.
                    </p>
                  </div>

                  {/* Submit */}
                  {submitError && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium leading-6 text-red-700"
                    >
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submissionState === 'submitting'}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0A2463] focus:outline-none focus:ring-4 focus:ring-[#071A52]/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submissionState === 'submitting' ? (
                      <>
                        <LoaderCircle size={17} className="animate-spin" />
                        Sending message...
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Send message
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs leading-5 text-slate-400">
                    Fields marked with * are required.
                  </p>
                </form>
              )}
            </div>
          </section>
        </div>

        {/* About HumNode */}
        <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#123A8F]">
              <Building2 size={20} />
            </div>

            <div>
              <h2 className="text-base font-bold text-[#071A52]">
                About HumNode
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                HumNode is the company behind ScholaNode. We build tools that
                help schools manage people, academics, and communication in
                one connected place.
              </p>
            </div>
          </div>

          <a
            href="https://masjiba.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#071A52] transition hover:border-slate-300 hover:bg-slate-50 sm:self-center"
          >
            Visit HumNode Website
            <ArrowUpRight size={16} />
          </a>
        </section>
      </main>
    </div>
  );
}
