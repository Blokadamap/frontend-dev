import type { AuthRequest } from '../../types/auth/auth.types';
import { useAppMutation } from '../useAppMutation';
import { authService } from '../../services/authService';

export const useRegister = () => {
    return useAppMutation({
        queryKey: ['register'],
        mutationKey: ['register'],
        mutationFn: (data: AuthRequest) => authService.register(data),
    });
};
