import { pointService } from '../../services/pointService';
import { useAppQuery } from '../useAppQuery';

export const usePointById = (pointId: number) => {
    return useAppQuery({
        queryKey: ['point by id'],
        queryFn: () => pointService.getPointById(pointId),
    });
};
