import { axiosPublic } from '../api/classic-interceptor';
import { axiosPrivate } from '../api/interceptors';
import type {
    AuthorCreate,
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

    async create(data: AuthorCreate): Promise<AuthorResponse> {
        const author = authorMapper.toAuthorCreateForApi(data);

        const response = await axiosPrivate.post<AuthorResponseFromApi>(`/api/v1/authors/`, author);

        return authorMapper.toAuthorResponse(response.data);
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
