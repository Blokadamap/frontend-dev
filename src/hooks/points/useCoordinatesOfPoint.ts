import { pointService } from '../../services/pointService';
import { useAppQuery } from '../useAppQuery';

export const useCoordinatesOfPoint = (pointId: string) => {
    return useAppQuery({
        queryKey: ['coordinates by point', pointId],
        queryFn: () => pointService.getCoordinatesOfPoint(pointId),
    });
};
