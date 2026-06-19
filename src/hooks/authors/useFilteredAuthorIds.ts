import { keepPreviousData } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { authorService } from '../../services/authorService';
import { useAppQuery } from '../useAppQuery';

// Серверная фильтрация авторов по атрибутам: возвращает id подходящих авторов
// (нужно, чтобы затем отфильтровать заметки по author_ids).
export const useFilteredAuthorIds = (
    params: Record<string, string>,
    enabled: boolean,
) => {
    return useAppQuery<number[], AxiosError>({
        queryKey: ['filtered author ids', params],
        queryFn: () => authorService.getFilteredAuthorIds(params),
        enabled,
        placeholderData: keepPreviousData,
    });
};
