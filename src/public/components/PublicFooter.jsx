import { Link } from 'react-router-dom';
import { ArrowUpRight, GraduationCap, ShieldCheck } from 'lucide-react';

const linkGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Watch demo', to: '/watch-demo' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Get started', to: '/get-started' },
    ],
  },
  {
    title: 'Schools',
    links: [
      { label: 'School login', to: '/school-login' },
      { label: 'School contact', to: '/school-contact' },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#071A52] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.6fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <GraduationCap size={20} />
              </span>
              <span>
                <span className="block text-base font-extrabold tracking-tight">
                  ScholaNode
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  School management platform
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
              One secure platform for students, parents, teachers, and school
              leaders to stay connected.
            </p>

            <a
              href="https://masjiba.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              A HumNode product
              <ArrowUpRight size={15} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {linkGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                  {group.title}
                </h3>

                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-sm font-medium text-white/75 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} ScholaNode. All rights reserved.
          </p>

          <p className="inline-flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck size={14} />
            Secure access for students, parents, and school staff.
          </p>
        </div>
      </div>
    </footer>
  );
}
