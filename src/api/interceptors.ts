import axios, { type CreateAxiosDefaults } from "axios";
import { tokenAtom, userAtom } from "../store/authAtom";
import { getDefaultStore } from "jotai";
import { BASE_API_URL } from "./api-config";

// Refresh-токенов на бэкенде сейчас нет (эндпоинта /auth/access-token не
// существует). Поэтому при 401 просто чистим сессию и ведём на вход — без
// попыток «обновления», которые раньше всегда падали и молча разлогинивали.

export function axiosDefault() {
  const storage = getDefaultStore();

  const options: CreateAxiosDefaults = {
    baseURL: BASE_API_URL,
    withCredentials: true,
  };

  const instance = axios.create(options);

  instance.interceptors.request.use((config) => {
    const token = storage.get(tokenAtom);

    // Подставляем только корректный строковый JWT. Это защищает от «битых»
    // значений (например, объекта от старого флоу), из-за которых уходил
    // заголовок `Bearer [object Object]` и сервер отвечал 401.
    if (typeof token === "string" && token.length > 0) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        storage.set(tokenAtom, null);
        storage.set(userAtom, null);
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

export const axiosPrivate = axiosDefault();
