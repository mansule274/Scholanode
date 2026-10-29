import { useUserContext } from '../../context/UserContext';
import { normalizeRole, ROLES } from '../../utils/roles';
import AdministrativeDashboard from './AdministrativeDashboard';
import ParentDashboard from './ParentDashboard';
import SecurityDashboard from './SecurityDashboard';
import StaffDashboard from './StaffDashboard';
import StudentDashboard from './StudentDashboard';

export default function Dashboard() {
  const { user } = useUserContext();
  const role = normalizeRole(user?.role);

  if (
    role === ROLES.LEADER ||
    role === ROLES.VICE_LEADER ||
    role === ROLES.ADMINISTRATOR
  ) {
    return <AdministrativeDashboard />;
  }

  if (role === ROLES.STUDENT) {
    return <StudentDashboard />;
  }

  if (role === ROLES.SECURITY) {
    return <SecurityDashboard />;
  }

  if (role === ROLES.PARENT) {
    return <ParentDashboard />;
  }

  return <StaffDashboard />;
}

