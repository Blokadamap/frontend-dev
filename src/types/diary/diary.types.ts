import type { AuthorShort, AuthorShortFromApi } from '../author/author.type';

export interface DiaryResponseFromApi {
    diary_id: number;
    author_id: number;
    started_at: string;
    finished_at: string;
    source: string;
    storage_place?: string | null;
    author: AuthorShortFromApi;
}

export interface DiaryResponse {
    diaryId: number;
    authorId: number;
    startedAt: string;
    finishedAt: string;
    diarySource: string;
    diaryStoragePlace: string;
    author: AuthorShort;
}
