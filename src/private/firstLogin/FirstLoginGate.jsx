import { useUserContext } from '../../context/UserContext';
import CompleteProfile from './CompleteProfile';
import ForcePasswordChange from './ForcePasswordChange';

// An invited account is not usable until its owner has set a private password
// and supplied real details, so the whole app stays behind these two steps.
export default function FirstLoginGate({ children }) {
  const { user } = useUserContext();

  if (user?.mustChangePassword) {
    return <ForcePasswordChange />;
  }

  // Only an explicit false blocks the app: accounts created before these flags
  // existed, or payloads that omit them, must not be locked out.
  if (user?.profileCompleted === false) {
    return <CompleteProfile />;
  }

  return children;
}
