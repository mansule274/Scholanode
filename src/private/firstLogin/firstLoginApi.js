import privateAxiosInstance from '../../auth/privateAxiosInstance';

export async function completeProfile({ firstName, surName, phoneNumber }) {
  const payload = {};

  if (firstName !== undefined) payload.firstName = firstName;
  if (surName !== undefined) payload.surName = surName;
  if (phoneNumber !== undefined) payload.phoneNumber = phoneNumber;

  const response = await privateAxiosInstance.patch(
    '/auths/complete-profile',
    payload
  );

  return response.data;
}
