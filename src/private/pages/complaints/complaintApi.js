import privateAxiosInstance from '../../../auth/privateAxiosInstance';

const complaintsBasePath = '/complaints';

function buildParams(values) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );
}

export async function getMyComplaints({ status = '', page = 1, limit = 10 } = {}) {
  const endpoint = `${complaintsBasePath}/my`;
  const params = buildParams({ status, page, limit });
  console.log('My complaints request starting:', endpoint, params);

  try {
    const response = await privateAxiosInstance.get(endpoint, { params });
    console.log('My complaints response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('My complaints request error:', {
      endpoint,
      params,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function getSchoolComplaints({
  status = '',
  category = '',
  startDate = '',
  endDate = '',
  page = 1,
  limit = 10,
} = {}) {
  const endpoint = complaintsBasePath;
  const params = buildParams({ status, category, startDate, endDate, page, limit });
  console.log('School complaints request starting:', endpoint, params);

  try {
    const response = await privateAxiosInstance.get(endpoint, { params });
    console.log('School complaints response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('School complaints request error:', {
      endpoint,
      params,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function createComplaint(payload) {
  const endpoint = `${complaintsBasePath}/`;
  console.log('Complaint submission request starting:', endpoint, payload);

  try {
    const response = await privateAxiosInstance.post(endpoint, payload);
    console.log('Complaint submission response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Complaint submission request error:', {
      endpoint,
      payload,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function updateComplaintStatus(complaintId, { status, resolutionNote }) {
  const endpoint = `${complaintsBasePath}/${encodeURIComponent(complaintId)}/status`;
  const payload = { status, resolutionNote };
  console.log('Complaint status update request starting:', endpoint, payload);

  try {
    const response = await privateAxiosInstance.patch(endpoint, payload);
    console.log('Complaint status update response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Complaint status update request error:', {
      endpoint,
      payload,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
