import privateAxiosInstance from '../../auth/privateAxiosInstance';

const authBasePath = '/auths';

export async function changePassword({ currentPassword, newPassword }) {
  const endpoint = `${authBasePath}/change-password`;
  console.log('Password change request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.patch(endpoint, {
      currentPassword,
      newPassword,
    });
    console.log('Password change response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Password change request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
