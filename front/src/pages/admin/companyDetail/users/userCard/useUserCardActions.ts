import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from 'contracts/shared/user';
import { api } from '../../../../../lib/api';
import { toastSuccess, toastError } from '../../../../../lib/toast';
import { UpdateUserRequest } from 'contracts/adminDashboard/users/updateUser/updateUser.request';

export function useUserCardActions(user: User, companySlug: string) {
  const qc = useQueryClient();

  const [firstNameDraft, setFirstNameDraft] = useState(user.firstName ?? '');
  const [lastNameDraft, setLastNameDraft] = useState(user.lastName ?? '');
  const [editModalOpen, setEditModalOpen] = useState(false);

  const updateUser = useMutation({
    mutationFn: () =>
      api.patch(UpdateUserRequest.buildUrl(user.id), {
        firstName: firstNameDraft.trim(),
        lastName: lastNameDraft.trim(),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ['companies', companySlug, 'users'],
      });
      setEditModalOpen(false);
      toastSuccess('Utilisateur mis à jour');
    },
    onError: toastError,
  });

  function openEditModal() {
    setFirstNameDraft(user.firstName ?? '');
    setLastNameDraft(user.lastName ?? '');
    setEditModalOpen(true);
  }

  return {
    firstNameDraft,
    setFirstNameDraft,
    lastNameDraft,
    setLastNameDraft,
    editModalOpen,
    setEditModalOpen,
    updateUser,
    openEditModal,
  };
}
