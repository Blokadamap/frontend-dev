import { pointService } from '../../services/pointService';
import type { PointCreate } from '../../types/point/point.type';
import { useAppMutation } from '../useAppMutation';

export const useCreatePoint = () => {
    return useAppMutation({
        queryKey: ['points'],
        mutationKey: ['create point'],
        mutationFn: (data: PointCreate) => pointService.createPoint(data),
    });
};
