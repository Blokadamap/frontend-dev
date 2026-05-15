import { useAppQuery } from '../useAppQuery';
import { authorService } from '../../services/authorService';
import type { AuthorShort } from '../../types/author/author.type';
import type { AxiosError } from 'axios';

export const useAuthors = () => {
    return useAppQuery<AuthorShort[], AxiosError>({
        queryKey: ['authors'],
        queryFn: () => authorService.get(),
    });
};
