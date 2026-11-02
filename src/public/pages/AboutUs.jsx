import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  GraduationCap,
  HeartHandshake,
  Layers3,
  Lightbulb,
  Mail,
  Megaphone,
  MessageSquareText,
  MessagesSquare,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const capabilities = [
  {
    icon: UsersRound,
    title: 'People & records',
    description:
      'Students, staff and parents organised in one dependable place.',
  },
  {
    icon: BookOpenCheck,
    title: 'Academic setup',
    description:
      'Classes, subjects, sessions and terms kept structured and visible.',
  },
  {
    icon: ScanLine,
    title: 'Attendance & gate access',
    description:
      'Daily attendance and verified entry and exit records in one view.',
  },
  {
    icon: BarChart3,
    title: 'Results & reports',
    description:
      'Assessment records and results shared with the right people.',
  },
  {
    icon: Megaphone,
    title: 'Announcements',
    description:
      'School-wide updates that keep staff, parents and students informed.',
  },
  {
    icon: MessagesSquare,
    title: 'Complaints & feedback',
    description:
      'A clear way to raise concerns and follow them through to resolution.',
  },
];

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'We explore thoughtful ideas and use technology to solve problems better.',
  },
  {
    icon: ShieldCheck,
    title: 'Reliability',
    description:
      'We build dependable tools that schools can confidently work with.',
  },
  {
    icon: HeartHandshake,
    title: 'Impact',
    description:
      'We focus on meaningful needs and practical value, not noise.',
  },
  {
    icon: Layers3,
    title: 'Simplicity',
    description:
      'Useful technology should be understandable and easy to use.',
  },
  {
    icon: Target,
    title: 'Purpose',
    description:
      'We build with clear intentions and real school needs at the centre.',
  },
];

const challenges = [
  {
    icon: ClipboardCheck,
    title: 'Manual processes',
    description:
      'Repeated paperwork and manual tasks take time away from the work that matters.',
  },
  {
    icon: Layers3,
    title: 'Scattered records',
    description:
      'Important information spread across different places makes everyday decisions harder.',
  },
  {
    icon: BookOpenCheck,
    title: 'Academic tracking',
    description:
      'Attendance, assessments and results need structure to stay useful and reliable.',
  },
  {
    icon: MessagesSquare,
    title: 'Communication gaps',
    description:
      'Keeping staff, parents and students informed takes more than one channel.',
  },
];

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        !('IntersectionObserver' in window))
  );

  useEffect(() => {
    if (visible) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -48px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`transform-gpu transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
  inverted = false,
}) {
  return (
    <div className={`${centered ? 'mx-auto text-center' : ''} max-w-3xl`}>
      <p
        className={`text-sm font-bold uppercase tracking-[0.18em] ${
          inverted ? 'text-cyan-300' : 'text-[#0E8BCB]'
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl ${
          inverted ? 'text-white' : 'text-[#071A52]'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base leading-8 ${
            inverted ? 'text-blue-100/80' : 'text-slate-600'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default function AboutUs() {
  return (
    <div className="bg-white text-slate-800">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] px-6 py-12 text-white shadow-2xl sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border-[38px] border-white/[0.05]" />
          <div className="pointer-events-none absolute -bottom-32 right-24 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="pointer-events-none absolute left-1/3 top-0 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-blue-100 backdrop-blur">
                <Sparkles size={15} />
                Who we are
              </div>

              <h1 className="mt-6 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Making school management{' '}
                <span className="text-cyan-300">simpler, smarter</span> and
                more connected.
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-blue-100/85 sm:text-base sm:leading-8">
                ScholaNode brings the everyday work of schools — people,
                academics, attendance and communication — into one calm,
                connected platform. Built by HumNode, designed around real
                school days.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/get-started"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#071A52] transition hover:bg-blue-50"
                >
                  Get started
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Talk to our team
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-blue-100/90 sm:text-sm">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={16} className="text-cyan-300" />
                  Built for schools
                </span>
                <span className="inline-flex items-center gap-2">
                  <HeartHandshake size={16} className="text-cyan-300" />
                  Designed with purpose
                </span>
                <span className="inline-flex items-center gap-2">
                  <UsersRound size={16} className="text-cyan-300" />
                  Focused on people
                </span>
              </div>
            </Reveal>

            {/* Product illustration */}
            <Reveal delay={140} className="relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-4 rounded-[2rem] bg-cyan-400/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white p-5 shadow-2xl sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071A52] text-white">
                      <GraduationCap size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#071A52]">
                        ScholaNode
                      </p>
                      <p className="text-xs text-slate-400">
                        School management, connected
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-sn-ring rounded-full bg-emerald-400" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Live
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    { icon: UsersRound, label: 'People & records' },
                    { icon: ScanLine, label: 'Attendance' },
                    { icon: BookOpenCheck, label: 'Academics' },
                    { icon: Megaphone, label: 'Communication' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:shadow-sm"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[#123A8F]">
                          <Icon size={18} />
                        </div>
                        <p className="mt-3 text-sm font-bold text-[#071A52]">
                          {item.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-2xl bg-[#071A52] p-4">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <CheckCircle2 size={16} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                      Our focus
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-bold leading-6 text-white">
                    Helping schools manage better and stay connected.
                  </p>
                </div>
              </div>

              <div className="animate-sn-float absolute -bottom-12 -left-4 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xl sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
                  <HeartHandshake size={19} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#071A52]">
                    Built with purpose
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Technology that serves people
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Our Story */}
        <section
          id="our-story"
          className="scroll-mt-24 py-16 sm:py-20 lg:py-24"
        >
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <Reveal>
              <SectionHeading
                eyebrow="Our story"
                title="Built around the way schools actually work."
              />

              <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                Schools carry a lot: students, staff, parents, lessons,
                attendance, results and constant communication. When those
                responsibilities live in scattered files and disconnected
                tools, the day gets harder than it needs to be.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                ScholaNode was created to bring that work together. We focus on
                clear structure, simple workflows and information that is easy
                to find — so school teams can spend less time chasing details
                and more time supporting learners.
              </p>

              <Link
                to="/features"
                className="group mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#123A8F] transition hover:text-[#071A52]"
              >
                See what ScholaNode can do
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </Reveal>

            <Reveal delay={120} className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-50 via-cyan-50 to-white blur-xl" />

              <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071A52] text-white">
                    <GraduationCap size={25} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0E8BCB]">
                      Our approach
                    </p>
                    <h3 className="mt-1 text-lg font-extrabold text-[#071A52]">
                      One platform. Better organisation.
                    </h3>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    'Records that stay in one place',
                    'Attendance and gate activity you can follow',
                    'Communication that reaches the right people',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 transition duration-300 hover:bg-blue-50/60"
                    >
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-[#0E8BCB]"
                      />
                      <p className="text-sm font-medium leading-6 text-slate-700">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div className="h-1.5 w-10 rounded-full bg-[#123A8F]" />
                  <div className="h-1.5 w-6 rounded-full bg-cyan-400" />
                  <div className="h-1.5 w-4 rounded-full bg-slate-200" />
                  <p className="ml-1 text-xs text-slate-400">
                    A product of HumNode
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      {/* The challenge */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              centered
              eyebrow="Why ScholaNode"
              title="Less friction. More focus."
              description="The challenges schools describe are consistent. ScholaNode is shaped around them."
            />
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {challenges.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal
                  key={item.title}
                  delay={index * 90}
                  className="h-full"
                >
                  <article className="group h-full rounded-2xl border border-slate-100 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#123A8F] transition duration-300 group-hover:bg-[#071A52] group-hover:text-white">
                      <Icon size={23} />
                    </div>
                    <h3 className="mt-5 text-base font-bold text-[#071A52]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <Reveal>
          <SectionHeading
            centered
            eyebrow="What's inside"
            title="Tools for the many parts of school life."
            description="Each part of ScholaNode supports a real responsibility schools handle every day."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 80} className="h-full">
                <article className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                  <ArrowUpRight
                    size={18}
                    className="absolute right-6 top-6 text-slate-300 opacity-0 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#123A8F] group-hover:opacity-100"
                  />
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#123A8F] transition duration-300 group-hover:bg-[#071A52] group-hover:text-white">
                    <Icon size={26} />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-[#071A52]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Mission and vision */}
      <section className="relative isolate overflow-hidden bg-[#071A52] py-16 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[30px] border-white/[0.04]" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              centered
              inverted
              eyebrow="Our direction"
              title="What guides our work."
              description="Purpose, clarity and usefulness sit behind every decision we make."
            />
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                icon: Target,
                title: 'Our mission',
                description:
                  'To simplify school management through practical digital tools that help schools operate clearly, efficiently and in closer touch with their communities.',
              },
              {
                icon: Eye,
                title: 'Our vision',
                description:
                  'A future where every school can manage its work with accessible, reliable technology — and where good tools quietly make the day easier.',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={index * 120} className="h-full">
                  <article className="group h-full rounded-3xl border border-white/10 bg-white/5 p-8 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.07] sm:p-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-300 transition duration-300 group-hover:bg-cyan-300/25">
                      <Icon size={28} />
                    </div>
                    <h3 className="mt-7 text-2xl font-extrabold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-blue-100/80 sm:text-base sm:leading-8">
                      {item.description}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core values */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <Reveal>
          <SectionHeading
            centered
            eyebrow="Our core values"
            title="The principles behind what we build."
            description="How we approach the work matters as much as the product itself."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {values.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 80} className="h-full">
                <article className="group h-full rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-lg">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#123A8F] shadow-sm transition duration-300 group-hover:bg-[#071A52] group-hover:text-white">
                    <Icon size={25} />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-[#071A52]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HumNode */}
        <Reveal>
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
              <div className="p-7 sm:p-10 lg:p-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#123A8F]">
                  <Building2 size={15} />
                  The company behind ScholaNode
                </div>

                <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-[#071A52] sm:text-4xl">
                  Meet HumNode.
                </h2>

                <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                  HumNode is a software company that designs and builds digital
                  products for real-world needs. We care about tools that make
                  work clearer, easier and more effective.
                </p>

                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                  ScholaNode is our school management product. As HumNode
                  grows, that same focus carries into everything we build:
                  practical software, thoughtful details and technology that
                  serves people.
                </p>

                <a
                  href="https://masjiba.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-7 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-[#071A52] transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Visit HumNode Website
                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </div>

              <div className="relative flex items-center justify-center overflow-hidden border-t border-slate-100 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8 lg:border-l lg:border-t-0">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border-[26px] border-blue-100/60" />
                <div className="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-cyan-100/50 blur-3xl" />

                <div className="relative text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-[#123A8F] shadow-md ring-1 ring-slate-100">
                    <Building2 size={38} strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-[#071A52]">
                    HumNode
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    Building practical digital products for real-world needs.
                  </p>

                  <div className="mx-auto mt-5 h-1 w-12 rounded-full bg-[#123A8F]" />
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Technology with purpose
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Contact CTA */}
        <Reveal>
          <section className="relative mt-16 overflow-hidden rounded-3xl bg-[#071A52] px-6 py-10 text-white shadow-lg shadow-[#071A52]/10 sm:px-10 sm:py-12">
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[36px] border-white/[0.05]" />
            <div className="pointer-events-none absolute -bottom-28 right-32 h-56 w-56 rounded-full bg-[#123A8F]/70 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                  <MessageSquareText size={14} />
                  Contact our team
                </div>

                <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                  We'd love to hear from you.
                </h2>

                <p className="mt-4 text-sm leading-7 text-blue-100 sm:text-base">
                  Have a question about ScholaNode, bringing it to your school,
                  or working with HumNode? Send us a message and our team will
                  take it from there.
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs text-blue-100/80">
                  <Mail size={15} />
                  Optional email replies — your details stay private.
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  to="/contact"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#071A52] transition hover:bg-blue-50"
                >
                  Contact ScholaNode
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  to="/get-started"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Get started
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
