import publicAxiosInstance from '../../auth/publicAxiosInstance';

const contactInquiriesBasePath = '/platform-contact-inquiries';

export async function createContactInquiry(payload) {
  const endpoint = `${contactInquiriesBasePath}/`;
  console.log('Contact inquiry request starting:', endpoint, {
    category: payload.category,
    allowEmailReply: payload.allowEmailReply,
  });

  try {
    const response = await publicAxiosInstance.post(endpoint, payload);
    console.log('Contact inquiry response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Contact inquiry request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
