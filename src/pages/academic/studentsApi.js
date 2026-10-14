import privateAxiosInstance from '../../auth/privateAxiosInstance';

const studentsBasePath = '/students';

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
