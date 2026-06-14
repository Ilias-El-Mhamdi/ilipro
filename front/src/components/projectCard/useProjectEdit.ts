import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Project } from 'platform/contracts/shared/project';
import { api } from '../../lib/api';
import { toastSuccess, toastError } from '../../lib/toast';
import { UpdateProjectRequest } from 'platform/contracts/adminDashboard/projects/updateProject/updateProject.request';

export function useProjectEdit(project: Project, companySlug: string) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [appUrl, setAppUrl] = useState(project.appUrl ?? '');
  const [docsUrl, setDocsUrl] = useState(project.docsUrl ?? '');
  const [changelogUrl, setChangelogUrl] = useState(project.changelogUrl ?? '');

  const mutation = useMutation({
    mutationFn: () =>
      api.patch(UpdateProjectRequest.buildUrl(project.id), {
        name: name.trim() || project.name,
        appUrl: appUrl || null,
        docsUrl: docsUrl || null,
        changelogUrl: changelogUrl || null,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ['companies', companySlug, 'projects'],
      });
      void qc.invalidateQueries({ queryKey: ['projects'] });
      setOpen(false);
      toastSuccess('Projet mis à jour');
    },
    onError: toastError,
  });

  function openModal() {
    setName(project.name);
    setAppUrl(project.appUrl ?? '');
    setDocsUrl(project.docsUrl ?? '');
    setChangelogUrl(project.changelogUrl ?? '');
    setOpen(true);
  }

  return {
    open,
    setOpen,
    name,
    setName,
    appUrl,
    setAppUrl,
    docsUrl,
    setDocsUrl,
    changelogUrl,
    setChangelogUrl,
    mutation,
    openModal,
  };
}
