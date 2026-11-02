import privateAxiosInstance from '../../../auth/privateAxiosInstance';

const supportsBasePath = '/supports';

function buildParams(values) {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== '' && value !== undefined && value !== null,
    ),
  );
}

export async function getMySupportConversations({
  page = 1,
  limit = 20,
  status = '',
  category = '',
} = {}) {
  const endpoint = supportsBasePath;
  const params = buildParams({ page, limit, status, category });
  console.log('[support] Conversations request starting', { endpoint, params });

  try {
    const response = await privateAxiosInstance.get(endpoint, { params });
    console.log('[support] Conversations response', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('[support] Conversations request error', {
      endpoint,
      params,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function getSupportMessages(
  conversationId,
  { page = 1, limit = 50 } = {},
) {
  const endpoint = `${supportsBasePath}/${encodeURIComponent(conversationId)}/messages`;
  const params = buildParams({ page, limit });
  console.log('[support] Messages request starting', { endpoint, params });

  try {
    const response = await privateAxiosInstance.get(endpoint, { params });
    console.log('[support] Messages response', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('[support] Messages request error', {
      endpoint,
      params,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function createSupportConversation({ category, message }) {
  const endpoint = `${supportsBasePath}/`;
  const payload = { category, message };

  console.log('[support] Create conversation request starting', {
    endpoint,
    category,
    messageLength: message?.length || 0,
  });

  try {
    const response = await privateAxiosInstance.post(endpoint, payload);
    console.log('[support] Create conversation response', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('[support] Create conversation request error', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function sendSupportMessage(conversationId, { message }) {
  const endpoint = `${supportsBasePath}/${encodeURIComponent(conversationId)}/messages`;
  const payload = { message };

  console.log('[support] Send message request starting', {
    endpoint,
    messageLength: message?.length || 0,
  });

  try {
    const response = await privateAxiosInstance.post(endpoint, payload);
    console.log('[support] Send message response', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('[support] Send message request error', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function reopenSupportConversation(conversationId) {
  const endpoint = `${supportsBasePath}/${encodeURIComponent(conversationId)}/reopen`;
  console.log('[support] Reopen conversation request starting', { endpoint });

  try {
    const response = await privateAxiosInstance.patch(endpoint);
    console.log('[support] Reopen conversation response', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('[support] Reopen conversation request error', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
