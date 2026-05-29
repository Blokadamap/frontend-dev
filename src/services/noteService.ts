import { axiosPublic } from '../api/classic-interceptor';
import { axiosPrivate } from '../api/interceptors';
import type { TagCreate } from '../types/common/common.types';
import type {
    NoteCreate,
    NoteDetailed,
    NoteDetailedFromApi,
    NoteFilters,
    NoteFiltersFromApi,
    NoteResponse,
    NoteResponseFromApi,
} from '../types/note/note.type';
import { noteMapper } from './mappers/note.mapper';

class NoteService {
    async getFilters(): Promise<NoteFilters> {
        const response = await axiosPublic.get<NoteFiltersFromApi>('/api/v1/notes/filters');

        return noteMapper.toNoteFilters(response.data);
    }

    async createTag(data: TagCreate): Promise<unknown> {
        const response = await axiosPrivate.post('/notes/tags', data);

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
}

export const noteService = new NoteService();
