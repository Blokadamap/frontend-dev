import { pointService } from '../../services/pointService';
import type { CoordinateItem } from '../../types/point/point.type';
import { useAppMutation } from '../useAppMutation';

interface AddCoordinates extends CoordinateItem {
    pointId: string;
}

export const useAddCoordinates = () => {
    return useAppMutation({
        queryKey: ['coordinates by point'],
        mutationKey: ['add coordinates'],
        mutationFn: ({ pointId, ...data }: AddCoordinates) =>
            pointService.addCoordinates(pointId, data),
    });
};
