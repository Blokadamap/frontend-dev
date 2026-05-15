import type {
    NoteCreate,
    NoteCreateForApi,
    NoteDetailed,
    NoteDetailedFromApi,
    NoteFilters,
    NoteFiltersFromApi,
    NoteResponse,
    NoteResponseFromApi,
    NoteShort,
    NoteShortFromApi,
    NoteToPointCreate,
    NoteToPointCreateForApi,
} from '../../types/note/note.type';
import type { PointInNote, PointInNoteFromApi } from '../../types/point/point.type';

class NoteMapper {
    toNoteFilters(data: NoteFiltersFromApi): NoteFilters {
        return {
            tags: data.tags,
            noteTypes: data.note_types,
            temporalities: data.temporalities,
        };
    }

    toNoteDetailed(data: NoteDetailedFromApi): NoteDetailed {
        return {
            noteId: data.note_id,
            diaryId: data.diary_id,
            noteTypeId: data.note_type_id,
            temporalityId: data.temporality_id,
            createdAt: data.created_at,
            citation: data.citation,
            source: data.source,
            noteType: data.note_type,
            temporality: data.temporality,
            tags: data.tags,
            points: data.points?.map((item) => this.toPointInNote(item)),
            authorId: data.author_id,
            authorFirstName: data.author_first_name,
            authorMiddleName: data.author_middle_name,
            authorLastName: data.author_last_name,
            authorSex: data.author_sex,
            authorBirthDate: data.author_birth_date,
            authorBiography: data.author_biography,
            authorHasChildren: data.author_has_children,
            authorFamilyStatusId: data.author_family_status_id,
            authorEducation: data.author_education,
            authorFamilyStatus: data.author_family_status,
        };
    }

    toNoteShorts(data: NoteShortFromApi[]): NoteShort[] {
        return data.map((item) => ({
            noteId: item.note_id,
            citation: item.citation,
            createdAt: item.created_at,
            firstName: item.first_name,
            middleName: item.middle_name,
            lastName: item.last_name,
        }));
    }

    toNoteResponse(data: NoteResponseFromApi): NoteResponse {
        return {
            noteId: data.note_id,
            diaryId: data.diary_id,
            noteTypeId: data.note_type_id,
            temporalityId: data.temporality_id,
            createdAt: data.created_at,
            citation: data.citation,
            source: data.source,
            noteType: data.note_type,
            temporality: data.temporality,
            tags: data.tags,
            firstName: data.first_name,
            middleName: data.middle_name,
            lastName: data.last_name,
        };
    }

    toManyNoteResponse(data: NoteResponseFromApi[]): NoteResponse[] {
        return data.map((item) => {
            return {
                noteId: item.note_id,
                diaryId: item.diary_id,
                noteTypeId: item.note_type_id,
                temporalityId: item.temporality_id,
                createdAt: item.created_at,
                citation: item.citation,
                source: item.source,
                noteType: item.note_type,
                temporality: item.temporality,
                tags: item.tags,
                firstName: item.first_name,
                middleName: item.middle_name,
                lastName: item.last_name,
            };
        });
    }

    toNoteCreate(data: NoteCreate): NoteCreateForApi {
        return {
            author_id: data.authorId,
            note_type_id: data.noteTypeId,
            temporality_id: data.temporalityId,
            created_at: data.createdAt,
            citation: data.citation,
            source: data.source,
            tag_ids: data.tagIds,
            note_to_points: data.noteToPoints.map((item) => this.toNoteToPointCreateForApi(item)),
        };
    }

    toNoteToPointCreate(data: NoteToPointCreateForApi): NoteToPointCreate {
        return {
            pointId: data.point_id,
            description: data.description,
        };
    }

    toNoteToPointCreateForApi(data: NoteToPointCreate): NoteToPointCreateForApi {
        return {
            point_id: data.pointId,
            description: data.description,
        };
    }

    toPointInNote(data: PointInNoteFromApi): PointInNote {
        return {
            pointId: data.point_id,
            name: data.name,
            description: data.description,
            pointCoordinates: data.point_coordinates,
        };
    }
}

export const noteMapper = new NoteMapper();
