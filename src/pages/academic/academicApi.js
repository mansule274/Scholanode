import privateAxiosInstance from '../../auth/privateAxiosInstance';

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
  const response = await privateAxiosInstance.post(`${academicBasePath}/session`, {
    session,
    terms,
  });
  return response.data;
}

export async function createAcademicSubject(subjectName) {
  const response = await privateAxiosInstance.post(`${academicBasePath}/subject`, {
    subjectName,
  });
  return response.data;
}

export async function createAcademicClass(classLevel, arm) {
  const response = await privateAxiosInstance.post(`${academicBasePath}/class`, {
    classLevel,
    arm,
  });
  return response.data;
}
