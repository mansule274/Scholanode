import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Settings2,
  ShieldCheck,
  Sparkles,
  User,
  UserRound,
  Users,
  AlertCircle,
  ClipboardCheck,
  History,
  Megaphone,
} from 'lucide-react';
import { normalizeRole, ROLES } from '../utils/roles';

const administratorRoles = [ROLES.LEADER, ROLES.VICE_LEADER, ROLES.ADMINISTRATOR];

const studentNavigation = [
  {
    title: 'Overview',
    tone: 'blue',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { label: 'My Profile', icon: User, path: '/profile' },
    ],
  },
  {
    title: 'Academic',
    tone: 'violet',
    items: [
      { label: 'My Subjects', icon: BookOpen, path: '/student-subjects' },
      { label: 'My Attendance', icon: ClipboardCheck, path: '/student-attendance' },
      { label: 'My Results', icon: FileText, path: '/student-results' },
    ],
  },
  {
    title: 'School',
    tone: 'cyan',
    items: [
      { label: 'Announcements', icon: Megaphone, path: '/announcements' },
      { label: 'Complaints', icon: AlertCircle, path: '/complaints' },
    ],
  },
  {
    title: 'Account',
    tone: 'slate',
    items: [
      { label: 'School Profile', icon: Building2, path: '/school-profile' },
      { label: 'Settings', icon: Settings2, path: '/settings' },
      { label: 'Logout', icon: LogOut, isLogout: true },
    ],
  },
];

const navigation = [
  {
    title: 'Overview',
    tone: 'blue',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { label: 'My Profile', icon: User, path: '/profile' },
      { label: 'My Class', icon: GraduationCap, path: '/my-class', requiresFormMaster: true },
    ],
  },
  {
    title: 'People',
    tone: 'cyan',
    items: [
      { label: 'Students', icon: Users, path: '/students', allowedRoles: administratorRoles },
      { label: 'Staff', icon: User, path: '/staff', allowedRoles: administratorRoles },
      { label: 'Parents', icon: UserRound, path: '/parents', allowedRoles: administratorRoles },
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
      { label: 'Results', icon: FileText, path: '/results', allowedRoles: [ROLES.EXAM_OFFICER, ROLES.ADMINISTRATOR] },
    ],
  },
  {
    title: 'School',
    tone: 'cyan',
    items: [
      { label: 'Announcements', icon: Megaphone, path: '/announcements' },
      {
        label: 'Complaints',
        icon: AlertCircle,
        path: '/complaints',
        allowedRoles: [ROLES.STAFF, ROLES.EXAM_OFFICER, ROLES.PARENT, ROLES.ADMINISTRATOR],
      },
    ],
  },
  {
    title: 'Operations',
    tone: 'amber',
    items: [
      { label: 'Gate Access', icon: ShieldCheck, path: '/gate-access', allowedRoles: administratorRoles },
      { label: 'Verify Student', icon: ShieldCheck, path: '/verify-student', allowedRoles: [ROLES.SECURITY] },
      { label: 'Scan History', icon: History, path: '/scan-history', allowedRoles: [ROLES.SECURITY] },
      { label: 'Attendance', icon: ShieldCheck, path: '/attendance', requiresFormMaster: true },
      { label: 'Messages', icon: MessageSquareText, path: '/messages', allowedRoles: administratorRoles },
    ],
  },
  {
    title: 'Account',
    tone: 'slate',
    items: [
      { label: 'School Profile', icon: Building2, path: '/school-profile' },
      { label: 'Settings', icon: Settings2, path: '/settings' },
      { label: 'Notifications', icon: Bell, path: '/notifications' },
      { label: 'Refer & Earn', icon: Sparkles, path: '/refer-earn' },
      { label: 'Logout', icon: LogOut, isLogout: true },
    ],
  },
];

export function getSidebarSectionsForUser(user) {
  const role = normalizeRole(user?.role);
  const isLeaderOrVice = role === ROLES.LEADER || role === ROLES.VICE_LEADER;
  const isFormMaster = Boolean(user?.isFormMaster);

  if (role === ROLES.STUDENT) {
    return studentNavigation;
  }

  return navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.requiresFormMaster && !isFormMaster) {
          return false;
        }

        if (item.requiresFormMaster && isFormMaster) {
          return true;
        }

        return !item.allowedRoles ||
          isLeaderOrVice ||
          item.allowedRoles.some((allowedRole) => normalizeRole(allowedRole) === role);
      }),
    }))
    .filter((section) => section.items.length > 0);
}
