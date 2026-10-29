import privateAxiosInstance from '../../auth/privateAxiosInstance';

const profilesBasePath = '/profiles';

export async function updateProfile({ firstName, surName }) {
  const endpoint = `${profilesBasePath}/`;
  console.log('Profile update request starting:', endpoint, { firstName, surName });

  try {
    const response = await privateAxiosInstance.patch(endpoint, {
      firstName,
      surName,
    });
    console.log('Profile update response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Profile update request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function requestEmailChange({ newEmail, currentPassword }) {
  const endpoint = `${profilesBasePath}/email-change/request`;
  console.log('Email change request starting:', endpoint, { newEmail });

  try {
    const response = await privateAxiosInstance.post(endpoint, {
      newEmail,
      currentPassword,
    });
    console.log('Email change request response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Email change request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function verifyEmailChange({ newEmail, code }) {
  const endpoint = `${profilesBasePath}/email-change/verify`;
  console.log('Email change verification starting:', endpoint, { newEmail });

  try {
    const response = await privateAxiosInstance.post(endpoint, {
      newEmail,
      code,
    });
    console.log('Email change verification response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Email change verification error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
