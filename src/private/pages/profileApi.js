import privateAxiosInstance from '../../auth/privateAxiosInstance';

const profilesBasePath = '/profiles';

function redactSignedUrls(data) {
  if (!data || typeof data !== 'object') return data;

  const safeData = { ...data };
  delete safeData.uploadUrl;

  if (safeData.user && typeof safeData.user === 'object') {
    safeData.user = { ...safeData.user };
    delete safeData.user.profileImageUrl;
  }

  return safeData;
}

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

export async function requestProfileImageUploadUrl({
  fileName,
  contentType,
  fileSize,
}) {
  const endpoint = `${profilesBasePath}/image/upload-url`;

  console.log('[profile] Requesting profile image upload URL', {
    endpoint,
    fileName,
    contentType,
    fileSize,
  });

  try {
    const response = await privateAxiosInstance.post(endpoint, {
      fileName,
      contentType,
      fileSize,
    });

    console.log('[profile] Profile image upload URL response', {
      status: response.status,
      data: redactSignedUrls(response.data),
    });

    return response.data;
  } catch (error) {
    console.error('[profile] Profile image upload URL error', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function confirmProfileImageUpload({ key }) {
  const endpoint = `${profilesBasePath}/image/confirm`;

  console.log('[profile] Confirming profile image upload', {
    endpoint,
    key,
  });

  try {
    const response = await privateAxiosInstance.patch(endpoint, { key });

    console.log('[profile] Profile image confirmation response', {
      status: response.status,
      data: redactSignedUrls(response.data),
    });

    return response.data;
  } catch (error) {
    console.error('[profile] Profile image confirmation error', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
