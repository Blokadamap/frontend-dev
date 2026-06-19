// DEPRECATED: клиентская загрузка всех заметок заменена серверной фильтрацией.
// Используйте useFilteredNotes. Оставлено как тонкая обёртка для совместимости.
import { noteService } from '../../services/noteService';
import { useAppQuery } from '../useAppQuery';

export const useAllNotes = () => {
    return useAppQuery({
        queryKey: ['all notes'],
        queryFn: () => noteService.getFilteredList(),
    });
};
