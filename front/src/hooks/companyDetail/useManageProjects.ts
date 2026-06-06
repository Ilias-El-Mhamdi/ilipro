import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Project } from '../../lib/queries';
import { api } from '../../lib/api';

export function useManageProjects(companySlug: string) {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirm, setConfirm] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [docsUrl, setDocsUrl] = useState('');
  const [changelogUrl, setChangelogUrl] = useState('');

  const add = useMutation({
    mutationFn: () =>
      api.post(`/companies/${companySlug}/projects`, {
        name,
        appUrl: appUrl || null,
        docsUrl: docsUrl || null,
        changelogUrl: changelogUrl || null,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'projects'] });
      void qc.invalidateQueries({ queryKey: ['projects'] });
      setModalOpen(false);
      setName('');
      setAppUrl('');
      setDocsUrl('');
      setChangelogUrl('');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'projects'] });
      void qc.invalidateQueries({ queryKey: ['projects'] });
      setConfirm(null);
    },
  });

  return {
    modalOpen, setModalOpen,
    confirm, setConfirm,
    name, setName,
    appUrl, setAppUrl,
    docsUrl, setDocsUrl,
    changelogUrl, setChangelogUrl,
    add,
    remove,
  };
}
