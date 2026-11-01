import publicAxiosInstance from '../auth/publicAxiosInstance';

export async function getSchoolByCode(code) {
  const normalizedCode = String(code || '').trim();
  const endpoint = `/schools/get/${encodeURIComponent(normalizedCode)}`;
  console.log('School lookup request starting:', endpoint);

  try {
    const response = await publicAxiosInstance.get(endpoint);
    const data = response.data?.data ?? response.data;
    console.log('School lookup response:', {
      status: response.status,
      hasSchool: Boolean(data?.schoolCode),
    });
    return data?.schoolCode ? data : null;
  } catch (error) {
    console.error('School lookup request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
