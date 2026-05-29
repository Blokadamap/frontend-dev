import { axiosPublic } from '../api/classic-interceptor';
import type {
    CoordinateItem,
    PointCoordinatesResponse,
    PointCoordinatesResponseFromApi,
    PointCreate,
    PointResponse,
    PointResponseFromApi,
    PointTypeItem,
    PointTypeItemFromApi,
} from '../types/point/point.type';
import { pointMapper } from './mappers/point.mapper';
import type { NoteResponse, NoteResponseFromApi } from '../types/note/note.type';
import { noteMapper } from './mappers/note.mapper';
import { axiosPrivate } from '../api/interceptors';

class PointService {
    async getPointTypes(): Promise<PointTypeItem[]> {
        const response = await axiosPublic.get<PointTypeItemFromApi[]>('/api/v1/points/filters');

        return pointMapper.toPointItems(response.data);
    }

    async getPointById(pointId: number): Promise<PointResponse> {
        const response = await axiosPublic.get<PointResponseFromApi>(`/api/v1/points/${pointId}`);

        return pointMapper.toPointRespose(response.data);
    }

    async getCoordinatesOfPoint(pointId: string): Promise<PointCoordinatesResponse> {
        const response = await axiosPublic.get<PointCoordinatesResponseFromApi>(
            `/api/v1/points/${pointId}/coordinates`,
        );

        return pointMapper.toPointCoordinatesResponse(response.data);
    }

    async addCoordinates(pointId: string, data: CoordinateItem): Promise<unknown> {
        const response = await axiosPrivate.post(`/api/v1/points/${pointId}/coordinates`, data);

        return response.data;
    }

    async getNotesByPoint(pointId: string): Promise<NoteResponse[]> {
        const response = await axiosPublic.get<NoteResponseFromApi[]>(`/api/v1/points/${pointId}/notes`);

        return noteMapper.toManyNoteResponse(response.data);
    }

    async createPoint(data: PointCreate): Promise<PointResponse> {
        const point = pointMapper.toPointCreateForApi(data);
        const response = await axiosPrivate.post<PointResponseFromApi>('/api/v1/points/', point);

        return pointMapper.toPointRespose(response.data);
    }

    async getAll(): Promise<PointResponse[]> {
        const response = await axiosPublic.get<PointResponseFromApi[]>('/api/v1/points/')

        return pointMapper.toManyPointResponse(response.data)
    }
}

export const pointService = new PointService();
