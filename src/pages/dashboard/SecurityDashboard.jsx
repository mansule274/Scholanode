
import {
  ShieldCheck,
  MapPin,
  ScanLine,
  Users,
  ShieldAlert,
  CheckCircle2,
  Clock3,
  ArrowUpRight,
  ClipboardCheck,
  LockKeyhole,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SecurityDashboard = () => {
  const navigate = useNavigate();

  // Mock data for the initial frontend prototype.
  // Replace with authenticated user and backend data later.
  const securityOfficer = {
    firstName: "Security Officer",
    schoolName: "ScholaNode Demo School",
    gatePoint: "Main Entrance",
    gateDescription: "Primary school entrance",
    dutyStatus: "On Duty",
  };

  const overview = [
    {
      label: "Students verified",
      value: "24",
      description: "Today's recorded arrivals",
      icon: Users,
      iconStyle: "bg-blue-50 text-blue-700",
    },
    {
      label: "Repeat checks",
      value: "2",
      description: "Entries requiring attention",
      icon: ShieldAlert,
      iconStyle: "bg-amber-50 text-amber-700",
    },
    {
      label: "Gate status",
      value: "Active",
      description: "Assigned gate point",
      icon: ShieldCheck,
      iconStyle: "bg-emerald-50 text-emerald-700",
    },
  ];

  const responsibilities = [
    {
      icon: ScanLine,
      title: "Student verification",
      description:
        "Verify students using their QR codes or admission numbers before recording their arrival.",
      tag: "Available",
      tagStyle: "bg-emerald-50 text-emerald-700",
    },
    {
      icon: ShieldCheck,
      title: "Entrance safety",
      description:
        "Maintain orderly movement at the gate and follow the school's security procedures.",
      tag: "Daily duty",
      tagStyle: "bg-blue-50 text-blue-700",
    },
    {
      icon: ClipboardCheck,
      title: "Report irregularities",
      description:
        "Pay attention to unusual situations and follow the school's established reporting procedure.",
      tag: "Security duty",
      tagStyle: "bg-slate-100 text-slate-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Welcome */}
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
              <ShieldCheck size={17} />
              Security Dashboard
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome, {securityOfficer.firstName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Manage your gate duties and help keep the school environment
              safe and orderly.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-semibold text-emerald-700">
              {securityOfficer.dutyStatus}
            </span>
          </div>
        </section>

        {/* Assigned gate */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-5 text-white shadow-sm sm:p-7">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[35px] border-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-24 right-28 h-52 w-52 rounded-full bg-cyan-400/[0.08] blur-2xl" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-200">
                <MapPin size={17} />
                Your assigned gate point
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                {securityOfficer.gatePoint}
              </h2>

              <p className="mt-2 text-sm text-blue-100">
                {securityOfficer.gateDescription}
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm text-blue-100">
                <LockKeyhole size={16} />
                <span>{securityOfficer.schoolName}</span>
              </div>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-2xl border border-white/15 bg-white/10 sm:h-24 sm:w-24 sm:self-center">
              <ShieldCheck size={46} strokeWidth={1.4} />
            </div>
          </div>
        </section>

        {/* Overview statistics */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Today's Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A quick summary of your security duties.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {overview.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-3 text-2xl font-bold text-slate-900">
                        {item.value}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconStyle}`}
                    >
                      <Icon size={21} />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Primary action */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ScanLine size={24} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Verify a Student
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                Scan a student's QR code or search by admission number to
                verify and record their arrival.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/verify-student")}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2463] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#123A8F] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:shrink-0"
          >
            Open Verification
            <ArrowUpRight size={17} />
          </button>
        </section>

        {/* Responsibilities */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Security Responsibilities
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              The key duties associated with your role.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {responsibilities.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Icon size={21} />
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.tagStyle}`}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Small reminder */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3.5">
          <Clock3 className="mt-0.5 shrink-0 text-blue-700" size={18} />
          <p className="text-sm leading-6 text-slate-600">
            <span className="font-semibold text-slate-800">
              Important reminder:
            </span>{" "}
            Gate verification records student arrivals. They do not replace
            the class teacher's attendance register.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
