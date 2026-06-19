import { axiosPublic } from "../api/classic-interceptor"
import type { DiaryResponse, DiaryResponseFromApi } from "../types/diary/diary.types"
import type { NoteResponse, NoteResponseFromApi } from "../types/note/note.type"
import { diaryMapper } from "./mappers/diary.mapper"
import { noteMapper } from "./mappers/note.mapper"

class DiaryService {
    async getAll(): Promise<DiaryResponse[]> {
        const response = await axiosPublic.get<DiaryResponseFromApi[]>("/api/v1/diaries/")

        return diaryMapper.toManyDiaryResponse(response.data)
    }

    async getById(id: number): Promise<DiaryResponse> {
        const response = await axiosPublic.get<DiaryResponseFromApi>(`/api/v1/diaries/${id}`)

        return diaryMapper.toDiaryResponse(response.data)
    }

    /** Первый дневник автора (для предзаполнения формы правки автора). */
    async getByAuthor(authorId: number): Promise<DiaryResponse | null> {
        const response = await axiosPublic.get<DiaryResponseFromApi[]>(`/api/v1/diaries/`, {
            params: { author_ids: String(authorId) },
        })
        const list = diaryMapper.toManyDiaryResponse(response.data)
        return list[0] ?? null
    }

    async GetNotes(id: number): Promise<NoteResponse[]> {
        const response = await axiosPublic.get<NoteResponseFromApi[]>(`/api/v1/diaries/${id}/notes`)

        return noteMapper.toManyNoteResponse(response.data)
    }
}

export const diaryService = new DiaryService()