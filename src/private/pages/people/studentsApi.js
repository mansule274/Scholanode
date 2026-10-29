import privateAxiosInstance from '../../../auth/privateAxiosInstance';

const studentsBasePath = '/students';

export async function getStudents({
  page = 1,
  limit = 20,
  search = '',
  currentClassId,
  gender,
  admissionStatus,
} = {}) {
  const endpoint = `${studentsBasePath}/get-all`;
  const params = {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(currentClassId ? { currentClassId } : {}),
    ...(gender ? { gender } : {}),
    ...(admissionStatus ? { admissionStatus } : {}),
  };
  console.log('Students request starting:', endpoint, params);

  try {
    const response = await privateAxiosInstance.get(endpoint, { params });
    console.log('Students response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Students request error:', {
      endpoint,
      params,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function createStudent(studentPayload) {
  const endpoint = `${studentsBasePath}/create`;
  console.log('Student creation request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.post(endpoint, studentPayload);
    console.log('Student creation response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Student creation request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function importStudents(payload) {
  const endpoint = `${studentsBasePath}/import`;
  console.log('Student import request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.post(endpoint, payload, {
      timeout: 120000,
    });
    console.log('Student import response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Student import request error:', {
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
