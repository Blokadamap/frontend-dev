/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FilterItem } from '../common/common.types';
import { type PointInNote, type PointInNoteFromApi } from '../point/point.type';

export interface NoteShortFromApi {
    note_id: number;
    citation: string;
    created_at: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
}

export interface NoteResponseFromApi {
    note_id: number;
    diary_id: number;
    created_at: string;
    citation: string;
    source: string;
    note_types?: FilterItem[];
    temporalities?: FilterItem[];
    tags?: FilterItem[];
    first_name?: string;
    middle_name?: string | null;
    last_name?: string;
}

export interface NoteDetailedFromApi {
    note_id: number;
    diary_id: number;
    created_at: string;
    citation: string;
    source: string;
    note_types?: FilterItem[];
    temporalities?: FilterItem[];
    tags?: FilterItem[];
    points?: PointInNoteFromApi[];
    author_id: number;
    author_first_name?: string;
    author_middle_name?: string | null;
    author_last_name?: string;
    author_sex?: string | null;
    author_birth_date?: string | null;
    author_biography?: string | null;
    author_has_children?: boolean | null;
    author_family_status_id?: number | null;
    author_education?: any[];
    author_family_status?: FilterItem | null;
}

export interface NoteCreateForApi {
    author_id: number;
    note_type_ids: number[];
    temporality_ids: number[];
    created_at: string;
    citation: string;
    source: string;
    tag_ids: number[];
    note_to_points: NoteToPointCreateForApi[];
}

export interface NoteToPointCreateForApi {
    point_id: number;
    description: string;
}

export interface NoteFiltersFromApi {
    tags: FilterItem[];
    note_types: FilterItem[];
    temporalities: FilterItem[];
}

export interface NoteShort {
    noteId: number;
    citation: string;
    createdAt: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
}

export interface NoteResponse {
    noteId: number;
    diaryId: number;
    createdAt: string;
    citation: string;
    source: string;

    noteTypes?: FilterItem[];
    temporalities?: FilterItem[];
    tags?: FilterItem[];

    firstName?: string;
    middleName?: string | null;
    lastName?: string;
}

export interface NoteDetailed {
    noteId: number;
    diaryId: number;
    createdAt: string;
    citation: string;
    source: string;

    noteTypes?: FilterItem[];
    temporalities?: FilterItem[];
    tags?: FilterItem[];
    points?: PointInNote[];

    authorId: number;

    authorFirstName?: string;
    authorMiddleName?: string | null;
    authorLastName?: string;
    authorSex?: string | null;
    authorBirthDate?: string | null;
    authorBiography?: string | null;
    authorHasChildren?: boolean | null;
    authorFamilyStatusId?: number | null;

    authorEducation?: any[];
    authorFamilyStatus?: FilterItem | null;
}

export interface NoteCreate {
    authorId: number;
    noteTypeIds: number[];
    temporalityIds: number[];
    createdAt: string;
    citation: string;
    source: string;

    tagIds: number[];
    noteToPoints: NoteToPointCreate[];
}

export interface NoteToPointCreate {
    pointId: number;
    description: string;
}

export interface NoteFilters {
    tags: FilterItem[];
    noteTypes: FilterItem[];
    temporalities: FilterItem[];
}

// Заметка для списка/фильтрации (GET /api/v1/notes/): связи + id автора + точки.
export interface NoteListItemFromApi {
    note_id: number;
    diary_id: number;
    author_id: number;
    created_at: string;
    citation?: string;
    source?: string;
    note_types?: FilterItem[];
    temporalities?: FilterItem[];
    tags?: FilterItem[];
    point_ids?: number[];
}

export interface NoteListItem {
    noteId: number;
    diaryId: number;
    authorId: number;
    createdAt: string;
    citation: string;
    source: string;
    noteTypes: FilterItem[];
    temporalities: FilterItem[];
    tags: FilterItem[];
    pointIds: number[];
}
