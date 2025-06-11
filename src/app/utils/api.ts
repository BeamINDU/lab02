import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { toastError } from '@/app/utils/toast';

const isRefreshing = false;
const refreshSubscribers: ((token: string) => void)[] = [];

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 1800000, // 30 minutes
});

/*
// Get token from next-auth session
const getAccessToken = async (): Promise<string | null> => {
  const session = await getSession();
  return session?.accessToken ?? null;
};

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

// Refresh token via API
const refreshAuthToken = async (): Promise<string> => {
  const session = await getSession();
  const refreshToken = session?.refreshToken;

  if (!refreshToken) throw new Error('No refresh token');

  const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    refreshToken,
  });

  const newToken = res.data.accessToken;
  return newToken;
};

// Request Interceptor
instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const is401 = status === 401;
    const isNetworkError = !error.response;

    if (is401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshAuthToken();
          onRefreshed(newToken);
        } catch (e) {
          toastError('Session expired. Please login again.');
          await signOut({ callbackUrl: '/login' });
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          if (originalRequest.headers)
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(instance(originalRequest));
        });
      });
    }

    // Retry on server/network error
    if (isNetworkError || status! >= 500) {
      toastError('Network error. Retrying...');
      await new Promise((res) => setTimeout(res, 1000));
      return instance(originalRequest);
    }

    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      'Something went wrong';
    toastError(message);

    return Promise.reject(error);
  }
);
*/

// Generic request
const request = async <T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  dataOrConfig?: any,
  configOverride?: AxiosRequestConfig
): Promise<T> => {
  let config: AxiosRequestConfig = { ...configOverride };

  if (method === 'get' || method === 'delete') {
    config = { ...dataOrConfig, ...configOverride };
    const res: AxiosResponse<T> = await instance[method](url, config);
    return res.data;
  } else {
    const res: AxiosResponse<T> = await instance[method](url, dataOrConfig, config);
    return res.data;
  }
};

// Upload helper
const buildQueryString = (params?: Record<string, any>): string => {
  if (!params) return '';
  const stringified = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  );
  return new URLSearchParams(stringified).toString();
};

const uploadFile = async <T>(
  url: string,
  formData: FormData,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res = await instance.post<T>(url, formData, {
    ...config,
    headers: {
      ...config?.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// API
export const api = {
  get: <T>(url: string, params?: Record<string, any>, config?: AxiosRequestConfig) => {
    const queryString = buildQueryString(params);
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return request<T>('get', fullUrl, undefined, config);
  },

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>('post', url, data, config),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>('put', url, data, config),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>('delete', url, config),

  upload: uploadFile,
};
