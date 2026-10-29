import privateAxiosInstance from '../../../auth/privateAxiosInstance';
import publicAxiosInstance from '../../../auth/publicAxiosInstance';

const gateSecuritiesBasePath = '/gate-securities';

/**
 * Fetch all gate security personnel along with status summary
 * Backend: GET /gate-securities
 * Expected response: { success: true, securityPersonnel: [...], summary: { total, active, inactive, suspended } }
 */
export async function getGateSecurities() {
  const endpoint = gateSecuritiesBasePath;
  console.log('🚀 [gateAccessApi] Fetching securities starting at:', endpoint);

  try {
    const response = await privateAxiosInstance.get(endpoint);
    console.log('✅ [gateAccessApi] Fetch securities SUCCESS response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('❌ [gateAccessApi] Fetch securities ERROR:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

/**
 * Update a gate security personnel account
 * Backend: PATCH /gate-securities/:securityId
 * Expected payload: { firstName?, surName?, email? }
 */
export async function updateGateSecurity(securityId, payload) {
  const endpoint = `${gateSecuritiesBasePath}/${encodeURIComponent(securityId)}`;
  console.log('🚀 [gateAccessApi] Update security request:', { endpoint, payload });

  try {
    const response = await privateAxiosInstance.patch(endpoint, payload);
    console.log('✅ [gateAccessApi] Update security SUCCESS response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('❌ [gateAccessApi] Update security ERROR:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

/**
 * Deactivate or reactivate a gate security account
 * Backend: PATCH /gate-securities/:securityId/(deactivate|activate)
 */
export async function setGateSecurityStatus(securityId, nextActive) {
  const action = nextActive ? 'activate' : 'deactivate';
  const endpoint = `${gateSecuritiesBasePath}/${encodeURIComponent(securityId)}/${action}`;
  console.log('🚀 [gateAccessApi] Security status request:', { endpoint });

  try {
    const response = await privateAxiosInstance.patch(endpoint);
    console.log('✅ [gateAccessApi] Security status SUCCESS response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('❌ [gateAccessApi] Security status ERROR:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

/**
 * Send a password recovery email to a security account
 * Backend: POST /auths/forgot-password
 */
export async function sendPasswordRecovery(email) {
  const endpoint = '/auths/forgot-password';
  console.log('🚀 [gateAccessApi] Password recovery request:', { endpoint, email });

  try {
    const response = await publicAxiosInstance.post(endpoint, { email });
    console.log('✅ [gateAccessApi] Password recovery SUCCESS response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('❌ [gateAccessApi] Password recovery ERROR:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

/**
 * Create a new gate security personnel account
 * Backend: POST /gate-securities
 * Expected payload: { firstName, surName, email }
 * Expected response: { success: true, message: "...", securityPersonnel: { ... } }
 */
export async function createGateSecurity(payload) {
  const endpoint = gateSecuritiesBasePath;
  console.log('🚀 [gateAccessApi] Create security request starting with payload:', payload);

  try {
    const response = await privateAxiosInstance.post(endpoint, payload);
    console.log('✅ [gateAccessApi] Create security SUCCESS response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('❌ [gateAccessApi] Create security ERROR:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
