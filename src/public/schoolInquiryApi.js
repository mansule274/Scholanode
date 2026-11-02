import publicAxiosInstance from '../auth/publicAxiosInstance';

const schoolInquiriesBasePath = '/school-inquiries';

export async function submitSchoolInquiry({
  schoolCode,
  fullName,
  contact,
  subject,
  message,
}) {
  const endpoint = schoolInquiriesBasePath;
  const payload = {
    schoolCode,
    fullName,
    contact,
    subject,
    message,
  };

  console.log('School inquiry submission request starting:', endpoint, payload);

  try {
    const response = await publicAxiosInstance.post(endpoint, payload);
    console.log('School inquiry submission response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('School inquiry submission request error:', {
      endpoint,
      payload,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
