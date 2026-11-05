import { Eye, EyeOff } from 'lucide-react';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100';

const labelClass = 'mb-1.5 block text-[13px] font-semibold text-slate-700';

export default function PasswordField({
  label,
  name,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
  autoComplete,
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={inputClass}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}
