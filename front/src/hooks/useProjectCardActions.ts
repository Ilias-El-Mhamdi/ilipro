import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Project, Deliverable } from '../lib/queries';
import { api } from '../lib/api';

export function useProjectCardActions(project: Project, companySlug: string) {
  const qc = useQueryClient();

  const [idCopied, setIdCopied] = useState(false);
  const [confirmDeliverable, setConfirmDeliverable] = useState<Deliverable | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(project.name);
  const [appUrl, setAppUrl] = useState(project.appUrl ?? '');
  const [docsUrl, setDocsUrl] = useState(project.docsUrl ?? '');
  const [changelogUrl, setChangelogUrl] = useState(project.changelogUrl ?? '');

  function copyProjectId() {
    void navigator.clipboard.writeText(project.id).then(() => {
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 1500);
    });
  }

  const uploadDeliverable = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post(`/projects/${project.id}/deliverables`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects', project.id, 'deliverables'] });
    },
  });

  const removeDeliverable = useMutation({
    mutationFn: (id: string) => api.delete(`/deliverables/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects', project.id, 'deliverables'] });
      setConfirmDeliverable(null);
    },
  });

  const updateProject = useMutation({
    mutationFn: () =>
      api.patch(`/projects/${project.id}`, {
        name: nameDraft.trim() || project.name,
        appUrl: appUrl || null,
        docsUrl: docsUrl || null,
        changelogUrl: changelogUrl || null,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'projects'] });
      void qc.invalidateQueries({ queryKey: ['projects'] });
      setEditModalOpen(false);
    },
  });

  function handleFiles(files: File[]) {
    files.forEach((file) => uploadDeliverable.mutate(file));
  }

  function openEditModal() {
    setNameDraft(project.name);
    setAppUrl(project.appUrl ?? '');
    setDocsUrl(project.docsUrl ?? '');
    setChangelogUrl(project.changelogUrl ?? '');
    setEditModalOpen(true);
  }

  return {
    idCopied,
    copyProjectId,
    confirmDeliverable,
    setConfirmDeliverable,
    editModalOpen,
    setEditModalOpen,
    nameDraft, setNameDraft,
    appUrl, setAppUrl,
    docsUrl, setDocsUrl,
    changelogUrl, setChangelogUrl,
    uploadDeliverable,
    removeDeliverable,
    updateProject,
    handleFiles,
    openEditModal,
  };
}
