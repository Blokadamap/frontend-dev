import { noteService } from '../../services/noteService';
import { useAppQuery } from '../useAppQuery';

export const useDetailNote = (id: number) => {
    return useAppQuery({
        queryKey: ['detail notes'],
        queryFn: () => noteService.getDetailNote(id),
    });
};
