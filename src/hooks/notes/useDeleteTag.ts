import { noteService } from '../../services/noteService';
import { useAppMutation } from '../useAppMutation';

export const useDeleteTag = () => {
    return useAppMutation({
        mutationKey: ['delete tag'],
        queryKey: ['note filtes'],
        mutationFn: (id: number) => noteService.deleteTag(id),
    });
};
