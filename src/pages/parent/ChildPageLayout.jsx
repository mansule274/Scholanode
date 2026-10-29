import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { getParentDashboard } from "../people/parentApi";
import {
  avatarPalettes,
  getClassName,
  getDisplayName,
  getInitials,
  getRelationshipLabel,
} from "./childDisplay";
import ChildStatusBadge from "./ChildStatusBadge";

export default function ChildPageLayout({
  section,
  title,
  hideIdentity = false,
  children,
}) {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [childrenList, setChildrenList] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setStatus("loading");
      setError("");

      try {
        const payload = await getParentDashboard();
        if (cancelled) return;

        const list = Array.isArray(payload?.data?.children)
          ? payload.data.children
          : [];

        setChildrenList(list);
        setStatus("ready");
      } catch (requestError) {
        if (cancelled) return;

        setChildrenList([]);
        setError(
          requestError?.response?.data?.message ||
            "We could not load this student. Check your connection and try again."
        );
        setStatus("error");
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [reloadToken]);

  const childIndex = childrenList.findIndex((item) => item.id === studentId);
  const child = childIndex >= 0 ? childrenList[childIndex] : null;
  const palette = avatarPalettes[Math.max(0, childIndex) % avatarPalettes.length];

  return (
    <div className="min-h-full bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-[#071A52]"
          >
            <ArrowLeft size={14} />
            Back to dashboard
          </Link>

          <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <nav
              aria-label="Breadcrumb"
              className="hidden items-center gap-1 text-[11px] text-slate-400 sm:flex"
            >
              <Link to="/dashboard" className="transition hover:text-slate-600">
                My children
              </Link>
              <ChevronRight size={12} />
              <span className="max-w-[180px] truncate font-semibold text-slate-600">
                {child ? getDisplayName(child) : "Student"}
              </span>
              <ChevronRight size={12} />
              <span className="font-semibold text-[#071A52]">{title}</span>
            </nav>

            {status === "ready" && child && childrenList.length > 1 && (
              <label className="relative block w-full sm:w-auto">
                <span className="sr-only">Switch child</span>
                <select
                  value={studentId}
                  onChange={(event) =>
                    navigate(`/children/${event.target.value}/${section}`)
                  }
                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-bold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:w-40"
                >
                  {childrenList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {getDisplayName(item)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </label>
            )}
          </div>
        </div>

        {status === "loading" && (
          <div className="space-y-4" aria-hidden="true">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 animate-pulse rounded bg-slate-100" />
                  <div className="h-2.5 w-24 animate-pulse rounded bg-slate-100" />
                  <div className="h-2.5 w-32 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            </div>
            <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertCircle size={20} />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-800">
              This student could not be loaded
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setReloadToken((value) => value + 1)}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#071A52] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#123A8F]"
            >
              <RefreshCw size={13} />
              Try again
            </button>
          </div>
        )}

        {status === "ready" && !child && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <UserRound size={20} />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-800">
              Student not found
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              This student is not linked to your parent account, or the link
              was removed by the school.
            </p>
            <Link
              to="/dashboard"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#071A52] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#123A8F]"
            >
              <ArrowLeft size={13} />
              Back to dashboard
            </Link>
          </div>
        )}

        {status === "ready" && child && (
          <>
            {!hideIdentity && (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${palette} text-base font-black text-white shadow-sm`}
                  >
                    {getInitials(child)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="truncate text-lg font-extrabold text-[#071A52]">
                        {getDisplayName(child)}
                      </h1>
                      <ChildStatusBadge status={child.admissionStatus} />
                    </div>

                    <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                      {child.admissionNumber || "No admission number"}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                        <GraduationCap size={11} />
                        {getClassName(child)}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        Linked as {getRelationshipLabel(child.relationship)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {children({ child })}
          </>
        )}
      </div>
    </div>
  );
}
