import privateAxiosInstance from '../../auth/privateAxiosInstance';

const sessionsTermsBasePath = '/sessions-terms';

export async function getAcademicSessions() {
  const endpoint = `${sessionsTermsBasePath}/`;
  console.log('Academic sessions request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.get(endpoint);
    console.log('Academic sessions response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Academic sessions request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function updateAcademicSession(sessionId, session, terms) {
  const endpoint = `${sessionsTermsBasePath}/session/${encodeURIComponent(sessionId)}/`;
  console.log('Academic session update request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.patch(endpoint, { session, terms });
    console.log('Academic session update response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Academic session update request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function activateAcademicSession(sessionId) {
  const endpoint = `${sessionsTermsBasePath}/${encodeURIComponent(sessionId)}/activate`;
  console.log('Academic session activation request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.patch(endpoint);
    console.log('Academic session activation response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Academic session activation request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function completeAcademicSession(sessionId) {
  const endpoint = `${sessionsTermsBasePath}/${encodeURIComponent(sessionId)}/complete/`;
  console.log('Academic session completion request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.patch(endpoint);
    console.log('Academic session completion response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Academic session completion request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function archiveAcademicSession(sessionId) {
  const endpoint = `${sessionsTermsBasePath}/${encodeURIComponent(sessionId)}`;
  console.log('Academic session archive request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.delete(endpoint);
    console.log('Academic session archive response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Academic session archive request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function activateAcademicTerm(sessionId, termId) {
  const endpoint = `${sessionsTermsBasePath}/${encodeURIComponent(sessionId)}/terms/${encodeURIComponent(termId)}/activate`;
  console.log('Academic term activation request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.patch(endpoint);
    console.log('Academic term activation response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Academic term activation request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function completeAcademicTerm(sessionId, termId) {
  const endpoint = `${sessionsTermsBasePath}/${encodeURIComponent(sessionId)}/terms/${encodeURIComponent(termId)}/complete`;
  console.log('Academic term completion request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.patch(endpoint);
    console.log('Academic term completion response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Academic term completion request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
