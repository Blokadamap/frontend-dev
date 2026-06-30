import { axiosPublic } from '../api/classic-interceptor';
import { axiosPrivate } from '../api/interceptors';
import type { TagCreate } from '../types/common/common.types';
import type {
    NoteCreate,
    NoteDetailed,
    NoteDetailedFromApi,
    NoteFilters,
    NoteFiltersFromApi,
    NoteListItem,
    NoteListItemFromApi,
    NoteResponse,
    NoteResponseFromApi,
} from '../types/note/note.type';
import { noteMapper } from './mappers/note.mapper';

class NoteService {
    async getFilters(): Promise<NoteFilters> {
        const response = await axiosPublic.get<NoteFiltersFromApi>('/api/v1/notes/filters');

        return noteMapper.toNoteFilters(response.data);
    }

    async getFilteredList(
        params: Record<string, string> = {},
    ): Promise<NoteListItem[]> {
        const response = await axiosPublic.get<NoteListItemFromApi[]>('/api/v1/notes/', {
            params,
        });

        return noteMapper.toNoteListItems(response.data);
    }

    async createTag(data: TagCreate): Promise<unknown> {
        const response = await axiosPrivate.post('/api/v1/notes/tags', data);

        return response.data;
    }

    async getDetailNote(id: number): Promise<NoteDetailed> {
        const response = await axiosPublic.get<NoteDetailedFromApi>(`/api/v1/notes/detailed/${id}`);

        return noteMapper.toNoteDetailed(response.data);
    }

    async getNotesByPoint(pointId: number): Promise<NoteResponse[]> {
        const response = await axiosPublic.get<NoteResponseFromApi[]>(`/api/v1/notes/by-point/${pointId}`);

        return noteMapper.toManyNoteResponse(response.data);
    }

    async getNoteById(noteId: number): Promise<NoteResponse> {
        const response = await axiosPublic.get<NoteResponseFromApi>(`/api/v1/notes/${noteId}`);

        return noteMapper.toNoteResponse(response.data);
    }

    async createNote(data: NoteCreate): Promise<NoteResponse> {
        const note = noteMapper.toNoteCreate(data);

        const response = await axiosPrivate.post<NoteResponseFromApi>(`/api/v1/notes/`, note);

        return noteMapper.toNoteResponse(response.data);
    }

    /** Обновление существующего свидетельства (только суперадмин). */
    async updateNote(id: number, data: NoteCreate): Promise<unknown> {
        const note = noteMapper.toNoteCreate(data);

        const response = await axiosPrivate.patch(`/api/v1/notes/${id}`, note);

        return response.data;
    }

    /** Полный состав свидетельства для предзаполнения формы правки. */
    async getNoteForEdit(id: number): Promise<NoteCreate> {
        const response = await axiosPublic.get<{
            author_id: number;
            note_type_ids: number[];
            temporality_ids: number[];
            created_at: string;
            citation: string;
            source: string;
            tag_ids: number[];
            note_to_points: { point_id: number; description: string }[];
            localization_accuracy?: string | null;
            place_type?: string | null;
            organization_ids?: number[];
            city_name_ids?: number[];
            geo_name_ids?: number[];
            personality_ids?: number[];
        }>(`/api/v1/notes/${id}/edit`);

        const d = response.data;
        return {
            authorId: d.author_id,
            noteTypeIds: d.note_type_ids ?? [],
            temporalityIds: d.temporality_ids ?? [],
            createdAt: d.created_at,
            citation: d.citation,
            source: d.source,
            tagIds: d.tag_ids ?? [],
            noteToPoints: (d.note_to_points ?? []).map((p) => ({
                pointId: p.point_id,
                description: p.description,
            })),
            localizationAccuracy: d.localization_accuracy ?? null,
            placeType: d.place_type ?? null,
            organizationIds: d.organization_ids ?? [],
            cityNameIds: d.city_name_ids ?? [],
            geoNameIds: d.geo_name_ids ?? [],
            personalityIds: d.personality_ids ?? [],
        };
    }

    /** Удаление свидетельства (только суперадмин). */
    async deleteNote(id: number): Promise<void> {
        await axiosPrivate.delete(`/api/v1/notes/${id}`);
    }

    /** Удаление тега (блокируется, если используется; только суперадмин). */
    async deleteTag(id: number): Promise<void> {
        await axiosPrivate.delete(`/api/v1/notes/tags/${id}`);
    }

    /**
     * Новые тегоподобные справочники свидетельства. prefix — сегмент пути
     * бэкенда: "organizations" | "city-names" | "geo-names" | "personalities".
     * Создание и удаление полностью аналогичны тегам.
     */
    async createNoteTaxonomy(prefix: string, data: TagCreate): Promise<unknown> {
        const response = await axiosPrivate.post(`/api/v1/notes/${prefix}`, data);

        return response.data;
    }

    /** Удаление (блокируется, если значение используется; только суперадмин). */
    async deleteNoteTaxonomy(prefix: string, id: number): Promise<void> {
        await axiosPrivate.delete(`/api/v1/notes/${prefix}/${id}`);
    }
}

export const noteService = new NoteService();
