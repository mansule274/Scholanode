import React from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">Private area</p>
        <h2 className="mt-3 text-3xl font-black text-[#071A52]">Dashboard</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          This is the private dashboard placeholder for the authenticated school admin area.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {['Students', 'Staff', 'Payments'].map((label, index) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 h-3 w-24 rounded bg-slate-200" />
            <div className="text-3xl font-black text-[#071A52]">{index === 0 ? 245 : index === 1 ? 38 : 62}</div>
            <div className="mt-2 text-sm text-slate-500">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
