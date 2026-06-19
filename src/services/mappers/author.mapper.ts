import type {
    AuthorCreate,
    AuthorCreateForApi,
    AuthorDetailed,
    AuthorDetailedFromApi,
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
            death_date: data.deathDate || null,
            biography: data.biography,
            photo: data.photo || null,
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
            diary_storage_place: data.diaryStoragePlace,
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
            deathDate: data.death_date ?? null,
            biography: data.biography,
            photo: data.photo ?? null,
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

    toAuthorDetaileds(data: AuthorDetailedFromApi[]): AuthorDetailed[] {
        return data.map((item) => ({
            authorId: item.author_id,
            firstName: item.first_name,
            middleName: item.middle_name,
            lastName: item.last_name,
            sex: item.sex,
            birthDate: item.birth_date,
            deathDate: item.death_date ?? null,
            photo: item.photo ?? null,
            hasChildren: item.has_children,
            familyStatus: item.family_status ?? null,
            socialClasses: item.social_classes ?? [],
            nationalities: item.nationalities ?? [],
            religions: item.religions ?? [],
            educations: item.education ?? [],
            occupations: item.occupation ?? [],
            politicalParties: item.political_parties ?? [],
            cards: item.cards ?? [],
        }));
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
