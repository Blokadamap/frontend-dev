import type {
    AuthorCreate,
    AuthorCreateForApi,
    AuthorFilters,
    AuthorFiltersFromApi,
    AuthorResponse,
    AuthorResponseFromApi,
    AuthorShort,
    AuthorShortFromApi,
} from '../../types/author/author.type';

class AuthorMapper {
    toAuthorShorts(data: AuthorShortFromApi[]): AuthorShort[] {
        return data.map((item) => ({
            authorId: item.author_id,
            firstName: item.first_name,
            middleName: item.middle_name,
            lastName: item.last_name,
        }));
    }

    toAuthorCreateForApi(data: AuthorCreate): AuthorCreateForApi {
        return {
            last_name: data.lastName,
            first_name: data.firstName,
            middle_name: data.middleName,
            sex: data.sex,
            birth_date: data.birthDate,
            biography: data.biography,
            has_children: data.hasChildren,
            family_status_id: data.familyStatusId,
            social_class_ids: data.socialClassIds,
            nationality_ids: data.nationalityIds,
            religion_ids: data.religionIds,
            education_ids: data.educationIds,
            occupation_ids: data.occupationIds,
            political_party_ids: data.politicalPartyIds,
            card_ids: data.cardIds,
            diary_started_at: data.diaryStartedAt,
            diary_finished_at: data.diaryFinishedAt,
            diary_source: data.diarySource,
        };
    }

    toAuthorResponse(data: AuthorResponseFromApi): AuthorResponse {
        return {
            authorId: data.author_id,
            firstName: data.first_name,
            middleName: data.middle_name,
            lastName: data.last_name,
            sex: data.sex,
            birthDate: data.birth_date,
            biography: data.biography,
            hasChildren: data.has_children,
            familyStatusId: data.family_status_id,
            familyStatus: data.family_status,
            socialClasses: data.social_classes,
            nationalities: data.nationalities,
            religions: data.religions,
            education: data.education,
            occupation: data.occupation,
            politicalParties: data.political_parties,
            cards: data.cards,
        };
    }

    toAuthorFilters(data: AuthorFiltersFromApi): AuthorFilters {
        return {
            familyStatuses: data.family_statuses,
            socialClasses: data.social_classes,
            nationalities: data.nationalities,
            religions: data.religions,
            educations: data.educations,
            occupations: data.occupations,
            politicalParties: data.political_parties,
            cards: data.cards,
        };
    }
}

export const authorMapper = new AuthorMapper();
