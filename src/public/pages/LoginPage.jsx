import React from 'react';

export default function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[75vh] max-w-5xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">
          Public area
        </p>
        <h1 className="mt-4 text-3xl font-black text-[#071A52]">School login</h1>
        <p className="mt-2 text-sm text-slate-500">
          Placeholder login page for school, parent, and staff access.
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Login ID
            </div>
            <div className="h-11 rounded-xl border border-slate-200 bg-white" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Password
            </div>
            <div className="h-11 rounded-xl border border-slate-200 bg-white" />
          </div>
          <div className="h-12 rounded-xl bg-[#071A52]" />
        </div>
      </div>
    </section>
  );
}
