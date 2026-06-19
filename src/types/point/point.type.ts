import { type FilterItem } from '../common/common.types';

export interface PointResponseFromApi {
    point_id: number;
    name: string;
    rayon_id: number;
    street: string;
    building: string;
    point_type_id: number;
    point_subtype_id?: number | null;
    point_subsubtype_id?: number | null;
    description?: string | null;
    rayon?: FilterItem | null;
    point_type?: PointTypeItemFromApi | null;
    point_subtype?: FilterItem | null;
    point_subsubtype?: FilterItem | null;
    point_coordinates?: CoordinateItem[];
    note_coordinates?: NoteCoordinateItemFromApi[];
}

export interface PointCreateForApi {
    rayon_id?: number | null;
    street: string;
    building: string;
    latitude?: number | null;
    longitude?: number | null;
    point_type_id: number;
    point_subtype_id?: number | null;
    point_subsubtype_id?: number | null;
    name: string;
    description?: string | null;
}

export interface CoordinateItem {
    latitude: number;
    longitude: number;
}

export interface NoteCoordinateItemFromApi {
    note_id: number;
    latitude: number;
    longitude: number;
}

export interface NoteCoordinateItem {
    noteId: number;
    latitude: number;
    longitude: number;
}

export interface PointCoordinatesResponseFromApi {
    point_id: number;
    coordinates: CoordinateItem[];
}

export interface PointTypeItemFromApi {
    point_type_id: number;
    name: string;
    has_fixed_coordinates: boolean;
    has_address: boolean;
    point_subtypes?: PointSubTypeItemFromApi[];
}

export interface PointSubTypeItemFromApi {
    point_subtype_id: number;
    name: string;
    point_type_id?: number | null;
    point_subsubtypes?: PointSubSubTypeItemFromApi[];
}

export interface PointSubSubTypeItemFromApi {
    point_subsubtype_id: number;
    name: string;
    point_subtype_id?: number | null;
}

export interface PointInNoteFromApi {
    point_id: number;
    name: string;
    description?: string | null;
    point_coordinates?: CoordinateItem[];
}

export interface PointResponse {
    pointId: number;
    name: string;
    rayonId: number;
    street: string;
    building: string;
    pointTypeId: number;
    pointSubtypeId?: number | null;
    pointSubsubtypeId?: number | null;
    description?: string | null;
    rayon?: FilterItem | null;
    pointType?: PointTypeItem | null;
    pointSubtype?: FilterItem | null;
    pointSubsubtype?: FilterItem | null;
    pointCoordinates?: CoordinateItem[];
    noteCoordinates?: NoteCoordinateItem[];
}

export interface PointCreate {
    rayonId?: number | null;
    street: string;
    building: string;
    latitude?: number | null;
    longitude?: number | null;
    pointTypeId: number;
    pointSubtypeId?: number | null;
    pointSubsubtypeId?: number | null;
    name: string;
    description?: string | null;
}

export interface PointCoordinatesResponse {
    pointId: number;
    coordinates: CoordinateItem[];
}

export interface PointTypeItem {
    pointTypeId: number;
    name: string;
    hasFixedCoordinates: boolean;
    hasAddress: boolean;
    pointSubtypes?: PointSubTypeItem[];
}

export interface PointSubTypeItem {
    pointSubtypeId: number;
    name: string;
    pointTypeId?: number | null;
    pointSubsubtypes?: PointSubSubTypeItem[];
}

export interface PointSubSubTypeItem {
    pointSubsubtypeId: number;
    name: string;
    pointSubtypeId?: number | null;
}

export interface PointInNote {
    pointId: number;
    name: string;
    description?: string | null;
    pointCoordinates?: CoordinateItem[];
}
