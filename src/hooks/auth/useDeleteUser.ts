import { authService } from '../../services/authService';
import { useAppMutation } from '../useAppMutation';

export const useDeleteUser = () => {
    return useAppMutation({
        mutationKey: ['delete user'],
        queryKey: ['users'],
        mutationFn: (id: number) => authService.deleteUser(id),
    });
};
