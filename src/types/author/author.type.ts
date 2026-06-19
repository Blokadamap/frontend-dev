import { type FilterItem } from '../common/common.types';

export interface AuthorShortFromApi {
    author_id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
}

export interface AuthorResponseFromApi {
    author_id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    sex: 'M' | 'F';
    birth_date: string;
    death_date?: string | null;
    biography: string;
    photo?: string | null;
    has_children: boolean;
    family_status_id: number;
    family_status?: FilterItem | null;
    social_classes?: FilterItem[];
    nationalities?: FilterItem[];
    religions?: FilterItem[];
    education?: FilterItem[];
    occupation?: FilterItem[];
    political_parties?: FilterItem[];
    cards?: FilterItem[];
}

export interface AuthorCreateForApi {
    last_name: string;
    first_name: string;
    middle_name: string;
    sex: 'M' | 'F';
    birth_date: string;
    death_date: string | null;
    biography: string;
    photo: string | null;
    has_children: boolean;
    family_status_id: number;
    social_class_ids: number[];
    nationality_ids: number[];
    religion_ids: number[];
    education_ids: number[];
    occupation_ids: number[];
    political_party_ids: number[];
    card_ids: number[];
    diary_started_at: string;
    diary_finished_at: string;
    diary_source: string;
    diary_storage_place: string;
}

export interface AuthorFiltersFromApi {
    family_statuses: FilterItem[];
    social_classes: FilterItem[];
    nationalities: FilterItem[];
    religions: FilterItem[];
    educations: FilterItem[];
    occupations: FilterItem[];
    political_parties: FilterItem[];
    cards: FilterItem[];
}

export interface AuthorShort {
    authorId: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
}

export interface AuthorResponse {
    authorId: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    sex: 'M' | 'F';
    birthDate: string;
    deathDate?: string | null;
    biography: string;
    photo?: string | null;
    hasChildren: boolean;
    familyStatusId: number;

    familyStatus?: FilterItem | null;
    socialClasses?: FilterItem[];
    nationalities?: FilterItem[];
    religions?: FilterItem[];
    education?: FilterItem[];
    occupation?: FilterItem[];
    politicalParties?: FilterItem[];
    cards?: FilterItem[];
}

export interface AuthorCreate {
    lastName: string;
    firstName: string;
    middleName: string;
    sex: 'M' | 'F';
    birthDate: string;
    deathDate: string;
    biography: string;
    photo: string;
    hasChildren: boolean;
    familyStatusId: number;

    socialClassIds: number[];
    nationalityIds: number[];
    religionIds: number[];
    educationIds: number[];
    occupationIds: number[];
    politicalPartyIds: number[];
    cardIds: number[];

    diaryStartedAt: string;
    diaryFinishedAt: string;
    diarySource: string;
    diaryStoragePlace: string;
}

export interface AuthorFilters {
    familyStatuses: FilterItem[];
    socialClasses: FilterItem[];
    nationalities: FilterItem[];
    religions: FilterItem[];
    educations: FilterItem[];
    occupations: FilterItem[];
    politicalParties: FilterItem[];
    cards: FilterItem[];
}


// Автор с атрибутами для фильтрации (GET /api/v1/authors/).
export interface AuthorDetailedFromApi {
    author_id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    sex: 'M' | 'F';
    birth_date: string;
    death_date?: string | null;
    photo?: string | null;
    has_children: boolean;
    family_status?: FilterItem | null;
    social_classes?: FilterItem[];
    nationalities?: FilterItem[];
    religions?: FilterItem[];
    education?: FilterItem[];
    occupation?: FilterItem[];
    political_parties?: FilterItem[];
    cards?: FilterItem[];
}

export interface AuthorDetailed {
    authorId: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    sex: 'M' | 'F';
    birthDate: string;
    deathDate?: string | null;
    photo?: string | null;
    hasChildren: boolean;
    familyStatus?: FilterItem | null;
    socialClasses: FilterItem[];
    nationalities: FilterItem[];
    religions: FilterItem[];
    educations: FilterItem[];
    occupations: FilterItem[];
    politicalParties: FilterItem[];
    cards: FilterItem[];
}
