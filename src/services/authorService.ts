import { axiosPublic } from '../api/classic-interceptor';
import { axiosPrivate } from '../api/interceptors';
import type {
    AuthorCreate,
    AuthorDetailed,
    AuthorDetailedFromApi,
    AuthorFilters,
    AuthorResponse,
    AuthorShort,
    AuthorShortFromApi,
    AuthorFiltersFromApi,
    AuthorResponseFromApi,
} from '../types/author/author.type';
import { authorMapper } from './mappers/author.mapper';

class AuthorService {
    async get(): Promise<AuthorShort[]> {
        const response = await axiosPublic.get<AuthorShortFromApi[]>(`/api/v1/authors/`);

        return authorMapper.toAuthorShorts(response.data);
    }

    async getAllDetailed(): Promise<AuthorDetailed[]> {
        const response = await axiosPublic.get<AuthorDetailedFromApi[]>(`/api/v1/authors/`);

        return authorMapper.toAuthorDetaileds(response.data);
    }

    // Серверная фильтрация авторов: возвращаем только id подходящих авторов.
    async getFilteredAuthorIds(
        params: Record<string, string> = {},
    ): Promise<number[]> {
        const response = await axiosPublic.get<AuthorDetailedFromApi[]>(`/api/v1/authors/`, {
            params,
        });

        return response.data.map((author) => author.author_id);
    }

    async create(data: AuthorCreate): Promise<AuthorResponse> {
        const author = authorMapper.toAuthorCreateForApi(data);

        const response = await axiosPrivate.post<AuthorResponseFromApi>(`/api/v1/authors/`, author);

        return authorMapper.toAuthorResponse(response.data);
    }

    /** Обновление существующего автора (только суперадмин). */
    async update(id: number, data: AuthorCreate): Promise<unknown> {
        const author = authorMapper.toAuthorCreateForApi(data);

        const response = await axiosPrivate.patch(`/api/v1/authors/${id}`, author);

        return response.data;
    }

    /** Удаление автора (блокируется при наличии свидетельств; суперадмин). */
    async delete(id: number): Promise<void> {
        await axiosPrivate.delete(`/api/v1/authors/${id}`);
    }

    async getFilters(): Promise<AuthorFilters> {
        const response = await axiosPublic.get<AuthorFiltersFromApi>(`/api/v1/authors/filters`);

        return authorMapper.toAuthorFilters(response.data);
    }

    async getById(id: string): Promise<AuthorResponse> {
        const response = await axiosPublic.get<AuthorResponseFromApi>(`/api/v1/authors/${id}`);

        return authorMapper.toAuthorResponse(response.data);
    }
}

export const authorService = new AuthorService();
