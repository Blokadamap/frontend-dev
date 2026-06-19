import { noteService } from '../../services/noteService';
import { useAppQuery } from '../useAppQuery';

export const useNotesByPointId = (pointId: number) => {
    return useAppQuery({
        queryKey: ['notes by point id', pointId],
        queryFn: () => noteService.getNotesByPoint(pointId),
    });
};
