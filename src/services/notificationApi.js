import privateAxiosInstance from '../auth/privateAxiosInstance';

const notificationBasePath = '/notifications';

export async function getUnreadNotificationCount() {
  const response = await privateAxiosInstance.get(`${notificationBasePath}/unread-count`);
  return response.data;
}

export async function getMyNotifications({ page = 1, limit = 15 } = {}) {
  const response = await privateAxiosInstance.get(`${notificationBasePath}/my`, {
    params: { page, limit },
  });
  return response.data;
}
