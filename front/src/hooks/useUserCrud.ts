import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../lib/queries';
import type { Client } from '../lib/queries';
import { api } from '../lib/api';

export function useUserCrud() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: clients = [], isLoading } = useClients();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmClient, setConfirmClient] = useState<Client | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const create = useMutation({
    mutationFn: () => api.post('/clients', { firstName, lastName, email }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['clients'] });
      setModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['clients'] });
      setConfirmClient(null);
    },
  });

  return {
    clients,
    isLoading,
    navigate,
    modalOpen, setModalOpen,
    confirmClient, setConfirmClient,
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    create,
    remove,
  };
}
