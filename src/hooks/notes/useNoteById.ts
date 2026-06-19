import { noteService } from '../../services/noteService';
import { useAppQuery } from '../useAppQuery';

export const useNoteById = (noteId: number) => {
    return useAppQuery({
        queryKey: ['note by id', noteId],
        queryFn: () => noteService.getNoteById(noteId),
    });
};
