import type { AxiosError } from 'axios';
import { pointService } from '../../services/pointService';
import type { FilterItem } from '../../types/common/common.types';
import { useAppQuery } from '../useAppQuery';

export const useRayons = () => {
    return useAppQuery<FilterItem[], AxiosError>({
        queryKey: ['rayons'],
        queryFn: () => pointService.getRayons(),
    });
};
