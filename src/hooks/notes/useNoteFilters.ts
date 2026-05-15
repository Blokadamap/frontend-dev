import { noteService } from '../../services/noteService';
import { useAppQuery } from '../useAppQuery';

export const useNoteFilters = () => {
    return useAppQuery({
        queryKey: ['note filtes'],
        queryFn: () => noteService.getFilters(),
    });
};
