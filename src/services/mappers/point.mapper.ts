import type {
    PointCoordinatesResponse,
    PointCoordinatesResponseFromApi,
    PointCreate,
    PointCreateForApi,
    PointResponse,
    PointResponseFromApi,
    PointSubSubTypeItem,
    PointSubSubTypeItemFromApi,
    PointSubTypeItem,
    PointSubTypeItemFromApi,
    PointTypeItem,
    PointTypeItemFromApi,
} from '../../types/point/point.type';

class PointMapper {
    toPointItems(data: PointTypeItemFromApi[]): PointTypeItem[] {
        return data.map((item) => ({
            pointTypeId: item.point_type_id,
            name: item.name,
            hasFixedCoordinates: item.has_fixed_coordinates,
            hasAddress: item.has_address,
            pointSubtypes: item.point_subtypes?.map((item) => this.toPointSubTypes(item)),
        }));
    }

    toPointRespose(data: PointResponseFromApi): PointResponse {
        return {
            pointId: data.point_id,
            name: data.name,
            rayonId: data.rayon_id,
            street: data.street,
            building: data.building,
            pointTypeId: data.point_type_id,
            pointSubtypeId: data.point_subtype_id,
            pointSubsubtypeId: data.point_subsubtype_id,
            description: data.description,
            rayon: data.rayon,
            pointType: this.toPointTypeItem(data.point_type),
            pointSubtype: data.point_subtype,
            pointSubsubtype: data.point_subsubtype,
            pointCoordinates: data.point_coordinates,
        };
    }

    toManyPointResponse(data: PointResponseFromApi[]): PointResponse[] {
        return data.map((item) => {
            return {
                pointId: item.point_id,
                name: item.name,
                rayonId: item.rayon_id,
                street: item.street,
                building: item.building,
                pointTypeId: item.point_type_id,
                pointSubtypeId: item.point_subtype_id,
                pointSubsubtypeId: item.point_subsubtype_id,
                description: item.description,
                rayon: item.rayon,
                pointType: this.toPointTypeItem(item.point_type),
                pointSubtype: item.point_subtype,
                pointSubsubtype: item.point_subsubtype,
                pointCoordinates: item.point_coordinates,
            };
        });
    }

    toPointCoordinatesResponse(data: PointCoordinatesResponseFromApi): PointCoordinatesResponse {
        return {
            pointId: data.point_id,
            coordinates: data.coordinates,
        };
    }

    toPointCreateForApi(data: PointCreate): PointCreateForApi {
        return {
            rayon_id: data.rayonId,
            street: data.street,
            building: data.building,
            latitude: data.latitude,
            longitude: data.longitude,
            point_type_id: data.pointTypeId,
            point_subtype_id: data.pointSubtypeId,
            point_subsubtype_id: data.pointSubsubtypeId,
            name: data.name,
            description: data.description,
        };
    }

    toPointTypeItem(data?: PointTypeItemFromApi | null): PointTypeItem | null {
        if (!data) return null;

        return {
            pointTypeId: data.point_type_id,
            name: data.name,
            hasFixedCoordinates: data.has_fixed_coordinates,
            hasAddress: data.has_address,
            pointSubtypes: data.point_subtypes?.map((item) => this.toPointSubTypes(item)),
        };
    }

    toPointSubTypes(data: PointSubTypeItemFromApi): PointSubTypeItem {
        return {
            pointSubtypeId: data.point_subtype_id,
            name: data.name,
            pointTypeId: data.point_type_id,
            pointSubsubtypes: data.point_subsubtypes?.map((item) => this.toPointSubSubTypes(item)),
        };
    }

    toPointSubSubTypes(data: PointSubSubTypeItemFromApi): PointSubSubTypeItem {
        return {
            pointSubsubtypeId: data.point_subsubtype_id,
            name: data.name,
            pointSubtypeId: data.point_subtype_id,
        };
    }
}

export const pointMapper = new PointMapper();
