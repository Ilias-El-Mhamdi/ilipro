import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Deliverable } from '../../lib/queries';
import { api } from '../../lib/api';
import { toastSuccess, toastError } from '../../lib/toast';

export function useDeliverableActions(projectId: string) {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState<Deliverable | null>(null);

  const upload = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post(`/projects/${projectId}/deliverables`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects', projectId, 'deliverables'] });
      toastSuccess('Fichier uploadé');
    },
    onError: toastError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/deliverables/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects', projectId, 'deliverables'] });
      setConfirm(null);
      toastSuccess('Fichier supprimé');
    },
    onError: toastError,
  });

  function handleFiles(files: File[]) {
    files.forEach((file) => upload.mutate(file));
  }

  return { confirm, setConfirm, upload, remove, handleFiles };
}
