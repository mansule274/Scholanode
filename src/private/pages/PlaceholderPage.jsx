export default function PlaceholderPage({ title, description }) {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-4 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
        Coming soon
      </div>

      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-3 text-base text-slate-600">{description}</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        This section is not available yet. The route stays in place so navigation keeps working while the feature is built.
      </div>
    </div>
  );
}
