import { AxiosError } from 'axios';
import { authorService } from '../../services/authorService';
import { type AuthorFilters } from '../../types/author/author.type';
import { useAppQuery } from '../useAppQuery';

export const useAuthorFilters = () => {
    return useAppQuery<AuthorFilters, AxiosError>({
        queryKey: ['author filters'],
        queryFn: () => authorService.getFilters(),
    });
};
