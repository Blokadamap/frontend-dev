import { authorService } from '../../services/authorService';
import { useAppMutation } from '../useAppMutation';

export const useDeleteAuthor = () => {
    return useAppMutation({
        mutationKey: ['delete author'],
        queryKey: ['authors'],
        mutationFn: (id: number) => authorService.delete(id),
    });
};
