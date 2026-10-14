import privateAxiosInstance from '../../auth/privateAxiosInstance';

const subjectsBasePath = '/subjects';

export async function getSubjects() {
  const endpoint = `${subjectsBasePath}/get-all`;
  console.log('Subjects request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.get(endpoint);
    console.log('Subjects response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Subjects request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function updateSubject(subjectId, subjectName) {
  const endpoint = `${subjectsBasePath}/subject/${encodeURIComponent(subjectId)}`;
  console.log('Subject update request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.patch(endpoint, { subjectName });
    console.log('Subject update response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Subject update request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function deactivateSubject(subjectId) {
  const endpoint = `${subjectsBasePath}/subject/${encodeURIComponent(subjectId)}/deactivate`;
  console.log('Subject deactivation request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.patch(endpoint);
    console.log('Subject deactivation response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Subject deactivation request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function activateSubject(subjectId) {
  const endpoint = `${subjectsBasePath}/subject/${encodeURIComponent(subjectId)}/activate`;
  console.log('Subject activation request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.patch(endpoint);
    console.log('Subject activation response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Subject activation request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
