import React from 'react';

export default function HomePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">
          Public area
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-[#071A52] sm:text-5xl">
          Landing page
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          This is the public landing page placeholder. Add your market branding, hero section,
          school highlights, and call-to-action content here later.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="rounded-xl bg-[#071A52] px-5 py-3 text-sm font-semibold text-white">
            Get started
          </button>
          <button type="button" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
            Watch demo
          </button>
        </div>
      </div>
    </section>
  );
}
