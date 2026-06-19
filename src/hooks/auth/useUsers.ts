import type { AxiosError } from 'axios';
import { authService } from '../../services/authService';
import type { AdminUser } from '../../types/auth/auth.types';
import { useAppQuery } from '../useAppQuery';

/** Список пользователей. Доступен только главному администратору. */
export const useUsers = (enabled = true) => {
    return useAppQuery<AdminUser[], AxiosError>({
        queryKey: ['users'],
        queryFn: () => authService.listUsers(),
        enabled,
    });
};
