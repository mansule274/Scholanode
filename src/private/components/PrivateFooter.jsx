import { ShieldCheck } from 'lucide-react';

export default function PrivateFooter() {
  return (
    <footer className="mt-6 border-t border-slate-200 bg-white/60">
      <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-2 px-4 py-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} ScholaNode. All rights reserved.
        </p>

        <p className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={13} />
          School portal
        </p>
      </div>
    </footer>
  );
}
