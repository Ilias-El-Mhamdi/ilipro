import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Client, License, LicenseType, LicenseStatus } from '../lib/queries';
import { api } from '../lib/api';

interface Props {
  client: Client;
  license: License | null;
  companySlug: string;
  companyId: string;
  onClose: () => void;
}

export function useLicenseForm({ client, license, companySlug, companyId, onClose }: Props) {
  const qc = useQueryClient();

  const [type, setType] = useState<LicenseType>(license?.type ?? 'FREE');
  const [status, setStatus] = useState<LicenseStatus>(license?.status ?? 'ACTIVE');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    license?.projectAccess.map((p) => p.projectId) ?? [],
  );
  const [machineLock, setMachineLock] = useState(license?.machineLock ?? false);
  const [maxMachines, setMaxMachines] = useState(license?.maxMachines ?? 1);
  const [validUntil, setValidUntil] = useState(
    license?.validUntil ? license.validUntil.slice(0, 10) : '',
  );
  const [priceLabel, setPriceLabel] = useState(license?.priceLabel ?? '');

  function invalidate() {
    void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
    void qc.invalidateQueries({ queryKey: ['clients', client.id, 'license'] });
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        type,
        status,
        projectIds: type === 'ADMIN' ? [] : selectedProjectIds,
        machineLock,
        maxMachines,
        validUntil: type === 'FREE' && validUntil ? validUntil : null,
        priceLabel: type === 'CLASSIC' && priceLabel ? priceLabel : null,
      };
      if (license) return api.patch(`/licenses/${license.id}`, payload);
      return api.post('/licenses', { ...payload, clientId: client.id, companyId });
    },
    onSuccess: () => { invalidate(); onClose(); },
  });

  const revokeMutation = useMutation({
    mutationFn: () => api.delete(`/licenses/${license!.id}`),
    onSuccess: () => { invalidate(); onClose(); },
  });

  const removeMachineMutation = useMutation({
    mutationFn: (machineId: string) => api.delete(`/licenses/${license!.id}/machines/${machineId}`),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['clients', client.id, 'license'] }); },
  });

  const billingPortalMutation = useMutation({
    mutationFn: () =>
      api.post('/stripe/billing-portal', { clientId: client.id }).then((r) => r.data as { url: string }),
    onSuccess: ({ url }) => window.open(url, '_blank'),
  });

  const simulateMutation = useMutation({
    mutationFn: () =>
      api.post('/stripe/dev/simulate', {
        email: client.email,
        name: `${client.firstName} ${client.lastName}`,
        companyId,
      }),
    onSuccess: () => { invalidate(); onClose(); },
  });

  function toggleProject(id: string) {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  return {
    type, setType,
    status, setStatus,
    selectedProjectIds,
    machineLock, setMachineLock,
    maxMachines, setMaxMachines,
    validUntil, setValidUntil,
    priceLabel, setPriceLabel,
    machines: license?.machines ?? [],
    toggleProject,
    saveMutation,
    revokeMutation,
    removeMachineMutation,
    billingPortalMutation,
    simulateMutation,
  };
}
