import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ReadLicenseRequest } from 'platform/contracts/userDashboard/readLicense/readLicense.request';
import { License } from 'platform/contracts/shared/license';

export function useUserLicense(userId: string) {
  return useQuery<License>({
    queryKey: ['users', userId, 'license'],
    queryFn: () =>
      api
        .get(ReadLicenseRequest.buildUrl(userId))
        .then((r) => License.fromJson(r.data)),
    retry: false,
  });
}
