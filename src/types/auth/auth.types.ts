export interface AuthRequest {
    username: string
    password: string
}

export type UserRole = 'superadmin' | 'editor';

export interface AuthUser {
    id: number;
    username: string;
    role: UserRole;
}

/** Ответ POST /auth/login */
export interface AuthResponse {
    token: string;
    user: AuthUser;
}

/** Элемент списка GET /auth/users */
export interface AdminUser {
    id: number;
    username: string;
    role: UserRole;
    created_at?: string;
}

/** Тело создания пользователя POST /auth/users */
export interface UserCreate {
    username: string;
    password: string;
    role: UserRole;
}

/** Смена собственного пароля POST /auth/change-password */
export interface PasswordChange {
    currentPassword: string;
    newPassword: string;
}
