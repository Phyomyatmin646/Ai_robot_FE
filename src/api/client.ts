import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Storage keys
export const TOKEN_KEY = 'ai_robot_access_token';
export const REFRESH_TOKEN_KEY = 'ai_robot_refresh_token';
export const USER_KEY = 'ai_robot_user';

export const getStoredAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getStoredRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setStoredTokens = (access: string, refresh: string) => {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Request interceptor: Attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Automatic token rotation on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't retry auth endpoints
    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        clearStoredAuth();
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        if (data?.data?.accessToken) {
          const newAccess = data.data.accessToken;
          const newRefresh = data.data.refreshToken || refreshToken;
          setStoredTokens(newAccess, newRefresh);
          processQueue(null, newAccess);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        clearStoredAuth();
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

