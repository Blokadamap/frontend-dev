import { pointService } from '../../services/pointService';
import { useAppMutation } from '../useAppMutation';

export const useDeletePoint = () => {
    return useAppMutation({
        mutationKey: ['delete point'],
        queryKey: ['points'],
        mutationFn: (id: number) => pointService.deletePoint(id),
    });
};
