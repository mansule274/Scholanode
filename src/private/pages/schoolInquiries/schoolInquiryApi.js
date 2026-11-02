import privateAxiosInstance from '../../../auth/privateAxiosInstance';

const schoolInquiriesBasePath = '/school-inquiries';

function buildParams(values) {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== '' && value !== undefined && value !== null
    )
  );
}

export async function getSchoolInquiries({
  page = 1,
  limit = 10,
  search = '',
  status = '',
  sortBy = 'createdAt',
  sortOrder = 'DESC',
} = {}) {
  const endpoint = schoolInquiriesBasePath;
  const params = buildParams({ page, limit, search, status, sortBy, sortOrder });
  console.log('School inquiries request starting:', endpoint, params);

  try {
    const response = await privateAxiosInstance.get(endpoint, { params });
    console.log('School inquiries response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('School inquiries request error:', {
      endpoint,
      params,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function updateSchoolInquiryStatus(inquiryId, status) {
  const endpoint = `${schoolInquiriesBasePath}/${encodeURIComponent(inquiryId)}/status`;
  const payload = { status };
  console.log('School inquiry status update request starting:', endpoint, payload);

  try {
    const response = await privateAxiosInstance.patch(endpoint, payload);
    console.log('School inquiry status update response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('School inquiry status update request error:', {
      endpoint,
      payload,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
