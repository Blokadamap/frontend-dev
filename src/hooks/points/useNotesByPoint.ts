import { pointService } from '../../services/pointService';
import { useAppQuery } from '../useAppQuery';

export const useNotesByPoint = (pointId: string) => {
    return useAppQuery({
        queryKey: ['notes by point'],
        queryFn: () => pointService.getNotesByPoint(pointId),
    });
};
