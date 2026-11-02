import { Navigate } from 'react-router-dom';

import { useUserContext } from '../context/UserContext';
import { normalizeRole, ROLES } from '../utils/roles';

const ADMINISTRATOR_ROLES = [ROLES.LEADER, ROLES.VICE_LEADER, ROLES.ADMINISTRATOR];

export default function RequireAdministrator({ allowOwner = false, children }) {
  const { user } = useUserContext();
  const role = normalizeRole(user?.role);
  const isAdministrator = ADMINISTRATOR_ROLES.includes(role);
  const isAllowed = isAdministrator || (allowOwner && Boolean(user?.isOwner));

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
