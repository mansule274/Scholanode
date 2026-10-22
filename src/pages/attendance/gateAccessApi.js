import privateAxiosInstance from '../../auth/privateAxiosInstance';

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
