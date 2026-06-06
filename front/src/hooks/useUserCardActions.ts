import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Client } from '../lib/queries';
import { api } from '../lib/api';

export function useUserCardActions(client: Client, companySlug: string) {
  const qc = useQueryClient();

  const [firstNameDraft, setFirstNameDraft] = useState(client.firstName);
  const [lastNameDraft, setLastNameDraft] = useState(client.lastName);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const updateClient = useMutation({
    mutationFn: () =>
      api.patch(`/clients/${client.id}`, {
        firstName: firstNameDraft.trim(),
        lastName: lastNameDraft.trim(),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
      setEditModalOpen(false);
    },
  });

  function openEditModal() {
    setFirstNameDraft(client.firstName);
    setLastNameDraft(client.lastName);
    setEditModalOpen(true);
  }

  return {
    firstNameDraft, setFirstNameDraft,
    lastNameDraft, setLastNameDraft,
    editModalOpen, setEditModalOpen,
    updateClient,
    openEditModal,
  };
}
