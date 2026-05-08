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
    NoteShort,
    NoteShortFromApi,
} from '../types/note/note.type';
import { noteMapper } from './mappers/note.mapper';

class NoteService {
    async getFilters(): Promise<NoteFilters> {
        const response = await axiosPublic.get<NoteFiltersFromApi>('/notes/filters');

        return noteMapper.toNoteFilters(response.data);
    }

    async createTag(data: TagCreate): Promise<unknown> {
        const response = await axiosPrivate.post('/notes/tags', data);

        return response.data;
    }

    async getDetailNote(id: number): Promise<NoteDetailed> {
        const response = await axiosPublic.get<NoteDetailedFromApi>(`/notes/detailed/${id}`);

        return noteMapper.toNoteDetailed(response.data);
    }

    async getNotesByPoint(pointId: number): Promise<NoteShort[]> {
        const response = await axiosPublic.get<NoteShortFromApi[]>(`/notes/by-point/${pointId}`);

        return noteMapper.toNoteShorts(response.data);
    }

    async getNoteById(noteId: number): Promise<NoteResponse> {
        const response = await axiosPublic.get<NoteResponseFromApi>(`/notes/${noteId}`);

        return noteMapper.toNoteResponse(response.data);
    }

    async createNote(data: NoteCreate): Promise<NoteResponse> {
        const note = noteMapper.toNoteCreate(data);

        const response = await axiosPrivate.post<NoteResponseFromApi>(`/notes/`, note);

        return noteMapper.toNoteResponse(response.data);
    }
}

export const noteService = new NoteService();
