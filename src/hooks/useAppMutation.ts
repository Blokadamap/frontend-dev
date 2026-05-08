import {
    useMutation,
    type UseMutationOptions,
    type MutationFunction,
    useQueryClient,
    type MutationKey,
    type QueryKey,
} from '@tanstack/react-query';

interface AppMutationProps<
    TData,
    TError = Error,
    TVariables = void,
    TContext = unknown,
> extends Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    'mutationFn' | 'mutationKey'
> {
    mutationFn: MutationFunction<TData, TVariables>;
    mutationKey: MutationKey;
    queryKey: QueryKey;
}

export function useAppMutation<
    TData = unknown,
    TError = Error,
    TVariables = void,
    TContext = unknown,
>({
    mutationFn,
    mutationKey,
    queryKey,
    onSuccess,
    ...options
}: AppMutationProps<TData, TError, TVariables, TContext>) {
    const client = useQueryClient();

    return useMutation<TData, TError, TVariables, TContext>({
        ...options,
        mutationKey,
        mutationFn,
        onSuccess(data, variables, onMutateResult, context) {
            client.invalidateQueries({
                queryKey: queryKey,
            });

            if (onSuccess) {
                onSuccess(data, variables, onMutateResult, context);
            }
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
    });
}
