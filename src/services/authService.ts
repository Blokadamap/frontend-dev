import { axiosPrivate } from "../api/interceptors";
import type {
    AdminUser,
    AuthRequest,
    AuthResponse,
    AuthUser,
    PasswordChange,
    UserCreate,
} from "../types/auth/auth.types";

class AuthService {
    async login(data: AuthRequest): Promise<AuthResponse> {
        const resp = await axiosPrivate.post<AuthResponse>("/auth/login", data)

        return resp.data
    }

    async me(): Promise<AuthUser> {
        const resp = await axiosPrivate.get<AuthUser>("/auth/me")

        return resp.data
    }

    /** Список всех пользователей (только для главного администратора). */
    async listUsers(): Promise<AdminUser[]> {
        const resp = await axiosPrivate.get<AdminUser[]>("/auth/users")

        return resp.data
    }

    /** Создать пользователя — редактора или администратора (только суперадмин). */
    async createUser(data: UserCreate): Promise<AdminUser> {
        const resp = await axiosPrivate.post<AdminUser>("/auth/users", data)

        return resp.data
    }

    /** Удалить пользователя (только суперадмин). */
    async deleteUser(id: number): Promise<void> {
        await axiosPrivate.delete(`/auth/users/${id}`)
    }

    /** Сменить собственный пароль. */
    async changePassword(data: PasswordChange): Promise<{ status: string }> {
        const resp = await axiosPrivate.post<{ status: string }>("/auth/change-password", {
            current_password: data.currentPassword,
            new_password: data.newPassword,
        })

        return resp.data
    }
}

export const authService = new AuthService()
