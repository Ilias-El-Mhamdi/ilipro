import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { VersionRequest } from 'contracts/system/version/version.request';
import { VersionResponseClass } from 'contracts/system/version/version.response';
import type { VersionResponse } from 'contracts/system/version/version.response';

export function useBackVersion() {
  return useQuery<VersionResponse>({
    queryKey: ['version'],
    queryFn: () =>
      api
        .get(VersionRequest.buildUrl())
        .then((r) => VersionResponseClass.fromJson(r.data)),
    staleTime: Infinity,
  });
}
