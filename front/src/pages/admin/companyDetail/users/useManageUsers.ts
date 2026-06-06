import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '../../../../lib/queries';
import { api } from '../../../../lib/api';

export function useManageUsers(companySlug: string) {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirm, setConfirm] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const add = useMutation({
    mutationFn: () =>
      api.post(`/companies/${companySlug}/users`, { firstName, lastName, email }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'users'] });
      setModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/companies/${companySlug}/users/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'users'] });
      void qc.invalidateQueries({ queryKey: ['users'] });
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
