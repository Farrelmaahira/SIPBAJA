import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

/**
 * Resolve base API URL from environment variable or default to '/api'.
 * Supports both VITE_API_BASE_URL and VITE_API_URL.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';

/**
 * Configure primary Axios instance for SIPBAJA REST API
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  withXSRFToken: true,
});

/**
 * Helper to retrieve a cookie value by name from document.cookie
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Helper to fetch Sanctum CSRF cookie prior to authentication or stateful requests.
 */
export const getCsrfCookie = async (): Promise<void> => {
  const rootUrl = API_BASE_URL.replace(/\/api\/?$/, '');
  const endpoint = `${rootUrl || ''}/sanctum/csrf-cookie`;

  await axios.get(endpoint, {
    withCredentials: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json',
    },
  });
};

/**
 * Request interceptor to ensure X-XSRF-TOKEN is attached if present in cookies
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken && config.headers) {
      config.headers['X-XSRF-TOKEN'] = xsrfToken;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

export default api;
