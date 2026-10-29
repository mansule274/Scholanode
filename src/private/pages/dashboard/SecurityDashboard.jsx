import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  History,
  RefreshCw,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { useUserContext } from "../../../context/UserContext";
import { getSecurityDashboard } from "../attendance/gateScannerApi";

const todayLabel = new Date().toLocaleDateString([], {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function SecurityDashboard() {
  const navigate = useNavigate();
  const { user, school } = useUserContext();

  const officerName = useMemo(() => {
    const fullName = [user?.firstName, user?.surName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return fullName || user?.fullName || user?.name || "Security Officer";
  }, [user]);

  const schoolName = school?.schoolName || school?.name || "School";

  const [todayArrivalCount, setTodayArrivalCount] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const payload = await getSecurityDashboard();
        if (cancelled) return;

        setTodayArrivalCount(Number(payload?.data?.todayArrivalCount ?? 0));
        setLastUpdated(new Date());
      } catch (requestError) {
        if (cancelled) return;

        setTodayArrivalCount(null);
        setError(
          requestError?.response?.data?.message ||
            "We could not load today's gate summary. Check your connection and try again."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [refreshToken]);

  const arrivalLabel =
    todayArrivalCount === 1 ? "student arrived today" : "students arrived today";

  return (
    <div className="min-h-full bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-700">
            <ShieldCheck size={14} />
            Gate security
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#071A52] sm:text-3xl">
            Welcome, {officerName}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            <span>{schoolName}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} />
              {todayLabel}
            </span>
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <ScanLine size={14} />
                Today's overview
              </div>

              <button
                type="button"
                onClick={() => setRefreshToken((value) => value + 1)}
                disabled={loading}
                aria-label="Refresh today's arrivals"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/90 p-4">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
                  <div>
                    <p className="text-xs font-bold text-rose-800">
                      Today's arrivals could not be loaded
                    </p>
                    <p className="mt-0.5 text-[11px] text-rose-700">{error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRefreshToken((value) => value + 1)}
                  className="mt-3 cursor-pointer rounded-lg bg-rose-700 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-rose-800"
                >
                  Try again
                </button>
              </div>
            ) : loading && todayArrivalCount === null ? (
              <div aria-hidden="true" className="mt-5 space-y-2">
                <div className="h-11 w-32 animate-pulse rounded-lg bg-slate-100 sm:h-12" />
                <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
                <div className="h-2.5 w-56 animate-pulse rounded bg-slate-100" />
              </div>
            ) : (
              <>
                <p
                  className={`mt-4 text-4xl font-black tracking-tight text-[#071A52] transition-opacity sm:text-5xl ${
                    loading ? "opacity-50" : ""
                  }`}
                >
                  {todayArrivalCount.toLocaleString()}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {arrivalLabel}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Arrivals recorded at the gate since midnight.
                </p>
                {todayArrivalCount === 0 && (
                  <p className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                    No arrivals yet — scan the first student
                  </p>
                )}
              </>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <span className="text-[11px] text-slate-400">
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "Not updated yet"}
              </span>

              <button
                type="button"
                onClick={() => navigate("/verify-student")}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#071A52] to-[#123A8F] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
              >
                <ScanLine size={15} />
                Verify a student
                <ArrowUpRight size={14} />
              </button>
            </div>
          </section>

          <button
            type="button"
            onClick={() => navigate("/scan-history")}
            className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-5 text-left text-white shadow-sm transition hover:brightness-110 sm:p-6"
          >
            <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full border-[28px] border-white/[0.06]" />
            <div className="pointer-events-none absolute -bottom-20 right-16 h-40 w-40 rounded-full bg-cyan-400/[0.08] blur-2xl" />

            <div className="relative">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white">
                <History size={21} />
              </span>
              <h2 className="mt-4 text-lg font-extrabold">Scan history</h2>
              <p className="mt-1 max-w-xs text-xs leading-5 text-blue-100">
                Review every student recorded at the gate, search by name or
                admission number, and export the daily log.
              </p>
            </div>

            <span className="relative mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-200">
              Open scan history
              <ArrowUpRight
                size={14}
                className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </button>
        </div>

        <p className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-[11px] leading-5 text-slate-600">
          <span className="font-bold text-slate-800">Note:</span> Gate
          verification records student arrivals. It does not replace the class
          teacher's attendance register.
        </p>
      </div>
    </div>
  );
}
