import privateAxiosInstance from '../../auth/privateAxiosInstance';

const staffBasePath = '/staffs';

export async function getStaff() {
  const endpoint = `${staffBasePath}/get-all`;
  console.log('Staff request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.get(endpoint);
    console.log('Staff response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Staff request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function getLeaderStatus() {
  const endpoint = `${staffBasePath}/leader-status`;
  console.log('Leader status request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.get(endpoint);
    console.log('Leader status response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Leader status request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function inviteStaff(invitation) {
  const endpoint = `${staffBasePath}/invite`;
  console.log('Staff invitation request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.post(endpoint, invitation);
    console.log('Staff invitation response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Staff invitation request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function importStaffCsv(payload) {
  const endpoint = `${staffBasePath}/import-csv`;
  console.log('Staff CSV import request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.post(endpoint, payload, {
      timeout: 120000,
    });
    console.log('Staff CSV import response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Staff CSV import request error:', {
      endpoint,
      status: error?.response?.status,
      code: error?.code,
      data: error?.response?.data,
      message: error?.message,
      timeout: error?.config?.timeout,
      timedOut: error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT',
    });
    throw error;
  }
}

export async function updateStaff(staffId, staffDetails) {
  const endpoint = `${staffBasePath}/${encodeURIComponent(staffId)}`;
  console.log('Staff update request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.patch(endpoint, staffDetails);
    console.log('Staff update response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Staff update request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function resetStaffPassword(staffId) {
  const endpoint = `${staffBasePath}/${encodeURIComponent(staffId)}/reset-password`;
  console.log('Staff password reset request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.patch(endpoint);
    console.log('Staff password reset response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Staff password reset request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function deactivateStaff(staffId) {
  const endpoint = `${staffBasePath}/${encodeURIComponent(staffId)}/deactivate`;
  console.log('Staff deactivation request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.patch(endpoint);
    console.log('Staff deactivation response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Staff deactivation request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function activateStaff(staffId) {
  const endpoint = `${staffBasePath}/${encodeURIComponent(staffId)}/activate`;
  console.log('Staff activation request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.patch(endpoint);
    console.log('Staff activation response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Staff activation request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
