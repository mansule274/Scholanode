import logoMark from '../../assets/vite.svg';

const STEPS = [
  { id: 1, label: 'Secure your account' },
  { id: 2, label: 'Complete your profile' },
];

export default function FirstLoginShell({ step, schoolName, children, onSignOut }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(73,166,255,0.22),_transparent_35%),linear-gradient(135deg,#020817_0%,#0f172a_45%,#111827_100%)] px-4 py-10 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 w-full max-w-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <img
                src={logoMark}
                alt="ScholaNode logo"
                className="h-7 w-7 object-contain drop-shadow-[0_0_14px_rgba(73,166,255,0.7)]"
              />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">ScholaNode</p>
              <p className="text-xs text-slate-400">{schoolName || 'School portal'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="cursor-pointer rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            Sign out
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white p-6 text-slate-800 shadow-[0_30px_80px_rgba(2,8,23,0.55)] sm:p-8">
          <ol className="mb-6 flex items-center gap-3">
            {STEPS.map((item) => {
              const done = item.id < step;
              const current = item.id === step;

              return (
                <li key={item.id} className="flex flex-1 items-center gap-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? 'bg-emerald-100 text-emerald-700'
                        : current
                          ? 'bg-[#071A52] text-white'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {done ? '✓' : item.id}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      current ? 'text-[#071A52]' : done ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ol>

          {children}
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          These steps are required once. After that you will land on your dashboard as usual.
        </p>
      </div>
    </div>
  );
}
