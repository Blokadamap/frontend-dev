import { pointService } from '../../services/pointService';
import { useAppQuery } from '../useAppQuery';

export const usePointTypes = () => {
    return useAppQuery({
        queryKey: ['point types'],
        queryFn: () => pointService.getPointTypes(),
    });
};
