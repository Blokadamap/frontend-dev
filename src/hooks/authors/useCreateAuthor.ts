import { authorService } from '../../services/authorService';
import type { AuthorCreate } from '../../types/author/author.type';
import { useAppMutation } from '../useAppMutation';

export const useCreateAuthor = () => {
    return useAppMutation({
        mutationKey: ['create author'],
        queryKey: ['authors'],
        mutationFn: (data: AuthorCreate) => authorService.create(data),
    });
};
