import axios, { AxiosError } from "axios";
import { BASE_API_URL } from "./api-config";

export const axiosPublic = axios.create({
  baseURL: BASE_API_URL
});

axiosPublic.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      console.log("Network error: ", error.message)
    }

    return Promise.reject(error)
  }
)