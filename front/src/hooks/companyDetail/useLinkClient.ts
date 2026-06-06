import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Client } from '../../lib/queries';
import { api } from '../../lib/api';

export function useLinkClient(companySlug: string, clients: Client[], allClients: Client[]) {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const linkedIds = useMemo(() => new Set(clients.map((c) => c.id)), [clients]);

  const linkable = useMemo(() => {
    const q = search.toLowerCase();
    return allClients.filter((c) => {
      if (linkedIds.has(c.id)) return false;
      if (!q) return true;
      return `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(q);
    });
  }, [allClients, linkedIds, search]);

  const mutation = useMutation({
    mutationFn: (clientId: string) =>
      api.patch(`/companies/${companySlug}/clients/${clientId}/link`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
      setModalOpen(false);
      setSearch('');
      setSelectedId(null);
    },
  });

  return {
    modalOpen, setModalOpen,
    search, setSearch,
    selectedId, setSelectedId,
    linkable,
    mutation,
  };
}
