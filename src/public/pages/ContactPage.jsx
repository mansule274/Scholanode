import React from 'react';

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">
          Public area
        </p>
        <h1 className="mt-4 text-4xl font-black text-[#071A52]">Contact</h1>
        <p className="mt-4 text-slate-600">
          Placeholder contact page for support, sales, and general inquiries.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-2 h-4 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-full rounded bg-slate-200" />
            <div className="mt-2 h-3 w-10/12 rounded bg-slate-200" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-2 h-4 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-full rounded bg-slate-200" />
            <div className="mt-2 h-3 w-10/12 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    </section>
  );
}
