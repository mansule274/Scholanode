import { Menu, X, GraduationCap } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = ['Home', 'Features', 'About', 'Pricing', 'Contact'];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#071A52] text-white flex items-center justify-center shadow-lg">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#071A52]">ScholarNode</h1>
              <p className="text-xs text-slate-500 -mt-1">School Management System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm font-medium text-slate-600 hover:text-[#071A52] transition-colors cursor-pointer relative group"
              >
                {link}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#071A52] transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:border-[#071A52] hover:text-[#071A52] transition-all cursor-pointer">
              Help Center
            </button>
            <button className="px-5 py-2 rounded-xl bg-[#071A52] text-white hover:bg-[#0A2463] shadow-lg shadow-[#071A52]/25 transition-all cursor-pointer">
              Get Started
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-slate-200 space-y-3">
            {links.map((link) => (
              <a
                key={link}
                href="#"
                className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-[#071A52] cursor-pointer"
              >
                {link}
              </a>
            ))}

            <div className="pt-3 flex flex-col gap-3">
              <button className="w-full px-4 py-2 rounded-xl border border-slate-200 cursor-pointer">
                Help Center
              </button>
              <button className="w-full px-4 py-2 rounded-xl bg-[#071A52] text-white cursor-pointer">
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}