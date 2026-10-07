import publicAxiosInstance from '../../auth/publicAxiosInstance';

export async function getPlanPrice(plan) {
  if (!plan || plan === 'free') return 0;
  const response = await publicAxiosInstance.get(`/plans/${plan}`);
  return response.data?.data;
}

export async function checkSchoolCode(schoolCode) {
  const response = await publicAxiosInstance.get('/schools/check-code', {
    params: { schoolCode },
  });
  const result = response.data?.data || response.data;
  return result?.taken === true || result?.available === false
    ? 'taken'
    : 'available';
}

export async function createSchoolWithAdmin(schoolData, adminData, plan) {
  const response = await publicAxiosInstance.post('/schools/register', {
    school: schoolData,
    admin: adminData,
    plan,
  });
  return response.data;
}

export async function initializePayment(schoolId, paymentData) {
  const response = await publicAxiosInstance.post(
    `/payments/schools/${schoolId}/initialize`,
    paymentData
  );

  return response.data;
}

export async function resendVerification(email) {
  console.log('API: resendVerification request', { email });
  try {
    const response = await publicAxiosInstance.post('/auths/resend-verification', {
      email,
    });
    return response.data;
  } catch (error) {
    console.error('API: resendVerification error', error?.response?.data || error);
    throw error;
  }
}

export async function checkVerification(email) {
  console.log('API: checkVerification request', { email });
  try {
    const response = await publicAxiosInstance.get('/auths/check-verification', {
      params: { email },
    });

    const result = response.data?.data ?? response.data;
    console.log('API: checkVerification result', response.data);
    return result?.verified === true;
  } catch (error) {
    console.error('API: checkVerification error', error?.response?.data || error);
    throw error;
  }
}

export async function verifyCode(email, code) {
  const payload = { email, code };
  console.log('API: verifyCode request payload', payload);
  try {
    const response = await publicAxiosInstance.post('/verification/owner-email/verify', payload);
    const result = response.data?.data ?? response.data;
    console.log('API: verifyCode response', response.data);

    const isSuccess = response.data?.status === 'success' || result?.status === 'success';
    if (isSuccess) return true;

    return result?.verified === true || result?.success === true;
  } catch (error) {
    console.error('API: verifyCode error', {
      payload,
      error: error?.response?.data || error,
    });
    throw error;
  }
}
