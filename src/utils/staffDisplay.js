// Invited staff accounts are created with placeholder names ("firstName",
// "surName") until the person signs in and completes their profile. Showing
// those literals anywhere an administrator reads names makes them look like
// real people called "firstName surName", so every surface presents the
// pending state instead and identifies the account by its invitation email.
export const PENDING_PROFILE_LABEL = 'Profile pending';
export const PENDING_PROFILE_HINT = 'Name not added yet';

const PENDING_PROFILE_NAMES = {
  firstName: 'firstName',
  surName: 'surName',
};

export function isProfilePending(staff) {
  if (!staff) return false;

  if (staff.profilePending === true) return true;

  return (
    staff.firstName === PENDING_PROFILE_NAMES.firstName &&
    staff.surName === PENDING_PROFILE_NAMES.surName
  );
}

export function getStaffDisplayName(staff) {
  if (!staff) return '';

  if (isProfilePending(staff)) {
    return staff.email || staff.loginId || PENDING_PROFILE_LABEL;
  }

  const fullName = [staff.firstName, staff.surName ?? staff.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || staff.email || 'Unnamed staff';
}

export function getStaffInitials(staff) {
  if (!staff || isProfilePending(staff)) return '';

  return `${staff.firstName?.[0] || ''}${(staff.surName ?? staff.lastName)?.[0] || ''}`.toUpperCase();
}
