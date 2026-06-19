import { noteService } from '../../services/noteService';
import { useAppMutation } from '../useAppMutation';

export const useDeleteNote = () => {
    return useAppMutation({
        mutationKey: ['delete note'],
        queryKey: ['all notes'],
        mutationFn: (id: number) => noteService.deleteNote(id),
    });
};
