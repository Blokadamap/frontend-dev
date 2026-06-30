import { noteService } from '../../services/noteService';
import type { TagCreate } from '../../types/common/common.types';
import { useAppMutation } from '../useAppMutation';

/**
 * Создание элемента нового тегоподобного справочника свидетельства.
 * prefix — сегмент пути бэкенда: "organizations" | "city-names" |
 * "geo-names" | "personalities". Полностью аналогично useCreateTag.
 */
export const useCreateNoteTaxonomy = (prefix: string) => {
    return useAppMutation({
        queryKey: ['note filtes'],
        mutationKey: ['create note taxonomy', prefix],
        mutationFn: (data: TagCreate) => noteService.createNoteTaxonomy(prefix, data),
    });
};
