import { AxiosError } from 'axios';
import { authorService } from '../../services/authorService';
import type { AuthorResponse } from '../../types/author/author.type';
import { useAppQuery } from '../useAppQuery';

export const useAuthorById = (id: string) => {
    return useAppQuery<AuthorResponse, AxiosError>({
        queryKey: ['author by id'],
        queryFn: () => authorService.getById(id),
    });
};
