import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Watch Demo', to: '/watch-demo' },
  { label: 'Contact', to: '/contact' },
];

export default function PublicAppShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071A52] text-sm font-bold text-white">
              S
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-[#071A52]">
                ScholaNode
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Public portal
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-[#071A52]' : 'text-slate-500 hover:text-[#071A52]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/get-started"
              className="inline-flex items-center justify-center rounded-xl bg-[#071A52] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0A2463]"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
