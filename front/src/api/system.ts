import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useBackVersion() {
    return useQuery<{ version: string }>({
        queryKey: ['version'],
        queryFn: () => api.get('/version').then((r) => r.data),
        staleTime: Infinity,
    });
}
