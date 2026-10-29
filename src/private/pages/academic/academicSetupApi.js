import privateAxiosInstance from '../../../auth/privateAxiosInstance';

// for only academic setup related API calls
const academicBasePath = '/academic-setup';


export async function getAcademicProgress() {
  const endpoint = `${academicBasePath}/progress`;
  console.log('Academic progress request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.get(endpoint);
    console.log('Academic progress raw response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Academic progress request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
      code: error?.code,
    });
    throw error;
  }
}

export async function createAcademicSession(session, terms) {
  const endpoint = `${academicBasePath}/session`;
  console.log('Academic session creation request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.post(endpoint, { session, terms });
    console.log('Academic session creation response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Academic session creation request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function createAcademicSubjects(subjectsPayload) {
  const endpoint = `${academicBasePath}/subject`;

  console.log('Academic subjects creation request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.post(endpoint, subjectsPayload);
    console.log('Academic subjects creation response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Academic subjects creation request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function saveAcademicWorkingDays(days) {
  const response = await privateAxiosInstance.post(
    `${academicBasePath}/working-days`,
    { days },
  );
  return response.data;
}

export async function createAcademicClass(classPayload) {
  const response = await privateAxiosInstance.post(`${academicBasePath}/class`, classPayload);
  return response.data;
}
