import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserDetail } from '../../../lib/queries';
import { api } from '../../../lib/api';
import { toastSuccess, toastError } from '../../../lib/toast';

export function useEditUser(user: UserDetail) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [firstNameDraft, setFirstNameDraft] = useState('');
  const [lastNameDraft, setLastNameDraft] = useState('');

  function openModal() {
    setFirstNameDraft(user.firstName);
    setLastNameDraft(user.lastName);
    setOpen(true);
  }

  const update = useMutation({
    mutationFn: () =>
      api.patch(`/users/${user.id}`, {
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
    open, setOpen,
    firstNameDraft, setFirstNameDraft,
    lastNameDraft, setLastNameDraft,
    openModal,
    update,
  };
}
