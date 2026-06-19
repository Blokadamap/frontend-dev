import { noteService } from '../../services/noteService';
import type { NoteCreate } from '../../types/note/note.type';
import { useAppMutation } from '../useAppMutation';

export const useUpdateNote = () => {
    return useAppMutation({
        mutationKey: ['update note'],
        queryKey: ['notes'],
        mutationFn: ({ id, data }: { id: number; data: NoteCreate }) =>
            noteService.updateNote(id, data),
    });
};
