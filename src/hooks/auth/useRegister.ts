import type { AuthRequest } from '../../types/auth/auth.types';
import { useAppMutation } from '../useAppMutation';
import { authService } from '../../services/authService';

/**
 * Регистрация нового редактора. Доступна только главному администратору
 * (эндпоинт /auth/users защищён ролью superadmin на бэкенде).
 */
export const useRegister = () => {
    return useAppMutation({
        queryKey: ['users'],
        mutationKey: ['register'],
        mutationFn: (data: AuthRequest) =>
            authService.createUser({ ...data, role: 'editor' }),
    });
};
