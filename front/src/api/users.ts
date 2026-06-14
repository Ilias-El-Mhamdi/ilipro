import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ListUsersRequest } from 'contracts/adminDashboard/users/listUsers/listUsers.request';
import { GetUserRequest } from 'contracts/adminDashboard/users/getUser/getUser.request';
import { ReadProfileRequest } from 'contracts/userDashboard/readProfile/readProfile.request';
import { User } from 'contracts/shared/user';
import { ReadProfileResponse } from 'contracts/userDashboard/readProfile/readProfile.response';

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () =>
      api
        .get(ListUsersRequest.buildUrl())
        .then((r) => User.fromJsonList(r.data)),
  });
}

export function useUser(id: string) {
  return useQuery<User>({
    queryKey: ['users', id],
    queryFn: () =>
      api.get(GetUserRequest.buildUrl(id)).then((r) => User.fromJson(r.data)),
    enabled: !!id,
  });
}

export function useUserBySlug(slug: string) {
  return useQuery<ReadProfileResponse>({
    queryKey: ['users', 'slug', slug],
    queryFn: () =>
      api
        .get(ReadProfileRequest.buildUrl(slug))
        .then((r) => ReadProfileResponse.fromJson(r.data)),
    enabled: !!slug,
  });
}
