import { authService } from '../../services/authService';
import type { UserCreate } from '../../types/auth/auth.types';
import { useAppMutation } from '../useAppMutation';

/** Создание редактора/администратора. Доступно только суперадмину. */
export const useCreateUser = () => {
    return useAppMutation({
        mutationKey: ['create user'],
        queryKey: ['users'],
        mutationFn: (data: UserCreate) => authService.createUser(data),
    });
};
