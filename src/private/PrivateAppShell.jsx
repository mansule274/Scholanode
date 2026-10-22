import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useUserContext } from '../context/UserContext';
import { getRoleLabel, normalizeRole, ROLES } from '../utils/roles';
import { getSidebarSectionsForUser } from './sidebarNavigation';

const sectionToneClasses = {
  blue: 'border-blue-100 bg-blue-50/50 text-blue-800',
  cyan: 'border-cyan-100 bg-cyan-50/50 text-cyan-800',
  violet: 'border-violet-100 bg-violet-50/50 text-violet-800',
  amber: 'border-amber-100 bg-amber-50/50 text-amber-800',
  slate: 'border-slate-200 bg-slate-50/70 text-slate-700',
};

/**
 * ============================================================================
 * PRIVATE APP SHELL
 * ============================================================================
 * Responsive layout container for authenticated school staff and leaders.
 * Dynamically filters navigation based on the user's role (LEADER, VICE_LEADER, etc.)
 * via getSidebarSectionsForUser.
 */
export default function PrivateAppShell({ children, pageTitle = 'Dashboard' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const { user, logout } = useUserContext();
  const role = user?.role;
  console.log('PrivateAppShell: user role:', role);
  const normalizedRole = normalizeRole(role);
  const isLeader = normalizedRole === ROLES.LEADER;
  const isVice = normalizedRole === ROLES.VICE_LEADER;

  // Role-filtered navigation sections (LEADER and VICE_LEADER see all school management sections)
  const sections = getSidebarSectionsForUser(user);

  // Derive dynamic user display details
  const displayName =
    user?.fullName ||
    user?.name ||
    (user?.firstName
      ? `${user.firstName} ${user.lastName || user.surName || user.surname || ''}`.trim()
      : '') ||
    (isLeader ? 'Leader' : isVice ? 'Vice Leader' : 'School account');

  const displayRole =
    getRoleLabel(role) ||
    (isLeader ? 'Leader' : isVice ? 'Vice Leader' : 'School account');

  const getInitials = () => {
    const lastName = user?.lastName || user?.surName || user?.surname;
    if (user?.firstName && lastName) {
      return `${user.firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user?.name) {
      const parts = user.name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (isLeader) return 'SL';
    if (isVice) return 'VL';
    return 'SA';
  };

  const initials = getInitials();

  const handleLogout = async () => {
    try {
      if (logout) await logout();
    } finally {
      navigate('/', { replace: true });
    }
  };

  const renderNavItems = (items) => {
    return (
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          if (item.isLogout) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} />
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#071A52] text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#071A52]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    );
  };

  const renderSections = () => sections.map((section) => (
    <section
      key={section.title}
      className={`rounded-2xl border p-2.5 ${sectionToneClasses[section.tone] || sectionToneClasses.slate}`}
    >
      <h2 className="mb-2 px-2 pt-1 text-[11px] font-extrabold uppercase tracking-[0.14em]">
        {section.title}
      </h2>
      {renderNavItems(section.items)}
    </section>
  ));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] flex-col border-r border-slate-200 bg-white shadow-sm lg:flex">
        {/* Brand / Logo */}
        <div className="flex h-[80px] items-center justify-between border-b border-slate-100 px-5">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071A52] text-lg font-bold text-white shadow-sm">
              S
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-[#071A52]">
                ScholaNode
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                School Portal
              </div>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A2463] text-sm font-bold text-white shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">{displayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="truncate text-xs font-medium text-slate-500">{displayRole}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role-Filtered Navigation */}
        <nav aria-label="Main navigation" className="flex-1 space-y-3 overflow-y-auto px-3 py-5">
          {renderSections()}
        </nav>

        {/* Protected Status Banner */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-2xl bg-emerald-50 px-3 py-3 text-sm text-emerald-800 border border-emerald-100">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck size={15} />
              <span>Executive portal</span>
            </div>
            <p className="mt-1 text-xs text-emerald-700">
              Role permissions active for {displayRole}.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-[270px]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="flex h-[80px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden hover:bg-slate-50"
                aria-label="Open sidebar menu"
              >
                <Menu size={19} />
              </button>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  {displayRole} Workspace
                </p>
                <h1 className="text-xl font-extrabold text-[#071A52]">{pageTitle}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/private/notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-[#071A52]"
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
              </Link>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A2463] text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-bold text-slate-700">{displayName}</p>
                  <p className="text-[10px] text-slate-400">{displayRole}</p>
                </div>
                <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs lg:hidden">
          <div className="h-full w-[86%] max-w-sm bg-white p-4 shadow-2xl flex flex-col">
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#071A52] text-white font-bold">
                  S
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[#071A52]">ScholaNode</div>
                  <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    {displayRole}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto py-2">
              {renderSections()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
