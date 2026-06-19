import { pointService } from '../../services/pointService';
import type { PointCreate } from '../../types/point/point.type';
import { useAppMutation } from '../useAppMutation';

export const useUpdatePoint = () => {
    return useAppMutation({
        mutationKey: ['update point'],
        queryKey: ['points'],
        mutationFn: ({ id, data }: { id: number; data: PointCreate }) =>
            pointService.updatePoint(id, data),
    });
};
