import { axiosPrivate } from "../api/interceptors";
import type { AuthRequest, AuthResponse } from "../types/auth/auth.types";

class AuthService {
    async login(data: AuthRequest): Promise<AuthResponse> {
        const resp = await axiosPrivate.post<AuthResponse>("/auth/login", data)

        return resp.data
    }

    async register(data: AuthRequest): Promise<AuthResponse> {
        const resp = await axiosPrivate.post<AuthResponse>("/auth/register", data)

        return resp.data
    }

}

export const authService = new AuthService()