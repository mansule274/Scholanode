import privateAxiosInstance from '../../../auth/privateAxiosInstance';

const announcementsBasePath = '/announcements';

export async function getMyAnnouncements({ page = 1, limit = 10, search = '' } = {}) {
  const endpoint = `${announcementsBasePath}/my`;
  const params = {
    page,
    limit,
    ...(search.trim() ? { search: search.trim() } : {}),
  };
  console.log('My announcements request starting:', endpoint, params);

  try {
    const response = await privateAxiosInstance.get(endpoint, { params });
    console.log('My announcements response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('My announcements request error:', {
      endpoint,
      params,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function getAnnouncements({ page = 1, limit = 10, search = '', audience = '' } = {}) {
  const endpoint = announcementsBasePath;
  const params = {
    page,
    limit,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(audience ? { audience } : {}),
  };
  console.log('Announcements request starting:', endpoint, params);

  try {
    const response = await privateAxiosInstance.get(endpoint, { params });
    console.log('Announcements response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Announcements request error:', {
      endpoint,
      params,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function createAnnouncement(payload) {
  const endpoint = `${announcementsBasePath}/`;
  console.log('Announcement creation request starting:', endpoint, payload);

  try {
    const response = await privateAxiosInstance.post(endpoint, payload);
    console.log('Announcement creation response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Announcement creation request error:', {
      endpoint,
      payload,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function deleteAnnouncement(announcementId) {
  const endpoint = `${announcementsBasePath}/${encodeURIComponent(announcementId)}`;
  console.log('Announcement deletion request starting:', endpoint);

  try {
    const response = await privateAxiosInstance.delete(endpoint);
    console.log('Announcement deletion response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Announcement deletion request error:', {
      endpoint,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}
