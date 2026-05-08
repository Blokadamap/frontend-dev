import { atomWithStorage } from "jotai/utils";

export interface User {
    id: string
    email: string
    password: string
}

export const userAtom = atomWithStorage<User | null>("user", null)
export const tokenAtom = atomWithStorage<string | null>("token", null)