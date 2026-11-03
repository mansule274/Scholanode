const isDev = import.meta.env.VITE_ENV === 'development';

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const isLoopbackHost = (hostname) =>
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '::1' ||
  hostname === '[::1]';

const resolveDevApiUrl = () => {
  const localUrl = trimTrailingSlash(import.meta.env.VITE_API_LOCAL_URL);
  const networkUrl = trimTrailingSlash(import.meta.env.VITE_API_NETWORK_URL);

  if (typeof window === 'undefined') {
    return localUrl;
  }

  const { hostname, protocol } = window.location;

  // Desktop development always talks to the local API.
  if (isLoopbackHost(hostname)) {
    return localUrl;
  }

  // A phone or another device opened the app through a LAN address. Use the
  // configured network URL only when it points at that same host; otherwise
  // derive the API address so a changed DHCP address still works.
  if (networkUrl) {
    try {
      if (new URL(networkUrl).hostname === hostname) {
        return networkUrl;
      }
    } catch {
      // Ignore malformed values and fall back to the derived URL.
    }
  }

  const apiPort = import.meta.env.VITE_API_NETWORK_PORT || '3000';

  return trimTrailingSlash(`${protocol}//${hostname}:${apiPort}/api`);
};

const BASE_URL = isDev
  ? resolveDevApiUrl()
  : trimTrailingSlash(import.meta.env.VITE_API_PRODUCTION_URL);

export default BASE_URL;
