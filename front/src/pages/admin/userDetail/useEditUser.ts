import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ReadProfileResponse } from 'platform/contracts/userDashboard/readProfile/readProfile.response';
import { api } from '../../../lib/api';
import { toastSuccess, toastError } from '../../../lib/toast';
import { UpdateUserRequest } from 'platform/contracts/adminDashboard/users/updateUser/updateUser.request';

export function useEditUser(user: ReadProfileResponse) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [firstNameDraft, setFirstNameDraft] = useState('');
  const [lastNameDraft, setLastNameDraft] = useState('');

  function openModal() {
    setFirstNameDraft(user.firstName ?? '');
    setLastNameDraft(user.lastName ?? '');
    setOpen(true);
  }

  const update = useMutation({
    mutationFn: () =>
      api.patch(UpdateUserRequest.buildUrl(user.id), {
        firstName: firstNameDraft.trim(),
        lastName: lastNameDraft.trim(),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users', 'slug', user.slug] });
      setOpen(false);
      toastSuccess('Utilisateur mis à jour');
    },
    onError: toastError,
  });

  return {
    open,
    setOpen,
    firstNameDraft,
    setFirstNameDraft,
    lastNameDraft,
    setLastNameDraft,
    openModal,
    update,
  };
}
