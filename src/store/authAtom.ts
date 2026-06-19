import { atomWithStorage } from "jotai/utils";
import type { UserRole } from "../types/auth/auth.types";

export interface User {
    id: number
    username: string
    role: UserRole
}

// getOnInit: true — читаем значение из localStorage синхронно уже на первом
// рендере. Без этого после перезагрузки токен на старте = null, и RequireAuth
// успевает увести на /login до гидратации.
export const userAtom = atomWithStorage<User | null>("user", null, undefined, { getOnInit: true })
export const tokenAtom = atomWithStorage<string | null>("token", null, undefined, { getOnInit: true })
