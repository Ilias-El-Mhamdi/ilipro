import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from 'platform/contracts/shared/user';
import { api } from '../../../../lib/api';
import { toastSuccess, toastError } from '../../../../lib/toast';
import { CreateCompanyUserRequest } from 'platform/contracts/adminDashboard/linkUser/createCompanyUser/createCompanyUser.request';
import { UnlinkUserRequest } from 'platform/contracts/adminDashboard/linkUser/unlinkUser/unlinkUser.request';

export function useManageUsers(companySlug: string) {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirm, setConfirm] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const add = useMutation({
    mutationFn: () =>
      api.post(CreateCompanyUserRequest.buildUrl(companySlug), {
        firstName,
        lastName,
        email,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ['companies', companySlug, 'users'],
      });
      setModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      toastSuccess('Utilisateur ajouté');
    },
    onError: toastError,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api.delete(UnlinkUserRequest.buildUrl(companySlug, id)),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ['companies', companySlug, 'users'],
      });
      void qc.invalidateQueries({ queryKey: ['users'] });
      setConfirm(null);
      toastSuccess('Utilisateur retiré');
    },
    onError: toastError,
  });

  return {
    modalOpen,
    setModalOpen,
    confirm,
    setConfirm,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    add,
    remove,
  };
}
