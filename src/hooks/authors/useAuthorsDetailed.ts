import { authorService } from '../../services/authorService';
import { useAppQuery } from '../useAppQuery';

// Все авторы с атрибутами (пол, дата рождения, образование и т.д.) —
// источник для клиентской фильтрации по персоналиям.
export const useAuthorsDetailed = () => {
    return useAppQuery({
        queryKey: ['authors detailed'],
        queryFn: () => authorService.getAllDetailed(),
    });
};
