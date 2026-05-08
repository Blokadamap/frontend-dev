import type { AuthorShort, AuthorShortFromApi } from '../../types/author/author.type';
import type { DiaryResponse, DiaryResponseFromApi } from '../../types/diary/diary.types';

class DiaryMapper {
    toManyDiaryResponse(data: DiaryResponseFromApi[]): DiaryResponse[] {
        return data.map((item) => {
            return {
                diaryId: item.diary_id,
                authorId: item.author_id,
                diaryStartedAt: item.diary_started_at,
                diaryFinishedAt: item.diary_finished_at,
                diarySource: item.diary_source,
                author: this.toAuthorShort(item.author),
            };
        });
    }

    toDiaryResponse(item: DiaryResponseFromApi): DiaryResponse {
        return {
            diaryId: item.diary_id,
            authorId: item.author_id,
            diaryStartedAt: item.diary_started_at,
            diaryFinishedAt: item.diary_finished_at,
            diarySource: item.diary_source,
            author: this.toAuthorShort(item.author),
        };
    }

    toAuthorShort(data: AuthorShortFromApi): AuthorShort {
        return {
            authorId: data.author_id,
            lastName: data.last_name,
            firstName: data.first_name,
            middleName: data.middle_name,
        };
    }
}

export const diaryMapper = new DiaryMapper();
