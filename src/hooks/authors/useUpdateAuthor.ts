import { authorService } from '../../services/authorService';
import type { AuthorCreate } from '../../types/author/author.type';
import { useAppMutation } from '../useAppMutation';

export const useUpdateAuthor = () => {
    return useAppMutation({
        mutationKey: ['update author'],
        queryKey: ['authors'],
        mutationFn: ({ id, data }: { id: number; data: AuthorCreate }) =>
            authorService.update(id, data),
    });
};
