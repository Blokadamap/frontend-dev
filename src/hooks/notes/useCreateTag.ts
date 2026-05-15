import { noteService } from '../../services/noteService';
import type { TagCreate } from '../../types/common/common.types';
import { useAppMutation } from '../useAppMutation';

export const useCreateTag = () => {
    return useAppMutation({
        queryKey: ['tags'],
        mutationKey: ['create tags'],
        mutationFn: (data: TagCreate) => noteService.createTag(data),
    });
};
