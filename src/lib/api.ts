import axios, {
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { mockArchive } from "../data/mockArchive";

const buildResponse = (
  config: InternalAxiosRequestConfig,
  data: unknown,
  status = 200,
): AxiosResponse => ({
  data,
  status,
  statusText: status === 200 ? "OK" : "Not Found",
  headers: {},
  config,
});

const mockAdapter: AxiosAdapter = async (config) => {
  await new Promise((resolve) => window.setTimeout(resolve, 180));

  switch (config.url) {
    case "/archive":
      return buildResponse(config, mockArchive);
    case "/authors":
      return buildResponse(config, mockArchive.authors);
    case "/locations":
      return buildResponse(config, mockArchive.locations);
    case "/testimonies":
      return buildResponse(config, mockArchive.testimonies);
    default:
      return buildResponse(config, { message: "Route not found" }, 404);
  }
};

export const api = axios.create({
  baseURL: "/api",
  adapter: mockAdapter,
});
