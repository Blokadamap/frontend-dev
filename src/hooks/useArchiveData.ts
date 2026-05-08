import { useQuery } from '@tanstack/react-query';
import { getArchiveData } from '../services/archiveService';
import { buildWitnessRecords } from '../utils/archive';

export function useArchiveData() {
    return useQuery({
        queryKey: ['archive'],
        queryFn: getArchiveData,
        select: buildWitnessRecords,
        staleTime: Infinity,
        gcTime: Infinity,
    });
}
