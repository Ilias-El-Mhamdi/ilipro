import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../lib/queries';
import type { User } from '../lib/queries';
import { api } from '../lib/api';
import { toastSuccess, toastError } from '../lib/toast';

export function useUserCrud() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useUsers();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const create = useMutation({
    mutationFn: () => api.post('/users', { firstName, lastName, email }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] });
      setModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      toastSuccess('Utilisateur créé');
    },
    onError: toastError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] });
      setConfirmUser(null);
      toastSuccess('Utilisateur supprimé');
    },
    onError: toastError,
  });

  return {
    users,
    isLoading,
    navigate,
    modalOpen, setModalOpen,
    confirmUser, setConfirmUser,
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    create,
    remove,
  };
}
