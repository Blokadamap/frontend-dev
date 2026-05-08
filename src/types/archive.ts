export type ArchivePanel = 'filters' | 'results' | null;
export type FilterTab = 'general' | 'person' | 'place';
export type MapLayerId = 'modern' | 'retro' | 'topo';
export type Gender = 'Мужской' | 'Женский';
export type PartyStatus = 'Партийный' | 'Беспартийный';
export type WitnessKind = 'Личное' | 'С чужих слов (слухи)' | 'Опосредованное свидетельство';
export type RetrospectiveKind = 'Свидетельство' | 'Воспоминание';
export type SignificanceKind = 'Общегородская' | 'Микрособытие';

export interface Author {
    id: string;
    fullName: string;
    birthDate: string;
    gender: Gender;
    partyStatus: PartyStatus;
    description: string;
}

export interface LocationRecord {
    id: string;
    title: string;
    district: string;
    space: string;
    street: string;
    building: string;
    address: string;
    coordinates: [number, number];
    previewImage: string;
}

export interface Testimony {
    id: string;
    authorId: string;
    locationId: string;
    title: string;
    date: string;
    summary: string;
    content: string;
    witnessKind: WitnessKind;
    retrospectiveKind: RetrospectiveKind;
    significance: SignificanceKind;
    tags: string[];
}

export interface ArchivePayload {
    authors: Author[];
    locations: LocationRecord[];
    testimonies: Testimony[];
}

export interface WitnessRecord {
    id: string;
    title: string;
    date: string;
    summary: string;
    content: string;
    searchIndex: string;
    witnessKind: WitnessKind;
    retrospectiveKind: RetrospectiveKind;
    significance: SignificanceKind;
    tags: string[];
    author: Author;
    location: LocationRecord;
    markerPosition: [number, number];
}

export interface ArchiveFilters {
    startDate: string;
    endDate: string;
    witnessKinds: WitnessKind[];
    retrospectiveKinds: RetrospectiveKind[];
    significances: SignificanceKind[];
    tags: string[];
    authorId: string;
    birthDateStart: string;
    birthDateEnd: string;
    genders: Gender[];
    partyStatuses: PartyStatus[];
    district: string;
    space: string;
    street: string;
    building: string;
    address: string;
}
