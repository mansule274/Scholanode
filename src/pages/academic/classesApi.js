import privateAxiosInstance from '../../auth/privateAxiosInstance';

const classesBasePath = '/classes';

export async function getClasses() {
  const endpoint = `${classesBasePath}/get`;
  console.log('Classes request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.get(endpoint);
    console.log('Classes response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Classes request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function assignClassFormMaster(classId, formMasterId) {
  const endpoint = `${classesBasePath}/class/${encodeURIComponent(classId)}/form-master`;
  console.log('Form master assignment request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.patch(endpoint, { formMasterId });
    console.log('Form master assignment response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Form master assignment request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
