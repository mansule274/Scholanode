import { PENDING_PROFILE_LABEL } from '../../utils/staffDisplay';

export default function ProfilePendingBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      {PENDING_PROFILE_LABEL}
    </span>
  );
}
