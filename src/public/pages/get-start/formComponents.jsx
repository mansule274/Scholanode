import { Check, Eye, EyeOff, Info } from 'lucide-react';

export function SectionHeader({ icon, title, description }) {
  return <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#071A52]">{icon}</div><div><h2 className="text-xl font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div></div>;
}

export function InputField({ label, required, value, onChange, type = 'text', placeholder, min }) {
  return <div><label className="mb-2 block text-sm font-semibold text-slate-700">{label}{required && <span className="ml-1 text-red-500">*</span>}</label><input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} required={required} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E9]/10" /></div>;
}

export function SelectField({ label, required, value, onChange, options = [], placeholder }) {
  return <div><label className="mb-2 block text-sm font-semibold text-slate-700">{label}{required && <span className="ml-1 text-red-500">*</span>}</label><select value={value} onChange={onChange} required={required} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E9]/10"><option value="" disabled>{placeholder || 'Select an option'}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>;
}

export function PasswordField({ label, required, value, visible, onToggle, onChange, placeholder }) {
  return <div><label className="mb-2 block text-sm font-semibold text-slate-700">{label}{required && <span className="ml-1 text-red-500">*</span>}</label><div className="relative"><input type={visible ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} required={required} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E9]/10" /><button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#071A52]" aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>;
}

export function InfoBox({ children }) {
  return <div className="mt-5 flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-600"><Info size={17} className="mt-0.5 shrink-0 text-[#0EA5E9]" /><span>{children}</span></div>;
}

export function Radio({ selected }) {
  return <span className={['flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', selected ? 'border-[#0EA5E9]' : 'border-slate-300'].join(' ')}>{selected && <span className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9]" />}</span>;
}

export function PlanCard({ selected, onClick, badge, title, description, price, features }) {
  return <button type="button" onClick={onClick} className={['w-full rounded-3xl border-2 p-5 text-left transition-all', selected ? 'border-[#0EA5E9] bg-blue-50/30 shadow-lg shadow-[#0EA5E9]/10' : 'border-slate-200 bg-white hover:border-slate-300'].join(' ')}><div className="flex items-start gap-3"><Radio selected={selected} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p></div>{badge && <span className="rounded-lg bg-[#0EA5E9] px-2.5 py-1 text-xs font-bold text-white">{badge}</span>}</div><div className="mt-5 grid gap-2">{features.map((feature) => <div key={feature} className="flex items-start gap-2 text-sm text-slate-600"><Check size={16} className="mt-0.5 shrink-0 text-emerald-500" /><span>{feature}</span></div>)}</div><div className="mt-5 flex items-end justify-end gap-1"><span className="text-2xl font-extrabold text-[#071A52]">{price}</span><span className="pb-1 text-xs text-slate-500">/month</span></div></div></div></button>;
}

export function ReviewItem({ label, value, secondary }) {
  return <div className="border-l-2 border-slate-100 pl-4 first:border-l-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 font-bold text-[#071A52]">{value}</p><p className="mt-1 text-sm text-slate-500">{secondary}</p></div>;
}
