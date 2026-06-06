import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export function useRenameCompany(companySlug: string) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const mutation = useMutation({
    mutationFn: (name: string) => api.patch(`/companies/${companySlug}/name`, { name }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies'] });
      setEditing(false);
    },
  });

  return { editing, setEditing, draft, setDraft, mutation };
}
