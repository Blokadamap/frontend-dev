import { api } from "../lib/api";
import type { ArchivePayload } from "../types/archive";

export async function getArchiveData() {
  const response = await api.get<ArchivePayload>("/archive");
  return response.data;
}
