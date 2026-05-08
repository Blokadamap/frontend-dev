import {
    useQuery,
    type UseQueryOptions,
    type QueryKey,
    type QueryFunction,
} from '@tanstack/react-query';

interface AppQueryProps<TData, TError = Error> extends Omit<
    UseQueryOptions<TData, TError, TData>,
    'queryKey' | 'queryFn'
> {
    queryKey: QueryKey;
    queryFn: QueryFunction<TData>;
    showErrorToast?: boolean;
}

const DEFAULTS = {
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
} satisfies Partial<UseQueryOptions>;

export function useAppQuery<TData = unknown, TError = Error>({
    queryKey,
    queryFn,
    showErrorToast = false,
    ...options
}: AppQueryProps<TData, TError>) {
    return useQuery<TData, TError>({
        ...DEFAULTS,
        ...options,
        queryKey,
        queryFn: async (context) => {
            try {
                return await queryFn(context);
            } catch (error) {
                if (showErrorToast) {
                    // toast.error(...)
                }
                throw error;
            }
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
    });
}
