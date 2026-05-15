import type { AuthorShort, AuthorShortFromApi } from '../author/author.type';

export interface DiaryResponseFromApi {
    diary_id: number;
    author_id: number;
    diary_started_at: string;
    diary_finished_at: string;
    diary_source: string;
    author: AuthorShortFromApi;
}

export interface DiaryResponse {
    diaryId: number;
    authorId: number;
    diaryStartedAt: string;
    diaryFinishedAt: string;
    diarySource: string;
    author: AuthorShort;
}
