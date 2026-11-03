import { io } from 'socket.io-client';

import BASE_URL from '../api/config';

let socket = null;

// BASE_URL includes the API path (for example /api). Socket.IO is mounted on
// the server origin, so connect to the origin without that path.
const resolveSocketOrigin = () => {
  if (!BASE_URL) return undefined;

  try {
    return new URL(BASE_URL).origin;
  } catch {
    return BASE_URL;
  }
};

export function getNotificationSocket() {
  if (!socket) {
    socket = io(resolveSocketOrigin(), {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      // Read the token on every handshake so a refreshed access token is used.
      auth: (callback) => {
        callback({ token: localStorage.getItem('accessToken') || '' });
      },
    });
  }

  return socket;
}

export function disconnectNotificationSocket() {
  if (!socket) return;

  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
