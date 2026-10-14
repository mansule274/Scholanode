import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { normalizeRole, ROLES } from '../utils/roles';

const administratorRoles = [ROLES.LEADER, ROLES.VICE_LEADER, ROLES.ADMINISTRATOR];


const navigation = [
  {
    title: 'Overview',
    tone: 'blue',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    ],
  },
  {
    title: 'People',
    tone: 'cyan',
    items: [
      { label: 'Students', icon: Users, path: '/students', allowedRoles: administratorRoles },
      { label: 'Staff', icon: User, path: '/staff', allowedRoles: administratorRoles },
    ],
  },
  {
    title: 'Academic',
    tone: 'violet',
    items: [
      { label: 'Academic Setup', icon: Layers, path: '/academic-setup', allowedRoles: administratorRoles },
      { label: 'Classes', icon: GraduationCap, path: '/classes', allowedRoles: administratorRoles },
      { label: 'Subjects', icon: BookOpen, path: '/subjects', allowedRoles: administratorRoles },
      { label: 'Sessions & Terms', icon: CalendarDays, path: '/sessions-terms', allowedRoles: administratorRoles },
      { label: 'Results', icon: FileText, path: '/private/results', allowedRoles: [ROLES.EXAM_OFFICER, ROLES.ADMINISTRATOR] },
    ],
  },
  {
    title: 'Operations',
    tone: 'amber',
    items: [
      { label: 'Attendance', icon: ShieldCheck, path: '/private/attendance', allowedRoles: [ROLES.SECURITY, ROLES.ADMINISTRATOR] },
      { label: 'Payments', icon: CreditCard, path: '/payment', allowedRoles: administratorRoles },
      { label: 'Messages', icon: MessageSquareText, path: '/private/messages', allowedRoles: administratorRoles },
    ],
  },
  {
    title: 'Account',
    tone: 'slate',
    items: [
      { label: 'School Profile', icon: Building2, path: '/school-profile' },
      { label: 'Security', icon: ShieldCheck, path: '/private/security' },
      { label: 'Notifications', icon: Bell, path: '/private/notifications' },
      { label: 'Refer & Earn', icon: Sparkles, path: '/refer-earn' },
      { label: 'Logout', icon: LogOut, path: '/private/logout', isLogout: true },
    ],
  },
];

export function getSidebarSectionsForUser(user) {
  const role = normalizeRole(user?.role);
  const isLeaderOrVice = role === ROLES.LEADER || role === ROLES.VICE_LEADER;

  return navigation
    .map((section) => ({
      ...section,
      items: section.items.filter(({ allowedRoles }) =>
        !allowedRoles ||
        isLeaderOrVice ||
        allowedRoles.some((allowedRole) => normalizeRole(allowedRole) === role)
      ),
    }))
    .filter((section) => section.items.length > 0);
}
