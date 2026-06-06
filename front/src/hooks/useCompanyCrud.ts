import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '../lib/queries';
import type { Company } from '../lib/queries';
import { api } from '../lib/api';

export function useCompanyCrud() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: companies = [], isLoading } = useCompanies();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [name, setName] = useState('');

  const create = useMutation({
    mutationFn: (n: string) => api.post('/companies', { name: n }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['companies'] }); closeModal(); },
  });

  const update = useMutation({
    mutationFn: ({ slug, n }: { slug: string; n: string }) => api.put(`/companies/${slug}`, { name: n }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['companies'] }); closeModal(); },
  });

  const remove = useMutation({
    mutationFn: (slug: string) => api.delete(`/companies/${slug}`),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['companies'] }); setConfirmId(null); },
  });

  function openCreate() {
    setEditing(null);
    setName('');
    setModalOpen(true);
  }

  function openEdit(e: React.MouseEvent, company: Company) {
    e.stopPropagation();
    setEditing(company);
    setName(company.name);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setName('');
    setEditing(null);
  }

  function submit() {
    if (!name.trim()) return;
    if (editing) update.mutate({ slug: editing.slug, n: name });
    else create.mutate(name);
  }

  const confirmCompany = companies.find((c) => c.id === confirmId);

  return {
    companies,
    isLoading,
    navigate,
    modalOpen,
    editing,
    confirmId, setConfirmId,
    name, setName,
    create,
    update,
    remove,
    openCreate,
    openEdit,
    closeModal,
    submit,
    confirmCompany,
  };
}
