import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Client } from '../../lib/queries';
import { api } from '../../lib/api';

export function useManageClients(companySlug: string) {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirm, setConfirm] = useState<Client | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const add = useMutation({
    mutationFn: () =>
      api.post(`/companies/${companySlug}/clients`, { firstName, lastName, email }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
      setModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/companies/${companySlug}/clients/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
      void qc.invalidateQueries({ queryKey: ['clients'] });
      setConfirm(null);
    },
  });

  return {
    modalOpen, setModalOpen,
    confirm, setConfirm,
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    add,
    remove,
  };
}
