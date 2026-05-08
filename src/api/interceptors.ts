import axios, { type CreateAxiosDefaults, type InternalAxiosRequestConfig } from "axios";
import { tokenAtom, userAtom, type User } from "../store/authAtom";
import { getDefaultStore } from "jotai";
import { axiosPublic } from "./classic-interceptor";
import { BASE_API_URL } from "./api-config";

interface RetryableConfig extends InternalAxiosRequestConfig {
    _retry?: boolean
}

interface QueueItem {
    resolve: (token: string) => void
    reject: (error: unknown) => void
}

interface RefreshResponse {
    accessToken: string
    user: User
}

let isRefreshing = false; 
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((item) => {
        if (error) {
            item.reject(error)
        } else if (token) {
            item.resolve(token)
        }
    });
    failedQueue = []
}

export function axiosDefault() {
  const storage = getDefaultStore();

  const options: CreateAxiosDefaults = {
    baseURL: BASE_API_URL,
    withCredentials: true,
  };

  const axiosDefault = axios.create(options);

  axiosDefault.interceptors.request.use((config) => {
    const token = storage.get(tokenAtom);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axiosDefault.interceptors.response.use(
    (config) => {
      return config;
    },
    async (error) => {
      const originalRequest = error.config as RetryableConfig;

      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      if (originalRequest.url?.includes("/auth/access-token")) {
        storage.set(tokenAtom, null);
        storage.set(userAtom, null);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        }).then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return axiosDefault(originalRequest)
        }) 
      }

      isRefreshing = true

      try {
        const response = await axiosPublic.get<RefreshResponse>("/auth/access-token", {
            withCredentials: true
        })

        const newToken = response.data.accessToken
        storage.set(tokenAtom, newToken)
        storage.set(userAtom, response.data.user)

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosDefault(originalRequest)
      } catch (e) {
        processQueue(e, null)
        storage.set(tokenAtom, null)
        storage.set(userAtom, null)

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    },
  );

  return axiosDefault;
}

export const axiosPrivate = axiosDefault()