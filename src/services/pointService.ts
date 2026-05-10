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
import type { NoteShort, NoteShortFromApi } from '../types/note/note.type';
import { noteMapper } from './mappers/note.mapper';
import { axiosPrivate } from '../api/interceptors';

class PointService {
    async getPointTypes(): Promise<PointTypeItem[]> {
        const response = await axiosPublic.get<PointTypeItemFromApi[]>('/points/filters');

        return pointMapper.toPointItems(response.data);
    }

    async getPointById(pointId: string): Promise<PointResponse> {
        const response = await axiosPublic.get<PointResponseFromApi>(`/points/${pointId}`);

        return pointMapper.toPointRespose(response.data);
    }

    async getCoordinatesOfPoint(pointId: string): Promise<PointCoordinatesResponse> {
        const response = await axiosPublic.get<PointCoordinatesResponseFromApi>(
            `/points/${pointId}/coordinates`,
        );

        return pointMapper.toPointCoordinatesResponse(response.data);
    }

    async addCoordinates(pointId: string, data: CoordinateItem): Promise<unknown> {
        const response = await axiosPrivate.post(`/points/${pointId}/coordinates`, data);

        return response.data;
    }

    async getNotesByPoint(pointId: string): Promise<NoteShort[]> {
        const response = await axiosPublic.get<NoteShortFromApi[]>(`/points/${pointId}/notes`);

        return noteMapper.toNoteShorts(response.data);
    }

    async createPoint(data: PointCreate): Promise<PointResponse> {
        const point = pointMapper.toPointCreateForApi(data);
        const response = await axiosPrivate.post<PointResponseFromApi>('/points/', point);

        return pointMapper.toPointRespose(response.data);
    }

    async getAll(): Promise<PointResponse[]> {
        const response = await axiosPublic.get<PointResponseFromApi[]>('/points/')

        return pointMapper.toManyPointResponse(response.data)
    }
}

export const pointService = new PointService();
