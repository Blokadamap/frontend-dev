import { noteService } from '../../services/noteService';
import { useAppMutation } from '../useAppMutation';

/**
 * Удаление элемента нового тегоподобного справочника свидетельства
 * (блокируется, если значение используется). prefix — сегмент пути бэкенда:
 * "organizations" | "city-names" | "geo-names" | "personalities".
 * Полностью аналогично useDeleteTag.
 */
export const useDeleteNoteTaxonomy = (prefix: string) => {
    return useAppMutation({
        mutationKey: ['delete note taxonomy', prefix],
        queryKey: ['note filtes'],
        mutationFn: (id: number) => noteService.deleteNoteTaxonomy(prefix, id),
    });
};
