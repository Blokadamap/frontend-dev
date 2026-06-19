import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import type { PasswordChange } from '../../types/auth/auth.types';

/** Смена собственного пароля. */
export const useChangePassword = () => {
    return useMutation({
        mutationKey: ['change password'],
        mutationFn: (data: PasswordChange) => authService.changePassword(data),
    });
};
