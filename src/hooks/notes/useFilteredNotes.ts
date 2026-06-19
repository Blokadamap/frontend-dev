import { keepPreviousData } from '@tanstack/react-query';
import { noteService } from '../../services/noteService';
import { useAppQuery } from '../useAppQuery';

// Серверная фильтрация заметок: на сервер уходят выбранные параметры,
// возвращаются только подходящие свидетельства (с точками и дневником).
export const useFilteredNotes = (
    params: Record<string, string>,
    enabled: boolean,
) => {
    return useAppQuery({
        queryKey: ['filtered notes', params],
        queryFn: () => noteService.getFilteredList(params),
        enabled,
        placeholderData: keepPreviousData,
    });
};
