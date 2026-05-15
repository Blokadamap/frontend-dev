import { noteService } from '../../services/noteService';
import type { NoteCreate } from '../../types/note/note.type';
import { useAppMutation } from '../useAppMutation';

export const useCreateNote = () => {
    return useAppMutation({
        mutationKey: ['create note'],
        queryKey: ['notes'],
        mutationFn: (data: NoteCreate) => noteService.createNote(data),
    });
};
