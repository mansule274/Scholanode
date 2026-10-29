import privateAxiosInstance from '../../auth/privateAxiosInstance';

const parentsBasePath = '/parents';

export async function getParentDashboard() {
  const endpoint = `${parentsBasePath}/dashboard`;
  console.log('Parent dashboard request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.get(endpoint);
    console.log('Parent dashboard response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Parent dashboard request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function getParents({ page = 1, limit = 20, search, status, relationship } = {}) {
  const endpoint = `${parentsBasePath}/get-all`;
  const params = {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(status && status !== 'ALL' ? { status } : {}),
    ...(relationship && relationship !== 'ALL' ? { relationship } : {}),
  };
  console.log('Parents request starting:', endpoint, params);

  try {
    const response = await privateAxiosInstance.get(endpoint, { params });
    console.log('Parents response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Parents request error:', {
      endpoint,
      params,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function getAllParents() {
  const firstResponse = await getParents();
  const firstPage = firstResponse?.data;
  if (!Array.isArray(firstPage?.parents) || !firstPage.pagination) {
    throw new Error('The server returned an invalid parent list.');
  }

  const allParents = [...firstPage.parents];
  const totalPages = Number(firstPage.pagination.totalPages) || 1;
  const limit = Number(firstPage.pagination.limit) || 20;

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await getParents({ page, limit });
    const pageData = response?.data;
    if (!Array.isArray(pageData?.parents) || !pageData.pagination) {
      throw new Error(`The server returned an invalid parent list for page ${page}.`);
    }
    allParents.push(...pageData.parents);
  }

  return allParents;
}

export async function createParent(parentPayload) {
  const endpoint = `${parentsBasePath}/create`;
  console.log('Parent creation request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.post(endpoint, parentPayload);
    console.log('Parent creation response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Parent creation request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function importParentsCsv(payload) {
  const endpoint = `${parentsBasePath}/import-csv`;
  console.log('Parent CSV import request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.post(endpoint, payload, {
      timeout: 120000,
    });
    console.log('Parent CSV import response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Parent CSV import request error:', {
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

export async function linkStudentToParent({ parentId, studentId, relationship }) {
  const endpoint = `${parentsBasePath}/link-student`;
  const payload = { parentId, studentId, relationship };
  console.log('Parent-student link request starting:', endpoint, payload);

  try {
    const response = await privateAxiosInstance.post(endpoint, payload);
    console.log('Parent-student link response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Parent-student link request error:', {
      endpoint,
      payload,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function unlinkStudentFromParent({ parentId, studentId }) {
  const endpoint = `${parentsBasePath}/unlink-student`;
  const payload = { parentId, studentId };
  console.log('Parent-student unlink request starting:', endpoint, payload);

  try {
    const response = await privateAxiosInstance.delete(endpoint, { data: payload });
    console.log('Parent-student unlink response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Parent-student unlink request error:', {
      endpoint,
      payload,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function deleteParent(parentId) {
  const endpoint = `${parentsBasePath}/delete/${encodeURIComponent(parentId)}`;
  console.log('Parent deletion request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.delete(endpoint);
    console.log('Parent deletion response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Parent deletion request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
