import type { AuthRequest } from '../../types/auth/auth.types';
import { useAppMutation } from '../useAppMutation';
import { authService } from '../../services/authService';

export const useLogin = () => {
    return useAppMutation({
        queryKey: ['login'],
        mutationKey: ['login'],
        mutationFn: (data: AuthRequest) => authService.login(data),
    });
};
